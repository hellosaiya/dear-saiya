import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import confetti from "canvas-confetti";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import "../styles/VirtualHug.css";

export default function VirtualHug() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [hugData, setHugData] = useState({
    from: "",
    timestamp: "",
    counts: { Sai: 0, Sia: 0 },
    lastReset: "",
  });
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);

  const HUG_DOC = doc(db, "virtualHug", "hug");

  const getTodayDateString = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };

  const resetIfNeeded = async (data) => {
    const today = getTodayDateString();
    if (!data.lastReset || data.lastReset !== today) {
      const resetData = {
        from: "",
        timestamp: "",
        counts: { Sai: 0, Sia: 0 },
        lastReset: today,
      };
      await setDoc(HUG_DOC, resetData);
      return resetData;
    }
    return data;
  };

  const playSendSound = () => {
    const sound = new Audio("/sounds/send.mp3");
    sound.play().catch(() => {});
  };

  const heartConfetti = () => {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    myConfetti({
      particleCount: 60,
      spread: 90,
      origin: { y: 0.6 },
      scalar: 2,
      shapes: ["circle"],
      colors: ["#ff6b81", "#ff9ff3", "#f368e0", "#feca57"],
    });

    setTimeout(() => document.body.removeChild(canvas), 1500);
  };

  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (stored) setUsername(stored);
    else navigate("/");

    const unsub = onSnapshot(HUG_DOC, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const validData = await resetIfNeeded(data);
        setHugData(validData);
      } else {
        const fresh = {
          from: "",
          timestamp: "",
          counts: { Sai: 0, Sia: 0 },
          lastReset: getTodayDateString(),
        };
        await setDoc(HUG_DOC, fresh);
        setHugData(fresh);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [navigate]);

  const sendHug = async () => {
    const now = new Date().toISOString();
    const newCount = {
      ...hugData.counts,
      [username]: (hugData.counts?.[username] || 0) + 1,
    };

    const newData = {
      from: username,
      timestamp: now,
      counts: newCount,
      lastReset: getTodayDateString(),
    };

    try {
      await setDoc(HUG_DOC, newData);
      setSent(true);
      playSendSound();

      const btn = document.querySelector(".hug-reply-button");
      btn?.classList.remove("sparkle");
      void btn?.offsetWidth;
      btn?.classList.add("sparkle");
    } catch (err) {
      console.error("Failed to send hug:", err);
    }
  };

  const isHugForMe = hugData.from && username && hugData.from !== username;
  const yourHugs = hugData.counts?.[username] || 0;
  const other = username === "Sai" ? "Sia" : "Sai";
  const otherHugs = hugData.counts?.[other] || 0;

  useEffect(() => {
    if (isHugForMe) heartConfetti();
  }, [isHugForMe]);

  return (
    <div className="hug-wrapper">
      <button className="back-button" onClick={() => navigate("/ourlittlespace")}>← Our Little Space</button>

      <motion.div
        className="hug-card"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="hug-top">
          <div className="hug-emoji">🤗</div>
          <div className="hug-message">
            {isHugForMe ? (
              <>
                <strong>{hugData.from}</strong> just sent you a warm hug! 💌
              </>
            ) : sent ? (
              "Your hug sent! 💖"
            ) : (
              "Ready to send a warm hug?"
            )}
          </div>
        </div>

        {!sent && (
          <button className="hug-reply-button" onClick={sendHug}>
            {isHugForMe ? "Send a Hug Back 💌" : "Send a Hug 💌"}
          </button>
        )}

        <div
          className="hug-counter-box"
          style={{ visibility: username ? "visible" : "hidden" }}
        >
          <div className="hug-count">
            <p className="label">You</p>
            <div className="count">
              <CountUp end={yourHugs} duration={0.5} />
            </div>
          </div>
          <div className="hug-count">
            <p className="label">{other}</p>
            <div className="count">
              <CountUp end={otherHugs} duration={0.5} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
