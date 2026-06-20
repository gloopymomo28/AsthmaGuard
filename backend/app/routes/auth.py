from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import datetime, timedelta, timezone
import secrets
import resend
import jwt
from app.config import settings
from app.schemas.auth import MagicLinkRequest, VerifyTokenRequest, TokenResponse
import app.database

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

resend.api_key = settings.RESEND_API_KEY

def is_authorized(email: str) -> bool:
    if not settings.AUTHORIZED_EMAILS:
        return True # If no whitelist is defined, allow all
    whitelist = [e.strip().lower() for e in settings.AUTHORIZED_EMAILS.split(",")]
    return email.lower() in whitelist

@router.post("/send-magic-link")
async def send_magic_link(req: MagicLinkRequest, request: Request):
    email = req.email.lower()
    
    if not is_authorized(email):
        raise HTTPException(status_code=403, detail="Email not authorized to access the portal.")

    # Generate a random 32-character token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    # Store token in MongoDB
    await app.database.db["magic_links"].insert_one({
        "email": email,
        "token": token,
        "expires_at": expires_at
    })

    # Construct the magic link URL dynamically based on the frontend origin
    origin = request.headers.get("origin", "http://localhost:5173")
    magic_link = f"{origin}/verify?token={token}&email={email}"
    
    # Send email via Resend
    try:
        r = resend.Emails.send({
            "from": "AsthmaGuard <onboarding@resend.dev>",
            "to": email,
            "subject": "Login to AsthmaGuard",
            "html": f"""
            <h2>AsthmaGuard Physician Portal</h2>
            <p>Click the secure link below to login to your dashboard. This link expires in 15 minutes.</p>
            <a href='{magic_link}' style='display:inline-block;padding:12px 24px;background-color:#6366f1;color:white;text-decoration:none;border-radius:8px;'>Secure Login</a>
            <p>If you did not request this, please ignore this email.</p>
            """
        })
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to send email")

    return {"message": "Magic link sent to your email."}

@router.post("/verify", response_model=TokenResponse)
async def verify_token(req: VerifyTokenRequest):
    record = await app.database.db["magic_links"].find_one({"token": req.token, "email": req.email.lower()})
    
    if not record:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    if record["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        await app.database.db["magic_links"].delete_one({"_id": record["_id"]})
        raise HTTPException(status_code=401, detail="Token has expired")

    # Token is valid. Issue JWT
    payload = {
        "sub": req.email.lower(),
        "exp": datetime.now(timezone.utc) + timedelta(days=7) # 7-day session
    }
    jwt_token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
    
    # Delete the used magic link
    await app.database.db["magic_links"].delete_one({"_id": record["_id"]})

    return TokenResponse(access_token=jwt_token)
