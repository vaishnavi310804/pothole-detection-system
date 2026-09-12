import os
import requests

def download_test_images():
    model_dir = os.path.join(os.path.dirname(__file__), "model")
    
    # 3 Real Pothole Images from public road hazard repositories
    images = {
        "pothole_real_1.jpg": "https://raw.githubusercontent.com/intel-isl/TBD/master/pothole.jpg",
        "pothole_real_2.jpg": "https://raw.githubusercontent.com/AlexeyAB/darknet/master/data/dog.jpg", # non-pothole control
        "pothole_real_3.jpg": "https://raw.githubusercontent.com/ultralytics/yolov5/master/data/images/bus.jpg" # non-pothole control
    }
    
    # Also fetch a known Roboflow pothole dataset sample
    headers = {"User-Agent": "Mozilla/5.0"}
    
    urls = [
        ("pothole_sample_1.jpg", "https://images.fineartamerica.com/images-medium-large-5/pothole-in-asphalt-road-science-photo-library.jpg"),
        ("pothole_sample_2.jpg", "https://img.freepik.com/free-photo/pothole-asphalt-road_1150-14197.jpg"),
        ("pothole_sample_3.jpg", "https://media.istockphoto.com/id/1144005085/photo/large-deep-pothole-in-asphalt-road.jpg?s=612x612&w=0&k=20&c=L4W0xVdJp9uC--6jGZl9x0Y7gWb8V5hQ0bF-O0Q4_w8=")
    ]
    
    for filename, url in urls:
        target_path = os.path.join(model_dir, filename)
        if not os.path.exists(target_path):
            try:
                print(f"Fetching {filename}...")
                r = requests.get(url, headers=headers, timeout=10)
                if r.status_code == 200:
                    with open(target_path, "wb") as f:
                        f.write(r.content)
                    print(f"Saved {filename} ({len(r.content)} bytes)")
                else:
                    print(f"Failed to fetch {filename}: HTTP {r.status_code}")
            except Exception as e:
                print(f"Error fetching {filename}: {e}")

if __name__ == "__main__":
    download_test_images()
