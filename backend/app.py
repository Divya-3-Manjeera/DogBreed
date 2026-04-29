from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
import base64

app = Flask(__name__)
# Allow your React app to communicate with Flask
CORS(app) 

# Load your custom AI brain into memory exactly once when the server starts
print("Loading YOLO model...")
model = YOLO('best.pt')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    # 1. Read the image from the React frontend
    file = request.files['image']
    image_bytes = file.read()
    
    # 2. Convert the image into a format OpenCV and YOLO can read
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # 3. Run the AI prediction!
    results = model.predict(img, conf=0.25)

    # 4. Extract the exact breed names and confidence scores
    predictions = []
    for box in results[0].boxes:
        predictions.append({
            "breed": model.names[int(box.cls[0])],
            "confidence": round(float(box.conf[0]) * 100, 2)
        })

    # 5. Draw the bounding box and convert the image to Base64 for React
    res_plotted = results[0].plot()
    _, buffer = cv2.imencode('.jpg', res_plotted)
    img_base64 = base64.b64encode(buffer).decode('utf-8')

    # 6. Send everything back to the frontend
    return jsonify({
        "predictions": predictions,
        "image_base64": img_base64
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)