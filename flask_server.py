from flask import Flask, request, jsonify
from flask_cors import CORS
import tflite_runtime.interpreter as tflite
import numpy as np
import io, base64
from PIL import Image

app = Flask(__name__)
CORS(app)

MODEL_PATH = "waste_best.tflite"
print("⏳ Loading TFLite model from", MODEL_PATH)

# Initialize the TFLite interpreter
interpreter = tflite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

# Get input and output layer details
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print("✅ Model loaded")

LABELS = ['Bio-Waste', 'E-Waste', 'Plastic'] 

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or 'file' not in data:
            return jsonify({"success": False, "message": "No file provided"}), 400

        # Process the image
        img_b64 = data['file']
        img_bytes = base64.b64decode(img_b64)
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB').resize((224,224))
        
        # TFLite strictly requires float32 data types
        arr = np.array(img, dtype=np.float32) / 255.0
        inp = np.expand_dims(arr, axis=0)
        
        # Run TFLite Prediction
        interpreter.set_tensor(input_details[0]['index'], inp)
        interpreter.invoke()
        preds = interpreter.get_tensor(output_details[0]['index'])[0]
        
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
    # Using Render's dynamic port or default to 10000
    import os
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port, debug=False)