from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import patients, predictions, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    predictions.init_model()
    yield
    await close_mongo_connection()

app = FastAPI(
    title="Asthma Flare-up Prediction API",
    description="Backend for multimodal PatchTST with Deep Survival Analysis",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import WebSocket, WebSocketDisconnect
from app.websockets import manager

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(predictions.router)

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect messages from clients, but we need to keep connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Asthma Prediction API",
        "docs_url": "/docs",
        "health": "OK"
    }
