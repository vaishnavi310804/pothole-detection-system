from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager

from config import HOST, PORT
from model.loader import get_yolo_model
from services.inference import run_image_inference
from services.video_inference import run_video_inference

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
    
    filename_lower = file.filename.lower() if file.filename else ""
    content_type = file.content_type.lower() if file.content_type else ""

    allowed_image_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    allowed_image_exts = ('.jpg', '.jpeg', '.png', '.webp')

    allowed_video_types = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm", "video/mpeg", "video/avi"]
    allowed_video_exts = ('.mp4', '.mov', '.avi', '.webm', '.mpeg')

    is_image = content_type in allowed_image_types or filename_lower.endswith(allowed_image_exts)
    is_video = content_type in allowed_video_types or filename_lower.endswith(allowed_video_exts) or content_type.startswith("video/")

    if not is_image and not is_video:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type '{file.content_type}'. Please upload an image (JPG, PNG) or supported video (MP4, MOV, AVI, WEBM)."
        )

    try:
        contents = await file.read()
        if is_video:
            result = run_video_inference(contents, filename=file.filename or "video.mp4")
        else:
            result = run_image_inference(contents)
        return result
    except ValueError as ve:
        print(f"Validation/video error: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)

