# Emotion-Aware Journal App

An AI-powered journaling app that analyzes the emotions in your text and provides insights to help users better understand their mental and emotional well-being.
The app uses FastAPI for the backend, `transformers` for NLP, `spaCy` for linguistic processing, and a Node.js/React frontend for the user interface.

### 🚀 Features

* ✍️ Write and save daily journal entries.
* 🤖 Automatic emotion detection using fine-tuned NLP models.
* 📊 Insights into emotional trends over time.
* 🌐 REST API backend built with FastAPI.
* ⚡ Real-time frontend powered by Node.js.

### 🛠️ Tech Stack

**Backend (Python)**
* FastAPI
* Transformers (HuggingFace)
* PyTorch
* spaCy

**Frontend (JavaScript)**
* Node.js
* React (assumed from presence of `package.json`)

**Others**
* Pandas, NumPy, Scikit-learn (for data handling & ML support)

### 📂 Project Structure
Emotion-Aware Journal App/
│
├── emotion-journal-backend/    # Python backend
│   ├── main.py                 # FastAPI app entrypoint
│   ├── finetune.py             # Model fine-tuning script
│   ├── prepare_data.py         # Data preparation
│   └── my_data.txt             # Example dataset
│
├── public/                     # Frontend public assets
│   └── index.html
│
├── src/                        # Frontend source code
│   ├── App.js
│   └── index.js
│
├── .gitignore                  # Files to be ignored by Git
├── package.json                # Frontend dependencies
├── requirements.txt            # Python dependencies
└── README.md                   # Project documentation

### ⚙️ Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/gaurav-chhajer/Emotion-Aware-Journal-App.git
    cd emotion-aware-journal-app
    ```

2.  **Backend Setup (Python)**
    ```bash
    # Create and activate a virtual environment
    python -m venv venv
    source venv/bin/activate  # On macOS/Linux
    # venv\Scripts\activate   # On Windows

    # Install dependencies
    pip install --upgrade pip
    pip install -r requirements.txt
    ```

3.  **Frontend Setup (Node.js)**
    ```bash
    # Install dependencies and start the app
    npm install
    npm start
    ```

### ▶️ Running the App

1.  **Start the Backend (FastAPI)**
    ```bash
    uvicorn emotion-journal-backend.main:app --reload
    ```
    By default, the API will be available at: 👉 `http://127.0.0.1:8000`

2.  **Start the Frontend (Node.js)**
    ```bash
    npm start
    ```
    Visit 👉 `http://localhost:3000` in your browser.

### 📡 API Endpoints

Here are the primary endpoints available.

#### Health Check

* **`GET /health`**
    * **Description:** Checks if the API is running.
    * **Response (200 OK):**
        ```json
        {
          "status": "ok"
        }
        ```

#### Emotion Analysis

* **`POST /analyze`**
    * **Description:** Analyzes a given string of text and returns the detected emotions.
    * **Request Body:**
        ```json
        {
          "text": "I felt so happy and excited when I got the good news!"
        }
        ```
    * **Response (200 OK):**
        ```json
        {
          "emotions": [
            { "label": "joy", "score": 0.98 },
            { "label": "excitement", "score": 0.95 },
            { "label": "sadness", "score": 0.01 }
          ]
        }
        ```

#### Journal Entries (CRUD)

* **`POST /entries`**
    * **Description:** Creates a new journal entry.
    * **Request Body:**
        ```json
        {
          "title": "A Great Day",
          "content": "Today was wonderful. I spent time with friends and felt very happy."
        }
        ```
    * **Response (201 Created):**
        ```json
        {
          "id": "entry-123-abc",
          "title": "A Great Day",
          "content": "Today was wonderful. I spent time with friends and felt very happy.",
          "created_at": "2025-08-23T12:30:00Z",
          "emotions": [{ "label": "joy", "score": 0.99 }]
        }
        ```

* **`GET /entries`**
    * **Description:** Retrieves a list of all journal entries.
    * **Response (200 OK):**
        ```json
        [
          {
            "id": "entry-123-abc",
            "title": "A Great Day",
            "created_at": "2025-08-23T12:30:00Z"
          }
        ]
        ```

* **`GET /entries/{entry_id}`**
    * **Description:** Retrieves a single journal entry by its ID.
    * **Response (200 OK):**
        ```json
        {
          "id": "entry-123-abc",
          "title": "A Great Day",
          "content": "Today was wonderful. I spent time with friends and felt very happy.",
          "created_at": "2025-08-23T12:30:00Z",
          "emotions": [{ "label": "joy", "score": 0.99 }]
        }
        ```

### 📊 Model

The model is a fine-tuned HuggingFace `transformer` trained on emotion-labeled text. It uses PyTorch for inference and `spaCy` (`en_core_web_sm`) for text preprocessing.

### ✅ To-Do

* [ ] Improve emotion classification accuracy.
* [ ] Add user authentication.
* [ ] Add a visualization dashboard for emotion trends.
