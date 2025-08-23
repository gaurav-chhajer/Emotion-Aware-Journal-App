# finetune.py
# This script fine-tunes the emotion classification model on your custom data.
# To run this:
# 1. Create your data.csv file.
# 2. Run the script from your terminal: python finetune.py

import pandas as pd
from datasets import Dataset, DatasetDict
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer, EarlyStoppingCallback
import torch
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from sklearn.model_selection import train_test_split

def fine_tune_model():
    """
    Loads your custom dataset, splits it, fine-tunes the emotion model with early stopping,
    and saves the best version of the model.
    """
    # --- 1. Load and Prepare the Dataset ---
    print("Loading custom dataset from data.csv...")
    try:
        df = pd.read_csv("data.csv")
    except FileNotFoundError:
        print("Error: data.csv not found. Please create it with 'text' and 'label' columns.")
        return

    labels = df['label'].unique().tolist()
    label2id = {label: i for i, label in enumerate(labels)}
    id2label = {i: label for i, label in enumerate(labels)}
    df['label'] = df['label'].map(label2id)
    
    # Split the data into training (80%) and validation (20%) sets
    train_df, eval_df = train_test_split(df, test_size=0.2, random_state=42, stratify=df['label'])
    
    raw_datasets = DatasetDict({
        'train': Dataset.from_pandas(train_df),
        'eval': Dataset.from_pandas(eval_df)
    })
    
    print(f"Dataset split into {len(train_df)} training samples and {len(eval_df)} validation samples.")

    # --- 2. Load Pre-trained Model and Tokenizer ---
    base_model_name = "j-hartmann/emotion-english-distilroberta-base"
    print(f"Loading base model '{base_model_name}'...")
    
    tokenizer = AutoTokenizer.from_pretrained(base_model_name)
    model = AutoModelForSequenceClassification.from_pretrained(
        base_model_name,
        num_labels=len(labels),
        id2label=id2label,
        label2id=label2id,
    )
    print("Base model and tokenizer loaded.")

    # --- 3. Tokenize the Dataset ---
    def tokenize(batch):
        return tokenizer(batch['text'], padding=True, truncation=True)

    tokenized_datasets = raw_datasets.map(tokenize, batched=True)
    print("Tokenization complete.")

    # Define a function to compute metrics during evaluation
    def compute_metrics(pred):
        labels = pred.label_ids
        preds = pred.predictions.argmax(-1)
        precision, recall, f1, _ = precision_recall_fscore_support(labels, preds, average='weighted', zero_division=0)
        acc = accuracy_score(labels, preds)
        return {
            'accuracy': acc,
            'f1': f1,
            'precision': precision,
            'recall': recall
        }

    # --- 4. Set Up the Trainer ---
    output_dir = "./fine-tuned-emotion-model"
    
    # **FIXED**: Using older, compatible argument names for TrainingArguments.
    training_args = TrainingArguments(
        output_dir=output_dir,
        learning_rate=2e-5,
        num_train_epochs=25,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        weight_decay=0.01,
        
        # --- Arguments for evaluation and saving (older syntax) ---
        evaluate_during_training=True,      # This is the old name for evaluation_strategy="epoch"
        load_best_model_at_end=True,        # Automatically load the best model at the end
        metric_for_best_model="f1",         # Use the F1 score to determine the "best" model
        
        logging_dir='./logs',
        logging_steps=10,                   # Log every 10 steps
        save_steps=500,                     # Save a checkpoint periodically (adjust if needed)
        
        use_cpu=not torch.cuda.is_available(),
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_datasets['train'],
        eval_dataset=tokenized_datasets['eval'],
        tokenizer=tokenizer,
        compute_metrics=compute_metrics,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=3)]
    )
    print("Trainer configured with validation and early stopping.")

    # --- 5. Start Fine-Tuning ---
    print("\n--- Starting Fine-Tuning ---")
    trainer.train()
    print("--- Fine-Tuning Complete ---\n")

    # --- 6. Save the Best Model ---
    print(f"Saving the best fine-tuned model to '{output_dir}'...")
    trainer.save_model(output_dir)
    print("Model saved successfully!")

if __name__ == "__main__":
    fine_tune_model()
