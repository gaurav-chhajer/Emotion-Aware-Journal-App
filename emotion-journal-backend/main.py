# main.py
# Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# Notes:
# - Handles /analyze and /analyze/ to avoid proxy slash-redirect 405s.
# - Adds explicit OPTIONS for clean CORS preflight.
# - Fixes keyword extraction (keeps alpha tokens only).
# - Ensure spacy model "en_core_web_sm" is available in the environment.

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import pipeline
from functools import lru_cache
import spacy
import asyncio
from concurrent.futures import ThreadPoolExecutor

# ---------------------------
# Model Loading (cached)
# ---------------------------
@lru_cache(maxsize=None)
def get_emotion_model():
    """Loads the emotion classification model directly from HuggingFace."""
    print("Loading emotion model from HuggingFace Hub...")
    model_name = "j-hartmann/emotion-english-distilroberta-base"
    device = 0 if torch.cuda.is_available() else -1
    clf = pipeline("text-classification", model=model_name, framework="pt", device=device)
    print(f"Emotion model '{model_name}' loaded.")
    return clf

@lru_cache(maxsize=None)
def get_sarcasm_model():
    """Loads and caches the sarcasm detection model."""
    print("Loading sarcasm detection model...")
    model_name = "helinivan/english-sarcasm-detector"
    device = 0 if torch.cuda.is_available() else -1
    det = pipeline("text-classification", model=model_name, framework="pt", device=device)
    print("Sarcasm model loaded.")
    return det

@lru_cache(maxsize=None)
def get_ner_model():
    """Loads and caches the Named Entity Recognition (NER) model."""
    print("Loading NER model...")
    nlp = spacy.load("en_core_web_sm")
    print("NER model loaded.")
    return nlp

# Thread pool for running sync model work without blocking the event loop
executor = ThreadPoolExecutor(max_workers=2)

# ---------------------------
# FastAPI App
# ---------------------------
app = FastAPI(
    title="Emotion Aware Journal API",
    description="Local two-step pipeline (sarcasm → emotion) + NER & keywords.",
    version="2.3.1",
)

# CORS: keep permissive while testing; restrict in prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # replace with your frontend origin(s) in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Schemas
# ---------------------------
class JournalText(BaseModel):
    text: str

class NamedEntity(BaseModel):
    text: str
    label: str

class AnalysisResult(BaseModel):
    emotion: str
    keywords: list[str]
    entities: list[NamedEntity]

# ---------------------------
# Analysis Logic
# ---------------------------
def perform_analysis_sync(text: str) -> dict:
    """Runs local AI models synchronously in a worker thread."""
    # Step 1: Sarcasm detection
    sarcasm_detector = get_sarcasm_model()
    sarcasm_result = sarcasm_detector(text)[0]

    # Step 2: Emotion (override if strong sarcasm)
    if sarcasm_result["label"].upper() == "SARCASM" and sarcasm_result["score"] > 0.6:
        emotion = "Anger"  # heuristic
    else:
        emotion_classifier = get_emotion_model()
        emotion_predictions = emotion_classifier(text)
        raw_emotion = emotion_predictions[0]["label"]
        emotion_map = {
            "joy": "Joy",
            "sadness": "Sadness",
            "anger": "Anger",
            "love": "Love",
            "neutral": "Neutral",
            "fear": "Fear",
            "surprise": "Surprise",
            "disgust": "Disgust",
        }
        emotion = emotion_map.get(raw_emotion.lower(), raw_emotion.capitalize())

    # NER + keywords
    ner_model = get_ner_model()
    doc = ner_model(text)
    entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]

    # Keep alphabetic, non-stopword, non-punct lemmas (dedup, top 10)
    keywords = [
        tok.lemma_.lower()
        for tok in doc
        if tok.is_alpha and not tok.is_stop and not tok.is_punct
    ]
    unique_keywords = list(dict.fromkeys(keywords))  # preserves order & dedups

    return {"emotion": emotion, "keywords": unique_keywords[:10], "entities": entities}

# ---------------------------
# Routes
# ---------------------------
@app.get("/")
def read_root():
    return {"message": "Welcome to the Emotion Aware Journal API!"}

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

# Explicit OPTIONS to satisfy strict proxies / preflights
@app.options("/analyze")
@app.options("/analyze/")
def options_analyze():
    return Response(status_code=200)

# Support both /analyze and /analyze/ to avoid slash-redirect 405s
@app.post("/analyze", response_model=AnalysisResult)
@app.post("/analyze/", response_model=AnalysisResult)
async def analyze_entry(journal_text: JournalText):
    loop = asyncio.get_running_loop()
    analysis = await loop.run_in_executor(executor, perform_analysis_sync, journal_text.text)
    return AnalysisResult(
        emotion=analysis["emotion"],
        keywords=analysis["keywords"],
        entities=analysis["entities"],
    )