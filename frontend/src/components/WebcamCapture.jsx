
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

export default function WebcamCapture({ onCapture, disabled }) {
  const camRef = useRef(null);
  const [snap, setSnap] = useState(null);

  const capture = () => {
    const imageSrc = camRef.current.getScreenshot();
    setSnap(imageSrc);
    onCapture?.(imageSrc);
  };

  const retake = () => {
    setSnap(null);
    onCapture?.(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "12px 0" }}>
      {!snap ? (
        <Webcam
          ref={camRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user" }}
          style={{
            width: "350px",
            height: "260px",
            borderRadius: "10px",
            border: "2px solid #ddd",
            objectFit: "cover",
            marginBottom: "12px"
          }}
        />
      ) : (
        <img
          src={snap}
          alt="preview"
          style={{
            width: "350px",
            height: "260px",
            borderRadius: "10px",
            border: "2px solid #ddd",
            objectFit: "cover",
          }}
        />
      )}

      <div style={{ marginTop: "8px" }}>
        {!snap ? (
          <button
            onClick={capture}
            disabled={disabled}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "8px",
              background: "#1976d2",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            Capture
          </button>
        ) : (
          <button
            onClick={retake}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "8px",
              background: "#757575",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Retake
          </button>
        )}
      </div>
    </div>
  );
}