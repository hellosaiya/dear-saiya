import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import Confetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import '../styles/SpecialDay.css';

export default function SpecialDay() {
  const { width, height } = useWindowSize();
  const navigate = useNavigate();
  const [specialDays, setSpecialDays] = useState([]);
  const [todayEvent, setTodayEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', date: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'specialDays'), orderBy('date'));
    const unsub = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSpecialDays(data);

      const todayStr = new Date().toISOString().split('T')[0];
      const match = data.find(d => d.date === todayStr);
      setTodayEvent(match || null);
    });

    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label || !form.date) return;

    if (editingId) {
      await updateDoc(doc(db, 'specialDays', editingId), {
        label: form.label,
        date: form.date,
      });
    } else {
      await addDoc(collection(db, 'specialDays'), {
        label: form.label,
        date: form.date,
      });
    }

    setForm({ label: '', date: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'specialDays', id));
  };

  const handleEdit = (item) => {
    setForm({ label: item.label, date: item.date });
    setEditingId(item.id);
    setShowForm(true);
  };

  const getCelebrationTitle = (label) => {
    const lower = label.toLowerCase();
    if (lower.includes('birthday')) return `Happy Birthday, Love! 🎂`;
    if (lower.includes('anniversary')) return `Happy Anniversary, Love! 💍`;
    return `Happy ${label}, Love! 💖`;
  };

  return (
    <main className="special-container">
      <motion.button
        className="back-button"
        onClick={() => navigate("/ourlittlespace")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Our Little Space
      </motion.button>

      {!todayEvent && <h2 className="special-title">🎉 Special Days</h2>}

      {todayEvent && (
        <>
          <Confetti width={width} height={height} numberOfPieces={250} />
          <div className="celebration-card scale-up">
            <h1>{getCelebrationTitle(todayEvent.label)}</h1>
            <p>Wishing us a lifetime of memories, hugs, and happiness together!</p>
            <audio autoPlay loop className="special-audio">
              <source src="/love-tune.mp3" type="audio/mp3" />
            </audio>
          </div>
        </>
      )}

      {!todayEvent && specialDays.length === 0 ? (
        <p className="not-today-text">Today isn't a marked special day... but you're always special 💕</p>
      ) : (
        !todayEvent && (
          <div className="special-day-list fade-in">
            {specialDays.map((d, i) => (
              <motion.div
                key={i}
                className="special-day-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <h4>{d.label}</h4>
                <p>{d.date}</p>
                <div className="special-day-actions">
                  <button onClick={() => handleEdit(d)}><FiEdit2 /></button>
                  <button onClick={() => handleDelete(d.id)}><FiTrash2 /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {showForm && (
        <div className="special-form-overlay" onClick={() => {
          setShowForm(false);
          setEditingId(null);
        }}>
          <form
            className="special-form bounce-in"
            onClick={e => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder="Our special days baby..."
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              required
            />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            <div className="form-buttons">
              <button type="submit">{editingId ? 'Update' : 'Save'}</button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <button className="floating-add-button" onClick={() => {
        setShowForm(true);
        setForm({ label: '', date: '' });
        setEditingId(null);
      }}>
        + Special Day
      </button>
    </main>
  );
}
