# prepare_data.py
# This script reads your custom dataset and converts it into the correct format for fine-tuning.
# To run this:
# 1. Make sure your data is saved in 'my_data.txt'.
# 2. Run this script from your terminal: python prepare_data.py

import csv

def prepare_dataset():
    """
    Reads the raw data, cleans it, and saves it as data.csv.
    """
    input_filename = "my_data.txt"
    output_filename = "data.csv"
    
    print(f"Reading data from '{input_filename}'...")

    # Define the labels that the original model understands
    valid_labels = {'joy', 'sadness', 'anger', 'fear', 'disgust', 'surprise', 'neutral'}
    
    # We will collect all the valid rows here
    output_rows = []

    try:
        with open(input_filename, 'r', encoding='utf-8') as infile:
            # Skip the header row
            next(infile) 
            
            for line in infile:
                # Split the line by the comma, but only the first one
                parts = line.strip().split(',', 1)
                
                if len(parts) == 2:
                    category, sentence = parts
                    
                    # Clean up the sentence by removing quotes
                    sentence = sentence.strip('"')
                    
                    # Convert the category to a lowercase label
                    label = category.split(' ')[0].lower()

                    # Only include rows that have a valid emotion label
                    if label in valid_labels:
                        output_rows.append({'text': sentence, 'label': label})

    except FileNotFoundError:
        print(f"Error: '{input_filename}' not found. Please save your dataset with that name.")
        return

    print(f"Found {len(output_rows)} valid entries to process.")

    # Write the cleaned data to the output CSV file
    try:
        with open(output_filename, 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=['text', 'label'])
            writer.writeheader()
            writer.writerows(output_rows)
        print(f"Successfully created '{output_filename}'!")
    except IOError:
        print(f"Error: Could not write to '{output_filename}'.")

if __name__ == "__main__":
    prepare_dataset()
