// src/pages/MissYou.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import confetti from "canvas-confetti";
import "../styles/MissYou.css";

export default function MissYou() {
  const username = localStorage.getItem("username");
  const [total, setTotal] = useState({ sai: 0, sia: 0 });
  const [animate, setAnimate] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const dailyRef = doc(db, "missYouCounts", "daily");
  const totalRef = doc(db, "missYouCounts", "total");

  const getTodayMidnight = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(today);
  };

  useEffect(() => {
    const unsubTotal = onSnapshot(totalRef, (docSnap) => {
      if (docSnap.exists()) {
        setTotal(docSnap.data());
      }
    });

    const unsubDaily = onSnapshot(dailyRef, async (docSnap) => {
      if (!docSnap.exists()) return;

      const data = docSnap.data();
      const lastReset = data.lastReset;

      if (!lastReset || lastReset.toDate() < getTodayMidnight().toDate()) {
        await setDoc(dailyRef, {
          sai: 0,
          sia: 0,
          lastReset: serverTimestamp(),
        });
      }
    });

    return () => {
      unsubTotal();
      unsubDaily();
    };
  }, []);

  const sadConfetti = () => {
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
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      gravity: 0.8,
      scalar: 1.5,
      shapes: ["circle"],
      colors: ["#6c5b7b", "#b2a2c0", "#8a7ca7", "#a3a1c0"],
    });

    setTimeout(() => document.body.removeChild(canvas), 1500);
  };

  const handleClick = async () => {
    if (!username || (username !== "Sai" && username !== "Sia")) {
      alert("User not identified");
      return;
    }

    const userKey = username.toLowerCase();

    const totalSnap = await getDoc(totalRef);
    const currentTotal = totalSnap.exists() ? totalSnap.data() : {};
    const updatedTotal = {
      ...currentTotal,
      [userKey]: (currentTotal[userKey] || 0) + 1,
    };
    await setDoc(totalRef, updatedTotal);

    const dailySnap = await getDoc(dailyRef);
    const currentDaily = dailySnap.exists() ? dailySnap.data() : {};
    const updatedDaily = {
      ...currentDaily,
      [userKey]: (currentDaily[userKey] || 0) + 1,
      lastReset: currentDaily.lastReset || serverTimestamp(),
    };
    await setDoc(dailyRef, updatedDaily);

    sadConfetti();
    setAnimate(true);
    setShowEmoji(true);
    setTimeout(() => {
      setAnimate(false);
      setShowEmoji(false);
    }, 1000);
  };

  const other = username === "Sai" ? "Sia" : "Sai";
  const message =
    username === "Sai"
      ? total.sia > 0
        ? "Sia is missing you today 💔"
        : "Ready to say you miss her?"
      : total.sai > 0
      ? "Sai is missing you today 💔"
      : "Ready to say you miss him?";

  return (
    <div className="hug-wrapper">
      <div className="floating-hearts" />
      <button className="back-button" onClick={() => window.history.back()}>
        ← Our Little Space
      </button>

      <motion.div
        className="hug-card"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hug-top">
          <div className="hug-emoji">😢</div>
          <div className="hug-message">{message}</div>
        </div>

        <motion.button
          onClick={handleClick}
          className={`hug-reply-button ${animate ? "sparkle" : ""}`}
          whileTap={{ scale: 0.95 }}
        >
          I Miss You 💔
        </motion.button>

        <div className="hug-counter-box">
          <div className="hug-count">
            <p className="label">Sai 💙</p>
            <div className="count">{total.sai}</div>
          </div>
          <div className="hug-count">
            <p className="label">Sia 💖</p>
            <div className="count">{total.sia}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
