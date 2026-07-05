from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import numpy as np
import io, base64
from PIL import Image
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_PATH = "waste_best.h5"
print("⏳ Loading Keras model from", MODEL_PATH)
model = load_model(MODEL_PATH)
print("✅ Model loaded")

LABELS = ['Bio-Waste', 'E-Waste', 'Plastic'] 

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or 'file' not in data:
            return jsonify({"success": False, "message": "No file provided"}), 400

        img_b64 = data['file']
        img_bytes = base64.b64decode(img_b64)
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB').resize((224,224))
        arr = np.array(img) / 255.0
        inp = np.expand_dims(arr, axis=0)
        
        preds = model.predict(inp)[0]
        if len(preds) != len(LABELS):
            preds = preds.flatten()

        scores = []
        for i, lbl in enumerate(LABELS):
            val = float(preds[i]) if i < len(preds) else 0.0
            scores.append({ "label": lbl, "score": val })

        top_i = int(np.argmax(preds))
        top_label = LABELS[top_i]
        top_conf = float(preds[top_i]) * 100.0

        if top_conf < 65.0:
            return jsonify({
                "success": True,
                "classification": "Unclear",
                "guidance": "Confidence is too low. Please upload a clearer image of the waste.",
                "recyclingPotential": round(top_conf, 2),
                "scores": scores
            })

        guidance_map = {
            "Plastic": "Dispose in plastic recycling bins.",
            "Bio-Waste": "Compost or dispose as biodegradable waste.",
            "E-Waste": "Take to certified e-waste centers."
        }
        guidance = guidance_map.get(top_label, "Handle responsibly.")

        return jsonify({
            "success": True,
            "classification": top_label,
            "guidance": guidance,
            "recyclingPotential": round(top_conf, 2),
            "scores": scores
        })
    except Exception as e:
        print("❌ Prediction error:", e)
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
