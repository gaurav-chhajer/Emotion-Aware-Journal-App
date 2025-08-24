# main.py
# This is an optimized version for deployment on Render's free tier.
# It only loads the essential emotion model to save memory and prevent crashes.

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
    # Use device=-1 to force CPU, which uses less memory on Render's free tier
    device = -1
    classifier = pipeline("text-classification", model=model_name, framework="pt", device=device)
    print(f"Emotion model '{model_name}' loaded.")
    return classifier

@lru_cache(maxsize=None)
def get_ner_model():
    """Loads the spaCy model for keyword extraction."""
    print("Loading NER model...")
    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        print("Downloading spaCy model en_core_web_sm...")
        spacy.cli.download("en_core_web_sm")
        nlp = spacy.load("en_core_web_sm")
    print("NER model loaded.")
    return nlp

# A thread pool to run the models without blocking the server
executor = ThreadPoolExecutor()

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Emotion Journal API",
    description="API for analyzing journal entries.",
    version="1.0.0",
)

# --- CORS Middleware ---
# Allows your Vercel frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class JournalText(BaseModel):
    text: str

# This must match what your frontend expects
class AnalysisResult(BaseModel):
    emotion: str
    keywords: list[str]
    entities: list # Keep this for compatibility, but it will be empty

# --- Analysis Logic ---
def perform_analysis_sync(text: str) -> dict:
    """Synchronous function that runs the AI models."""
    # Step 1: Get emotion
    emotion_classifier = get_emotion_model()
    predictions = emotion_classifier(text)
    raw_emotion = predictions[0]['label']
    
    emotion_map = {
        'joy': 'Joy', 'sadness': 'Sadness', 'anger': 'Anger', 
        'love': 'Love', 'neutral': 'Neutral', 'fear': 'Fear', 
        'surprise': 'Surprise', 'disgust': 'Disgust'
    }
    emotion = emotion_map.get(raw_emotion, raw_emotion.capitalize())

    # Step 2: Get keywords using spaCy
    ner_model = get_ner_model()
    doc = ner_model(text)
    stop_words = spacy.lang.en.stop_words.STOP_WORDS
    keywords = [
        token.lemma_.lower() for token in doc 
        if not token.is_stop and not token.is_punct and token.is_alpha
    ]
    unique_keywords = list(set(keywords))

    # Return keywords and an empty list for entities
    return {"emotion": emotion, "keywords": unique_keywords[:5], "entities": []}

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Emotion Journal API! V3"}

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
        entities=analysis["entities"]
    )
