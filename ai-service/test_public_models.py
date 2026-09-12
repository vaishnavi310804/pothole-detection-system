import requests

repo = "ZiaPratama/Yolov8_Pothole"
url = f"https://huggingface.co/api/models/{repo}/tree/main"
res = requests.get(url)
if res.status_code == 200:
    files = res.json()
    for f in files:
        print(f)
