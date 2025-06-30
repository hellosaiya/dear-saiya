// src/components/WhoAreYouModal.jsx
import { useEffect, useState } from "react";
import "../styles/WhoAreYouModal.css";

export default function WhoAreYouModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (!storedUser) {
      setShow(true);
    }
  }, []);

  const handleSelect = (name) => {
    localStorage.setItem("username", name);
    setShow(false);
    window.location.reload(); // reload so features reinitialize
  };

  if (!show) return null;

  return (
    <div className="who-modal-overlay">
      <div className="who-modal-box">
        <h2 className="who-modal-title">Who are you?</h2>
        <div className="who-buttons">
          <button onClick={() => handleSelect("Sai")} className="who-btn sai">
            Sia
          </button>
          <button onClick={() => handleSelect("Sia")} className="who-btn sia">
            Sai
          </button>
        </div>
      </div>
    </div>
  );
}
