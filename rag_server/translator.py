from transformers import pipeline

# Load translation models (Malayalam ↔ English)
ml_to_en = pipeline("translation", model="Helsinki-NLP/opus-mt-ml-en")
en_to_ml = pipeline("translation", model="Helsinki-NLP/opus-mt-en-ml")

def translate_ml_to_en(text: str) -> str:
    """Translate Malayalam text to English"""
    return ml_to_en(text)[0]["translation_text"]

def translate_en_to_ml(text: str) -> str:
    """Translate English text to Malayalam"""
    return en_to_ml(text)[0]["translation_text"]
