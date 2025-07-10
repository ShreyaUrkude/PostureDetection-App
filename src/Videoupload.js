import React, { useState } from 'react';
import axios from 'axios';

function VideoUpload() {
  const [feedback, setFeedback] = useState([]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.currentTime = 1;

    video.onloadeddata = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        canvas.toBlob(async (blob) => {
          if (!blob) {
            alert(" Could not read video frame. Try another video.");
            return;
          }

          const frameFile = new File([blob], 'frame.jpg', { type: 'image/jpeg' });
          const formData = new FormData();
          formData.append('frame', frameFile);

          const res = await axios.post('http://127.0.0.1:5000/analyze', formData);

          if (res.data?.error) {
            alert(res.data.error); 
            setFeedback([]);
            return;
          }

          const filteredFeedback = (res.data.bad_posture || []).filter(msg =>
            msg.toLowerCase().includes('knee') ||
            msg.toLowerCase().includes('toe') ||
            msg.toLowerCase().includes('back') ||
            msg.toLowerCase().includes('neck')
          );

          setFeedback(filteredFeedback);

          if (filteredFeedback.length > 0) {
            alert("Bad posture detected:\n- " + filteredFeedback.join("\n- "));
          } else {
            alert("File uploaded successfully!");
          }
        }, 'image/jpeg');
      } catch (err) {
        console.error(" Upload error:", err.message);
        alert(" Upload failed. Please try again.");
      }
    };

    video.onerror = () => {
      alert(" Could not load video. Please upload a valid video file.");
    };
  };

  return (
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      <input type="file" accept="video/*" onChange={handleUpload} />

      {feedback.length > 0 && (
        <ul style={{ color: "red", fontWeight: "bold", marginTop: "15px" }}>
          {feedback.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default VideoUpload;
