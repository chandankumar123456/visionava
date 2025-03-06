import { useState, useRef, useEffect } from "react";
import axios from "axios";

function App() {
  const [response, setResponse] = useState(null);
  const [userId, setUserId] = useState("12345");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  
  useEffect(() => {
    startCamera();
  }, []);

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  // Capture Image and Send to API
  const captureAndSendFrame = async () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("face", blob, "frame.jpg"); // Convert frame to image
      formData.append("user_id", userId);

      try {
        const res = await axios.post("http://127.0.0.1:5000/unified_emotion", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setResponse(res.data.chatbot_response);
      } catch (error) {
        console.error("Error sending frame:", error);
      }
    }, "image/jpeg");
  };

  // Start Streaming (capture every 3 seconds)
  const startStreaming = () => {
    if (!isStreaming) {
      setIsStreaming(true);
      setInterval(captureAndSendFrame, 3000);
    }
  };
// Start Recording Voice
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    let audioChunks = [];
    recorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("voice", audioBlob, "voice.wav");
      formData.append("user_id", "12345");

      try {
        const res = await axios.post("http://127.0.0.1:5000/unified_emotion", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setResponse(res.data.chatbot_response);
      } catch (error) {
        console.error("Error sending voice:", error);
      }
    };

    recorder.start();
    setIsRecording(true);
    setTimeout(() => {
      recorder.stop();
      setIsRecording(false);
    }, 5000); // Record for 5 seconds
  } catch (error) {
    console.error("Error recording audio:", error);
  }
};
  return (
    <div>
      <h1>Live Emotion Detection</h1>

      <video ref={videoRef} autoPlay playsInline width="400"></video>
      <canvas ref={canvasRef} style={{ display: "none" }} width="400" height="300"></canvas>

      <button onClick={startStreaming}>Start Live Analysis</button>
      <button onClick={startRecording}>
        {isRecording ? "Recording..." : "Start Voice Recording"}
      </button>
      {response && <p>Therapy Response: {response}</p>}
    </div>
  );
}

export default App;


// import { useState, useRef, useState } from "react";
// import axios from "axios";

// function App() {
//   const [imageFile, setImageFile] = useState(null);
//   const [audioFile, setAudioFile] = useState(null);
//   const [response, setResponse] = useState(null);

//   // Handle image selection
//   const handleImageChange = (event) => {
//     setImageFile(event.target.files[0]);
//   };

//   // Handle audio selection
//   const handleAudioChange = (event) => {
//     setAudioFile(event.target.files[0]);
//   };

//   // Submit both files to API
//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (!imageFile || !audioFile) {
//       alert("Please select both an image and an audio file.");
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("face", imageFile); // Ensure API expects 'image'
//       formData.append("voice", audioFile); // Ensure API expects 'voice'
//       formData.append("user_id", "12345");

//       console.log("Sending FormData:", formData);

//       const res = await axios.post("http://127.0.0.1:5000/unified_emotion", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       setResponse(res.data.chatbot_response); // Display therapy response
//     } catch (error) {
//       console.error("Error sending data:", error);
//     }
//   };

//   return (
//     <div>
//       <h1>Emotion Detection & Therapy Response</h1>
//       <form onSubmit={handleSubmit}>
//         <label>Upload Image:</label>
//         <input type="file" onChange={handleImageChange} />

//         <label>Upload Voice:</label>
//         <input type="file" onChange={handleAudioChange} />

//         <button type="submit">Analyze</button>
//       </form>

//       {response && <p>Therapy Response: {response}</p>}
//     </div>
//   );
// }

// export default App;
