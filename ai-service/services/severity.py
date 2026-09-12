def calculate_severity(detections, img_width, img_height):
    """
    Calculates estimated pothole severity based on relative area coverage and count.
    
    Heuristic rules:
    - High: Total pothole area coverage >= 7% OR pothole count >= 3
    - Medium: Total area coverage between 2% and 7% OR pothole count == 2
    - Low: Pothole count == 1 AND area coverage < 2%
    - None/null: No potholes detected
    
    Note: This is an estimated severity heuristic for application reporting and not a real-world civil engineering measurement.
    """
    if not detections:
        return None, False, 0.0

    total_image_area = float(img_width * img_height)
    if total_image_area <= 0:
        total_image_area = 1.0

    total_pothole_area = 0.0
    count = len(detections)

    for det in detections:
        bbox = det["boundingBox"]
        width = max(0, bbox["x2"] - bbox["x1"])
        height = max(0, bbox["y2"] - bbox["y1"])
        area = width * height
        total_pothole_area += area

    area_ratio = total_pothole_area / total_image_area

    if area_ratio >= 0.07 or count >= 3:
        severity = "High"
    elif area_ratio >= 0.02 or count == 2:
        severity = "Medium"
    else:
        severity = "Low"

    return severity, True, round(area_ratio, 4)
