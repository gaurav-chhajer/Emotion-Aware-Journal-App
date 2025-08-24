# main.py
# This version returns a dummy response to avoid loading the memory-intensive model
# on Render's free tier. This is for debugging the connection.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time # Using time to simulate a delay
import random # Import the random module

# --- FastAPI App Initialization ---
app = FastAPI(title="Emotion Journal API")

# --- CORS Middleware ---
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

class AnalysisResult(BaseModel):
    emotion: str
    keywords: list[str]

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"message": "DEPLOYMENT SUCCESSFUL - V3"}

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_entry(journal_text: JournalText):
    """
    This is a DUMMY endpoint. It does NOT load a model.
    It waits for 2 seconds and returns a hardcoded response with a random emotion.
    """
    print(f"Received text for dummy analysis: {journal_text.text}")
    time.sleep(1) # Simulate the time it would take to run a model

    # **NEW**: List of possible emotions
    emotions = ["Joy", "Sadness", "Anger", "Love", "Neutral"]
    
    # **NEW**: Randomly select an emotion from the list
    random_emotion = random.choice(emotions)

    # Return a fixed, dummy analysis with the random emotion
    return AnalysisResult(
        emotion=random_emotion,
        keywords=["dummy", "response", "success"],
    )

