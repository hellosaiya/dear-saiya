import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where
} from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import "../styles/MoodMeter.css";

const moods = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😠", label: "Angry" },
  { emoji: "😍", label: "In Love" },
  { emoji: "😴", label: "Tired" },
  { emoji: "😎", label: "Chill" },
];

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MoodMeter() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [otherMoods, setOtherMoods] = useState([]);
  const [clickedTileIndex, setClickedTileIndex] = useState(null);

  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "moods"),
      where("timestamp", ">=", todayStart),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const moodsData = snapshot.docs.map((doc) => doc.data());
      const others = moodsData.filter((m) => m.user !== username);
      setOtherMoods(others.reverse());
    });

    return () => unsub();
  }, [username]);

  const playMoodSound = () => {
    const sound = new Audio("/sounds/mood.mp3");
    sound.play().catch(() => {});
  };

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    playMoodSound();
    try {
      await addDoc(collection(db, "moods"), {
        user: username,
        emoji: mood.emoji,
        label: mood.label,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error saving mood:", error);
    }
  };

  const getTileAnimation = (label) => {
    switch (label) {
      case "Happy":
        return { scale: [1, 1.1, 1], rotate: [0, 3, -3, 0] };
      case "Sad":
        return { y: [0, 6, 0], opacity: [1, 0.8, 1] };
      case "Angry":
        return { rotate: [0, -5, 5, -5, 0], scale: [1, 1.05, 1] };
      case "In Love":
        return { scale: [1, 1.15, 1], boxShadow: "0 0 10px pink" };
      case "Tired":
        return { scale: [1, 0.95, 1], opacity: [1, 0.7, 1] };
      case "Chill":
        return { rotate: [0, 2, -2, 0], scale: [1, 1.05, 1] };
      default:
        return {};
    }
  };

  const handleTileClick = (index) => {
    setClickedTileIndex(index);
    setTimeout(() => setClickedTileIndex(null), 500);
  };

  return (
    <div className="mood-meter-page">
      <button className="back-button" onClick={() => navigate("/ourlittlespace")}>
        ← Our Little Space
      </button>

      <h2 className="mood-title">How is my baby's mood now?</h2>

      <div className="mood-options">
        {moods.map((mood) => (
          <button
            key={mood.label}
            onClick={() => handleMoodSelect(mood)}
            className={`mood-option ${selectedMood?.label === mood.label ? "active" : ""}`}
          >
            {mood.emoji}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedMood && (
          <motion.p
            key={selectedMood.label}
            className="mood-result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            You’re feeling <strong>{selectedMood.label}</strong> now {selectedMood.emoji}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mood-card-grid">
        {otherMoods.map((entry, index) => (
          <motion.div
            key={index}
            className="mood-card"
            onClick={() => handleTileClick(index)}
            animate={clickedTileIndex === index ? getTileAnimation(entry.label) : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="mood-entry">
              <span className="mood-user">{entry.user}</span> felt
              <span className="mood-label"> {entry.label}</span>{" "}
              <span className="mood-emoji">{entry.emoji}</span> at{" "}
              <span className="mood-time">{formatTime(entry.timestamp.toDate?.() || entry.timestamp)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
