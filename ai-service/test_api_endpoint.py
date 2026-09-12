import requests
import os

def test_detect():
    url = "http://localhost:8000/detect"
    img_path = os.path.join(os.path.dirname(__file__), "model", "test_input.jpg")
    
    print(f"Testing POST {url} with image {img_path}...")
    with open(img_path, "rb") as f:
        files = {"file": ("test_input.jpg", f, "image/jpeg")}
        response = requests.post(url, files=files)
        
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("\nResponse Data:")
        print(f" - detected: {data.get('detected')}")
        print(f" - confidence: {data.get('confidence')}")
        print(f" - severity: {data.get('severity')}")
        print(f" - count: {data.get('count')}")
        print(f" - needsManualReview: {data.get('needsManualReview')}")
        print(f" - detections: {data.get('detections')}")
        print(f" - annotatedImageBase64 length: {len(data.get('annotatedImageBase64', ''))}")
        print("\nEndpoint Test SUCCESS!")
    else:
        print(f"Error Response: {response.text}")

if __name__ == "__main__":
    test_detect()
