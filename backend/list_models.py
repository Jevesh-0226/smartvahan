import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("Listing models...")
for m in genai.list_models():
    if m.name.startswith('models/') and 'generateContent' in m.supported_generation_methods:
        print(f"Name: {m.name}, DisplayName: {m.display_name}")
