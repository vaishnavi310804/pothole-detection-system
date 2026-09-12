import os
from ultralytics import YOLO

class ModelLoader:
    _instance = None
    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            model_dir = os.path.dirname(__file__)
            model_path = os.path.join(model_dir, "pothole_yolov8n.pt")
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found at {model_path}. Please run verification download first.")
            print(f"Loading YOLOv8 Pothole Model from {model_path}...")
            cls._model = YOLO(model_path)
            print("Model loaded successfully into memory.")
        return cls._model

def get_yolo_model():
    return ModelLoader.get_model()
