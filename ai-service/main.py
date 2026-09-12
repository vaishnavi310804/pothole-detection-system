from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager

from config import HOST, PORT
from model.loader import get_yolo_model
from services.inference import run_image_inference

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load YOLO model once on startup
    print("Pre-loading YOLO model on FastAPI startup...")
    get_yolo_model()
    yield
    print("Shutting down AI service...")

app = FastAPI(
    title="OK Driver AI Pothole Detection Service",
    description="Microservice for AI-powered pothole detection using YOLO",
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

@app.get("/health")
def health_check():
    return {"status": "AI service running"}

@app.get("/")
def read_root():
    return {"message": "OK Driver AI Pothole Detection Microservice"}

@app.post("/detect")
async def detect_pothole(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Validate content type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types and not file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type '{file.content_type}'. Please upload a JPG or PNG image."
        )

    try:
        contents = await file.read()
        result = run_image_inference(contents)
        return result
    except Exception as e:
        print(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
