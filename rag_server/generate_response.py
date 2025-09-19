import groq

# Initialize Groq API client
client = groq.Groq(api_key="<your_api_key_here>")

def generate_response(user_query):
    """
    Generate farming-related answers directly from LLM (no RAG).
    """
    prompt = f"""
You are an expert agriculture and farming advisor.
Answer farmers' questions in a clear, practical, and reliable way.

✅ Guidelines:
- Use simple farmer-friendly language.
- Provide actionable steps (e.g., soil type, fertilizers, irrigation, pest control).
- Suggest natural/organic alternatives if possible.
- If unsure, recommend contacting a local agricultural officer.

📝 Farmer Question:
{user_query}

✍️ Answer below:
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a helpful farming assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4,
        max_tokens=300,
        top_p=0.8
    )

    return response.choices[0].message.content.strip()
