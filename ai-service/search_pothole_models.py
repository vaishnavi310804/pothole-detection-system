import requests

def find_hf_pothole_models():
    url = "https://huggingface.co/api/models?search=pothole&limit=20"
    res = requests.get(url)
    if res.status_code == 200:
        models = res.json()
        print(f"Found {len(models)} Hugging Face pothole models:")
        for m in models:
            model_id = m.get("id")
            tags = m.get("tags", [])
            print(f" - {model_id} (tags: {tags})")
    else:
        print(f"Error fetching models: {res.status_code}")

if __name__ == "__main__":
    find_hf_pothole_models()
