# main.py
# This is a simplified version to ensure it runs on Render's free tier.
# It only loads one model to save memory.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import pipeline
from functools import lru_cache
import spacy
import asyncio
from concurrent.futures import ThreadPoolExecutor

# --- Model Loading ---
@lru_cache(maxsize=None)
def get_emotion_model():
    """Loads the emotion classification model from HuggingFace."""
    print("Loading emotion model...")
    model_name = "j-hartmann/emotion-english-distilroberta-base"
    device = -1 # Use CPU to save memory on Render's free tier
    classifier = pipeline("text-classification", model=model_name, framework="pt", device=device)
    print(f"Emotion model '{model_name}' loaded.")
    return classifier

# A thread pool to run the model without blocking the server
executor = ThreadPoolExecutor()

# --- FastAPI App Initialization ---
app = FastAPI(title="Emotion Journal API")

# --- CORS Middleware ---
# Allows your Vercel frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class JournalText(BaseModel):
    text: str

class AnalysisResult(BaseModel):
    emotion: str
    keywords: list[str] # Keeping keywords for compatibility with frontend

# --- Analysis Logic ---
def perform_analysis_sync(text: str) -> dict:
    """Synchronous function that runs the AI model."""
    emotion_classifier = get_emotion_model()
    predictions = emotion_classifier(text)
    raw_emotion = predictions[0]['label']
    
    emotion_map = {
        'joy': 'Joy', 'sadness': 'Sadness', 'anger': 'Anger', 
        'love': 'Love', 'neutral': 'Neutral', 'fear': 'Fear', 
        'surprise': 'Surprise', 'disgust': 'Disgust'
    }
    emotion = emotion_map.get(raw_emotion, raw_emotion.capitalize())

    # Return dummy keywords since we removed the NER model to save memory
    return {"emotion": emotion, "keywords": ["analysis", "text"]}

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Emotion Journal API!"}

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_entry(journal_text: JournalText):
    """Receives journal text and returns an analysis."""
    loop = asyncio.get_running_loop()
    analysis = await loop.run_in_executor(
        executor, perform_analysis_sync, journal_text.text
    )
    return AnalysisResult(
        emotion=analysis["emotion"],
        keywords=analysis["keywords"],
    )
