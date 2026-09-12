import os
import sys
import time
from PIL import Image
from ultralytics import YOLO

def debug_inference():
    print("==================================================")
    print("  AI POTHOLE DETECTION DIAGNOSTIC SUITE")
    print("==================================================")

    # 1. Model Verification
    model_path = os.path.join(os.path.dirname(__file__), "model", "pothole_yolov8n.pt")
    print(f"\n--- STEP 1: MODEL VERIFICATION ---")
    print(f"Model File Path: {model_path}")
    if not os.path.exists(model_path):
        print("❌ ERROR: Model file does not exist!")
        return
    
    file_size_mb = os.path.getsize(model_path) / (1024 * 1024)
    print(f"Model File Size: {file_size_mb:.2f} MB")

    start_load = time.time()
    model = YOLO(model_path)
    load_time = time.time() - start_load
    print(f"Model Load Time: {load_time:.3f} seconds")
    print(f"Model Class Names (model.names): {model.names}")
    print(f"Total Model Classes: {len(model.names)}")

    # 2. Image Preprocessing Check
    image_file = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "model", "test_input.jpg")
    print(f"\n--- STEP 2: IMAGE PREPROCESSING CHECK ---")
    print(f"Target Image File: {image_file}")
    if not os.path.exists(image_file):
        print(f"❌ ERROR: Test image file not found at {image_file}")
        return

    pil_img = Image.open(image_file)
    print(f"Original Image Format: {pil_img.format}")
    print(f"Original Image Mode: {pil_img.mode}")
    print(f"Original Image Dimensions (WxH): {pil_img.size[0]} x {pil_img.size[1]}")

    rgb_img = pil_img.convert("RGB")
    print(f"Converted Image Mode: {rgb_img.mode}")

    # 3. Raw YOLO Predictions (conf=0.01 to capture EVERYTHING)
    print(f"\n--- STEP 3: RAW YOLO PREDICTIONS (conf=0.01) ---")
    raw_results = model.predict(source=rgb_img, conf=0.01, device="cpu", verbose=False)
    raw_boxes = raw_results[0].boxes if raw_results else []
    
    print(f"Total RAW YOLO Bounding Boxes Detected: {len(raw_boxes)}")
    highest_conf = 0.0

    for i, box in enumerate(raw_boxes):
        cls_id = int(box.cls[0].item())
        conf = float(box.conf[0].item())
        xyxy = box.xyxy[0].tolist()
        label_name = model.names.get(cls_id, str(cls_id))
        
        if conf > highest_conf:
            highest_conf = conf

        print(f"  [{i+1}] Class ID: {cls_id} ('{label_name}'), Confidence: {conf:.4f}, BBox: {[round(c, 2) for c in xyxy]}")

    print(f"\nHighest Raw Confidence Score Found: {highest_conf:.4f}")

    # 4. Sensitivity Threshold Analysis
    print(f"\n--- STEP 4: CONFIDENCE THRESHOLD ANALYSIS ---")
    thresholds = [0.50, 0.40, 0.35, 0.30, 0.25, 0.20, 0.15, 0.10, 0.05]
    print("Threshold | Detections Count | Max Confidence | Detection Status")
    print("----------------------------------------------------------------")
    for th in thresholds:
        th_results = model.predict(source=rgb_img, conf=th, device="cpu", verbose=False)
        th_boxes = th_results[0].boxes if th_results else []
        count = len(th_boxes)
        status = "PASSED (detected: true)" if count > 0 else "FILTERED OUT (detected: false)"
        print(f"  {th:.2f}    |        {count}         |     {highest_conf:.4f}     | {status}")

    # 5. Diagnostic Output Summary
    print(f"\n--- STEP 5: DIAGNOSTIC SUMMARY ---")
    if len(raw_boxes) == 0:
        print("RESULT: CASE B — Model produced ZERO detections at conf=0.01.")
        print("DIAGNOSIS: The current model fails to recognize this image as a pothole.")
    elif highest_conf < 0.35:
        print(f"RESULT: CASE A — Model detected pothole at max confidence {highest_conf:.4f}, BUT application threshold (0.35) filtered it out!")
        print(f"DIAGNOSIS: Confidence threshold (0.35) is too high for this model's prediction score ({highest_conf:.4f}).")
    else:
        print(f"RESULT: Model detected pothole at confidence {highest_conf:.4f} (>= 0.35 threshold).")

    print("\n==================================================")

if __name__ == "__main__":
    debug_inference()
