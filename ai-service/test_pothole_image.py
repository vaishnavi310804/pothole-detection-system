import requests
import os

def test_real_pothole():
    model_dir = os.path.join(os.path.dirname(__file__), "model")
    test_img = os.path.join(model_dir, "sample_pothole.jpg")
    
    img_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Pothole_on_a_road.jpg/640px-Pothole_on_a_road.jpg"
    headers = {"User-Agent": "Mozilla/5.0"}
    
    if not os.path.exists(test_img):
        print("Downloading sample road pothole image...")
        r = requests.get(img_url, headers=headers)
        with open(test_img, "wb") as f:
            f.write(r.content)

    url = "http://localhost:8000/detect"
    with open(test_img, "rb") as f:
        files = {"file": ("sample_pothole.jpg", f, "image/jpeg")}
        res = requests.post(url, files=files)

    print(f"Status Code: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print("\nPothole Detection Result:")
        print(f" - detected: {data.get('detected')}")
        print(f" - confidence: {data.get('confidence')}")
        print(f" - severity: {data.get('severity')}")
        print(f" - count: {data.get('count')}")
        print(f" - needsManualReview: {data.get('needsManualReview')}")
        print(f" - detections: {data.get('detections')}")
    else:
        print(f"Error: {res.text}")

if __name__ == "__main__":
    test_real_pothole()
