import os
import tempfile
import cv2
from PIL import Image
from model.loader import get_yolo_model
from services.severity import calculate_severity
from services.inference import CONFIDENCE_THRESHOLD

FRAME_SAMPLE_INTERVAL_SECONDS = 1.0
MAX_VIDEO_DURATION_SECONDS = 60.0

SEVERITY_RANK = {
    "High": 3,
    "Medium": 2,
    "Low": 1,
    None: 0
}

def run_video_inference(video_bytes: bytes, filename: str = "video.mp4"):
    """
    Executes frame-sampled YOLO pothole detection on video bytes.
    Samples frames based on FRAME_SAMPLE_INTERVAL_SECONDS (e.g. 1 frame per sec).
    Returns aggregated video detection results, video metadata, and timestamped detection events.
    """
    ext = os.path.splitext(filename)[1].lower()
    if not ext or ext not in ['.mp4', '.mov', '.avi', '.webm', '.mpeg']:
        ext = '.mp4'

    # Save video bytes to temporary file for cv2.VideoCapture
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    temp_file_path = temp_file.name
    try:
        temp_file.write(video_bytes)
        temp_file.close()

        cap = cv2.VideoCapture(temp_file_path)
        if not cap.isOpened():
            raise ValueError("Unable to open or read video file. Unsupported or corrupted video format.")

        fps = float(cap.get(cv2.CAP_PROP_FPS))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        if fps <= 0 or total_frames <= 0:
            cap.release()
            raise ValueError("Invalid video metadata (FPS or frame count is zero/unreadable).")

        duration = round(total_frames / fps, 2)
        if duration > MAX_VIDEO_DURATION_SECONDS:
            cap.release()
            raise ValueError(f"Video duration ({duration}s) exceeds maximum allowed limit of {int(MAX_VIDEO_DURATION_SECONDS)} seconds.")

        sample_step = max(1, int(fps * FRAME_SAMPLE_INTERVAL_SECONDS))
        model = get_yolo_model()

        frame_idx = 0
        video_detections = []
        max_confidence = 0.0
        max_count = 0
        highest_severity = None

        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                if frame_idx % sample_step == 0:
                    # Convert BGR frame to RGB PIL Image
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    pil_img = Image.fromarray(rgb_frame)
                    img_w, img_h = pil_img.size

                    results = model.predict(source=pil_img, conf=CONFIDENCE_THRESHOLD, device="cpu", verbose=False)

                    frame_detections = []
                    frame_max_conf = 0.0

                    for r in results:
                        boxes = r.boxes
                        for box in boxes:
                            cls_id = int(box.cls[0].item())
                            conf = float(box.conf[0].item())
                            xyxy = box.xyxy[0].tolist()
                            x1, y1, x2, y2 = xyxy

                            if conf > frame_max_conf:
                                frame_max_conf = conf

                            det_obj = {
                                "label": model.names.get(cls_id, "pothole"),
                                "confidence": round(conf, 4),
                                "boundingBox": {
                                    "x1": round(x1, 2), "y1": round(y1, 2),
                                    "x2": round(x2, 2), "y2": round(y2, 2)
                                },
                                "normalizedBox": {
                                    "x1": round(x1 / img_w, 4), "y1": round(y1 / img_h, 4),
                                    "x2": round(x2 / img_w, 4), "y2": round(y2 / img_h, 4)
                                }
                            }
                            frame_detections.append(det_obj)

                    if frame_detections:
                        frame_severity, _, _ = calculate_severity(frame_detections, img_w, img_h)
                        frame_count = len(frame_detections)
                        timestamp = round(frame_idx / fps, 2)

                        event = {
                            "timestamp": timestamp,
                            "frameNumber": frame_idx,
                            "confidence": round(frame_max_conf, 4),
                            "count": frame_count,
                            "severity": frame_severity
                        }
                        video_detections.append(event)

                        if frame_max_conf > max_confidence:
                            max_confidence = frame_max_conf

                        if frame_count > max_count:
                            max_count = frame_count

                        if SEVERITY_RANK.get(frame_severity, 0) > SEVERITY_RANK.get(highest_severity, 0):
                            highest_severity = frame_severity

                frame_idx += 1
        finally:
            cap.release()

        detected = len(video_detections) > 0

        return {
            "mediaType": "video",
            "detected": detected,
            "confidence": round(max_confidence, 4) if detected else 0.0,
            "count": max_count if detected else 0,
            "severity": highest_severity if detected else None,
            "videoMetadata": {
                "duration": duration,
                "fps": round(fps, 2),
                "totalFrames": total_frames
            },
            "videoDetections": video_detections,
            "detections": video_detections,
            "needsManualReview": not detected
        }
    finally:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as e:
                print(f"Warning: Could not remove temporary video file {temp_file_path}: {e}")
