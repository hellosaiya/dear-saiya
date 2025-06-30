import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import "../styles/AnimatedMessage.css";
import { motion } from "framer-motion";

const moods = ["🥹", "🥰", "😭", "🤗", "❤️"];

export default function AnimatedMessage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [messageData, setMessageData] = useState(null);
  const [replyMode, setReplyMode] = useState(false);
  const [message, setMessage] = useState("");
  const [mood, setMood] = useState(moods[0]);
  const [submitting, setSubmitting] = useState(false);

  const messageDoc = doc(db, "messages", "latest");

  useEffect(() => {
    const unsub = onSnapshot(messageDoc, (docSnap) => {
      if (docSnap.exists()) {
        setMessageData(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    await setDoc(messageDoc, {
      sender: username,
      text: message,
      mood,
      timestamp: new Date().toISOString(),
    });
    setMessage("");
    setReplyMode(false);
    setSubmitting(false);
  };

  const isReceived = messageData && messageData.sender !== username;

  return (
    <div className="animated-message-page">
      <motion.button
        className="back-button"
        onClick={() => navigate("/ourlittlespace")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Our Little Space
      </motion.button>
      <h2 className="title"></h2>
      <div className="message-card">
        <div className="message-top">
          {messageData ? (
            <>
              {!replyMode && (
                <>
                  <div className="emoji-display">
                    <span
                      className={`emoji ${isReceived ? "highlighted" : ""}`}
                    >
                      {messageData.mood}
                    </span>
                  </div>

                  <div className="message-text">{messageData.text}</div>

                  <div className="sender-info">
                    {isReceived ? `From ${messageData.sender}` : "You sent this"}
                  </div>

                  {isReceived && (
                    <button className="reply-button" onClick={() => setReplyMode(true)}>
                      Reply 💬
                    </button>
                  )}
                </>
              )}

              {replyMode && (
                <form className="reply-form" onSubmit={handleSubmit}>
                  <div className="mood-selector">
                    {moods.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMood(m)}
                        className={`mood-btn ${mood === m ? "active" : ""}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your reply..."
                    required
                  />

                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? "Sending..." : "Send 💌"}
                  </button>
                </form>
              )}
            </>
          ) : (
            <p className="loading-message">Loading message...</p>
          )}
        </div>
      </div>
    </div>
  );
}