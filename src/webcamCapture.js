import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import './webcamCapture.css';

function WebcamCapture() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState('');

  const drawKeypoints = (keypoints, canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

    keypoints.forEach(p => {
      if (p.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    const connect = (a, b) => {
      const pa = keypoints[a], pb = keypoints[b];
      if (pa.visibility > 0.5 && pb.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(pa.x * canvas.width, pa.y * canvas.height);
        ctx.lineTo(pb.x * canvas.width, pb.y * canvas.height);
        ctx.stroke();
      }
    };

    connect(11, 13);
    connect(13, 15);
    connect(12, 14);
    connect(14, 16);
    connect(11, 23);
    connect(12, 24);
    connect(23, 25);
    connect(25, 27);
    connect(24, 26);
    connect(26, 28);
  };

  const capture = async () => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const blob = await fetch(imageSrc).then(res => res.blob());
      const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('frame', file);

      const res = await axios.post('http://127.0.0.1:5000/analyze', formData);
      setFeedback(res.data.bad_posture || []);
      setError('');

      if (res.data.keypoints) {
        drawKeypoints(res.data.keypoints, canvasRef.current);
      }

    } catch (err) {
      console.error("Axios error:", err);
      setError(" Could not connect to backend. Is Flask running?");
    }
  };

  return (
    <div className="webcam-container">
      <h1>Posture Detection App</h1>

      <div style={{ position: 'relative' }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={480}
          height={360}
          className="webcam-view"
        />
        <canvas
          ref={canvasRef}
          width={480}
          height={360}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        />
      </div>

      <button className="analyze-btn" onClick={capture}>Capture & Analyze</button>

      {error && <p className="error">{error}</p>}

      <ul className="feedback-list">
        {feedback.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default WebcamCapture;
