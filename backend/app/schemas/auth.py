from pydantic import BaseModel, EmailStr
from typing import Optional

class MagicLinkRequest(BaseModel):
    email: EmailStr

class VerifyTokenRequest(BaseModel):
    token: str
    email: EmailStr

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
