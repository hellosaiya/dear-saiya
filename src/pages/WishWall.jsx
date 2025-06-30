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
      <button className="back-button" onClick={() => navigate('/ourlittlespace')}>← Our Little Space</button>
      <h2 className="wishwall-heading fade-in">🌠 Wish Wall</h2>

      <div className="wishes-grid">
        {wishes.length === 0 ? (
          <p className="no-wishes">No wishes yet — make your first one ✨</p>
        ) : (
          wishes.map(wish => (
            <div key={wish.id} className="wish-card pop-in">
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
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="wish-form-popup">
          <form onSubmit={addOrEditWish} className="wish-form" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              placeholder="Wish Title (e.g., 'Travel to Paris')"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Describe your wish ✨"
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

      <button
        className="floating-add-button"
        onClick={() => {
          setForm({ title: '', message: '' });
          setShowForm(true);
        }}
      >
        + Add Wish
      </button>
    </main>
  );
}
