from flask import Flask, request, jsonify
from generate_response import generate_response
from translator import translate_ml_to_en, translate_en_to_ml
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

VALID_TOKEN = "mysecrettoken123"

@app.route('/', methods=['GET'])
def hello():
    return "🌱 Farming Assistant API is running!"

@app.route('/api/ask', methods=['POST'])
def ask():
    try:
        # ✅ Check auth
        # auth_header = request.headers.get('Authorization')
        # if not auth_header or not auth_header.startswith('Bearer '):
        #     return jsonify({'error': 'Authorization token missing or invalid'}), 401

        # token = auth_header.split(' ')[1]
        # if token != VALID_TOKEN:
        #     return jsonify({'error': 'Invalid token'}), 403

        # return jsonify({
        #     "answer": "Hello there, farmer! I'm glad you reached out. It seems like you might have a question, but it's a bit unclear. Could you please tell me what's on your mind? Are you having trouble with pests, crops not growing well, or something else?",
        #     "query":"hi",
        #     "status":"success"
        #     }), 200

        # ✅ Get user query
        data = request.get_json()
        query = data.get('query')
        lang = data.get('lang', 'en')  # default English

        if not query:
            return jsonify({'error': 'Query is required'}), 400

        # ✅ Translate Malayalam → English if needed
        if lang == "ml":
            query_en = translate_ml_to_en(query)
        else:
            query_en = query

        # ✅ Ask LLM
        answer_en = generate_response(query_en)

        # ✅ Translate back to Malayalam if requested
        if lang == "ml":
            answer_ml = translate_en_to_ml(answer_en)
            return jsonify({
                "query_ml": query,
                "query_en": query_en,
                "answer_en": answer_en,
                "answer_ml": answer_ml,
                "status": "success"
            }), 200

        return jsonify({
            "query": query_en,
            "answer": answer_en,
            "status": "success"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
