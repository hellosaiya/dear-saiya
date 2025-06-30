// src/components/WhoAreYouModal.jsx
import "../styles/WhoAreYouModal.css";

export default function WhoAreYouModal({ onSelect }) {
  return (
    <div className="who-modal-overlay">
      <div className="who-modal-box">
        <h2 className="who-modal-title">Who are you?</h2>
        <div className="who-buttons">
          <button onClick={() => onSelect("Sai")} className="who-btn sai">
            Sai
          </button>
          <button onClick={() => onSelect("Sia")} className="who-btn sia">
            Sia
          </button>
        </div>
      </div>
    </div>
  );
}
