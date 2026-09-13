import io
import base64
from PIL import Image, ImageDraw, ImageFont
from model.loader import get_yolo_model
from services.severity import calculate_severity

CONFIDENCE_THRESHOLD = 0.08

def run_image_inference(image_bytes: bytes):
    """
    Executes YOLO pothole detection on image bytes.
    Returns structured detection results and base64 annotated preview image.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_width, img_height = image.size

    model = get_yolo_model()
    
    # Run YOLO inference
    results = model.predict(source=image, conf=CONFIDENCE_THRESHOLD, device="cpu", verbose=False)

    detections = []
    max_confidence = 0.0
    annotated_image = image.copy()
    draw = ImageDraw.Draw(annotated_image)

    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            xyxy = box.xyxy[0].tolist()
            
            x1, y1, x2, y2 = xyxy
            
            if conf > max_confidence:
                max_confidence = conf

            det_obj = {
                "label": model.names.get(cls_id, "pothole"),
                "confidence": round(conf, 4),
                "boundingBox": {
                    "x1": round(x1, 2),
                    "y1": round(y1, 2),
                    "x2": round(x2, 2),
                    "y2": round(y2, 2)
                },
                "normalizedBox": {
                    "x1": round(x1 / img_width, 4),
                    "y1": round(y1 / img_height, 4),
                    "x2": round(x2 / img_width, 4),
                    "y2": round(y2 / img_height, 4)
                }
            }
            detections.append(det_obj)

            # Draw visual bounding box on annotated image preview
            draw.rectangle([x1, y1, x2, y2], outline="#ef4444", width=4)
            label_text = f"Pothole {int(conf * 100)}%"
            
            # Draw label banner
            text_box = [x1, max(0, y1 - 25), x1 + 120, y1]
            draw.rectangle(text_box, fill="#ef4444")
            draw.text((x1 + 5, max(0, y1 - 22)), label_text, fill="#ffffff")

    detected = len(detections) > 0

    if detected:
        severity, _, area_ratio = calculate_severity(detections, img_width, img_height)
        needs_manual_review = False
        overall_confidence = round(max_confidence, 4)
    else:
        severity = None
        needs_manual_review = True
        overall_confidence = 0.0

    # Convert annotated image to base64 data URI
    buffered = io.BytesIO()
    annotated_image.save(buffered, format="JPEG", quality=85)
    base64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    annotated_image_base64 = f"data:image/jpeg;base64,{base64_str}"

    return {
        "mediaType": "image",
        "detected": detected,
        "confidence": overall_confidence,
        "severity": severity,
        "count": len(detections),
        "detections": detections,
        "needsManualReview": needs_manual_review,
        "annotatedImageBase64": annotated_image_base64
    }

