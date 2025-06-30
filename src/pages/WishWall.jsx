// src/pages/WishWall.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { motion } from 'framer-motion';
import '../styles/WishWall.css';

export default function WishWall() {
  const [wishes, setWishes] = useState([]);
  const [form, setForm] = useState({ title: '', message: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const user = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'wishwall'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const wishData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setWishes(wishData);
    });
    return () => unsub();
  }, []);

  const addOrEditWish = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;

    if (editingId) {
      const ref = doc(db, 'wishwall', editingId);
      await updateDoc(ref, { ...form });
    } else {
      await addDoc(collection(db, 'wishwall'), {
        ...form,
        user,
        timestamp: serverTimestamp()
      });
    }

    setForm({ title: '', message: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const deleteWish = async (id) => {
    await deleteDoc(doc(db, 'wishwall', id));
  };

  const openEditForm = (wish) => {
    setForm({ title: wish.title, message: wish.message });
    setEditingId(wish.id);
    setShowForm(true);
  };

  return (
    <main className="wishwall-container">
      <motion.button
        className="back-button"
        onClick={() => navigate('/ourlittlespace')}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        ← Our Little Space
      </motion.button>

      <motion.h2
        className="wishwall-heading"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        🌠 Wish Wall
      </motion.h2>

      <div className="wishes-grid">
        {wishes.length === 0 ? (
          <div className="no-wishes">
          <p>Baby, apna travel plans banayenge, sab likh do idar!</p>
        </div>
        
        ) : (
          wishes.map(wish => (
            <motion.div
              key={wish.id}
              className="wish-card"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="wish-actions">
                <button onClick={() => openEditForm(wish)} title="Edit">
                  <FiEdit2 />
                </button>
                <button onClick={() => deleteWish(wish.id)} title="Delete">
                  <FiTrash2 />
                </button>
              </div>
              <h4>🌟 {wish.title}</h4>
              <p>{wish.message}</p>
              <span className="wish-user">— {wish.user || "Unknown"}</span>
            </motion.div>
          ))
        )}
      </div>

      {showForm && (
        <div className="wish-form-popup">
          <form onSubmit={addOrEditWish} className="wish-form" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              placeholder="Kaha jaana hai baby?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Uske baare mein batao..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
            <div className="wish-form-buttons">
              <button type="submit">{editingId ? "Save Wish" : "Make a Wish"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <motion.button
        className="floating-add-button"
        onClick={() => {
          setForm({ title: '', message: '' });
          setShowForm(true);
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        + Add Wish
      </motion.button>
    </main>
  );
}
