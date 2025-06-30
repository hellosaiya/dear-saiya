// src/pages/LoveCalendar.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../config/firebase";
import "../styles/LoveCalendar.css";

export default function LoveCalendar() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Unknown";

  useEffect(() => {
    const q = query(collection(db, "loveCalendar"), orderBy("date"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(items);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date) return;

    if (editingId) {
      await updateDoc(doc(db, "loveCalendar", editingId), { title, date });
      setEditingId(null);
    } else {
      await addDoc(collection(db, "loveCalendar"), {
        title,
        date,
        createdBy: username,
      });
    }

    setTitle("");
    setDate("");
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setTitle(event.title);
    setDate(event.date);
  };

  const handleDelete = async (id) => {
    if (editingId === id) {
      setEditingId(null);
      setTitle("");
      setDate("");
    }
    await deleteDoc(doc(db, "loveCalendar", id));
  };

  return (
    <div className="calendar-page">
      <button className="back-button" onClick={() => navigate("/ourlittlespace")}>
        ← Our Little Space
      </button>
      <h1 className="calendar-title">🗓️ Love Calendar</h1>

      <motion.form
        className="calendar-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <input
          type="text"
          placeholder="e.g., Our Anniversary 💖"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit">
          {editingId ? "Update Event" : "Add Event"}
        </button>
      </motion.form>

      <div className="event-list">
        {events.length === 0 ? (
          <p className="no-events">No events added yet!</p>
        ) : (
          <ul>
            <AnimatePresence>
              {events.map((event, index) => (
                <motion.li
                  key={event.id}
                  className="event-item"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <div className="event-info">
                    <span className="event-title">{event.title}</span>
                    <span className="event-date">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="event-actions">
                    <button
                      className="icon-btn"
                      onClick={() => handleEdit(event)}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => handleDelete(event.id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
