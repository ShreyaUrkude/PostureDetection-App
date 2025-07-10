from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from logic import analyze_frame

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze():
    file = request.files['frame']
    npimg = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    
    result = analyze_frame(frame)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
