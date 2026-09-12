import os
import requests
import subprocess

def test_multiple_images():
    model_dir = os.path.join(os.path.dirname(__file__), "model")
    
    urls = [
        ("pothole_test_a.jpg", "https://raw.githubusercontent.com/intel-isl/TBD/master/pothole.jpg"),
        ("pothole_test_b.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Pothole_in_asphalt.jpg/640px-Pothole_in_asphalt.jpg"),
        ("pothole_test_c.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Schlagloch_Pothole.JPG/640px-Schlagloch_Pothole.JPG"),
    ]
    
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    
    for filename, url in urls:
        filepath = os.path.join(model_dir, filename)
        if not os.path.exists(filepath):
            try:
                r = requests.get(url, headers=headers, timeout=10)
                if r.status_code == 200:
                    with open(filepath, "wb") as f:
                        f.write(r.content)
                    print(f"Downloaded {filename} ({len(r.content)} bytes)")
            except Exception as e:
                print(f"Could not download {filename}: {e}")

        if os.path.exists(filepath):
            print(f"\n==================================================")
            print(f" Testing: {filename}")
            print(f"==================================================")
            subprocess.run(["python", "test_inference_debug.py", filepath])

if __name__ == "__main__":
    test_multiple_images()
