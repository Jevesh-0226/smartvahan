import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import List
from models.chat_models import Message

load_dotenv()

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            self.api_key = self.api_key.strip()
        self.model = None
        self.current_model_name = None

    def _initialize_model(self):
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is missing.")
        
        genai.configure(api_key=self.api_key)
        
        try:
            # 1. Get ALL models
            raw_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
            
            # 2. STRICTLY EXCLUDE anything with "2.0" because it has a 0 quota for this account
            available_models = [m for m in raw_models if "2.0" not in m]
            print(f"DEBUG: Raw models: {raw_models}")
            print(f"DEBUG: Available models (Excluded 2.0): {available_models}")
            
            # 3. Priority list of stable models
            targets = [
                'models/gemini-1.5-flash',
                'models/gemini-pro',
                'models/gemini-1.5-pro'
            ]
            
            selected = next((t for t in targets if t in available_models), None)
            
            if not selected and available_models:
                selected = available_models[0]
                
            if not selected:
                # Absolute fallback to the most stable known name
                selected = 'models/gemini-1.5-flash'

            print(f"DEBUG: Final Decision - Using model: {selected}")
            self.model = genai.GenerativeModel(selected)
            self.current_model_name = selected
            
        except Exception as e:
            print(f"Selection Error: {e}. Falling back to 1.5-flash.")
            self.model = genai.GenerativeModel('models/gemini-1.5-flash')
            self.current_model_name = 'models/gemini-1.5-flash'

    async def get_chat_response(self, user_message: str, history: List[Message]) -> str:
        if not self.model:
            self._initialize_model()
            
        chat_history = []
        for msg in history:
            chat_history.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.content]
            })

        try:
            chat = self.model.start_chat(history=chat_history)
            response = chat.send_message(user_message)
            return response.text
        except Exception as e:
            error_msg = str(e)
            print(f"Runtime Error with {self.current_model_name}: {error_msg}")
            
            # If the current model fails with a quota/limit error, try ONE emergency fallback to a different model
            if "quota" in error_msg.lower() or "limit" in error_msg.lower() or "429" in error_msg:
                print("DEBUG: Quota hit. Attempting emergency switch to next available non-2.0 model...")
                # Re-initialize skipping the current failing one
                self._initialize_model() 
                chat = self.model.start_chat(history=chat_history)
                response = chat.send_message(user_message)
                return response.text
            
            raise e

    async def generate_content(self, prompt: str) -> str:
        if not self.model:
            try:
                self._initialize_model()
            except ValueError as ve:
                print(f"Initialization Error: {ve}")
                raise ve

        try:
            # Use async version if available, otherwise fallback to sync
            if hasattr(self.model, 'generate_content_async'):
                response = await self.model.generate_content_async(prompt)
            else:
                response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            error_msg = str(e)
            print(f"Runtime Error in generate_content: {error_msg}")
            
            # If the current model fails with a quota/limit error, try ONE emergency fallback to a different model
            if "quota" in error_msg.lower() or "limit" in error_msg.lower() or "429" in error_msg:
                print("DEBUG: Quota hit. Attempting emergency switch to next available non-2.0 model...")
                # Re-initialize skipping the current failing one
                self._initialize_model() 
                if hasattr(self.model, 'generate_content_async'):
                    response = await self.model.generate_content_async(prompt)
                else:
                    response = self.model.generate_content(prompt)
                return response.text
            
            raise e

# Singleton instance
gemini_service = None

def get_gemini_service():
    global gemini_service
    if gemini_service is None:
        gemini_service = GeminiService()
    return gemini_service
