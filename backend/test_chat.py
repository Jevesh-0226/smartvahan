import requests
url = "http://127.0.0.1:8000/api/chat"
try:
    response = requests.post(url, json={"message": "hello", "history": []})
    print(response.json())
except Exception as e:
    print(e)
