import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/StickyNotesWall.css';

const lavenderColors = ['#e6d7f5', '#f6ecff', '#fff4ff', '#f0dfff', '#d6c3eb'];

export default function StickyNotesWall() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', text: '' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const user = localStorage.getItem('username') || 'Unknown';
  const notesRef = collection(db, 'stickyNotes');

  useEffect(() => {
    const unsubscribe = onSnapshot(notesRef, (snapshot) => {
      const notesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(notesList.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds));
    });

    return () => unsubscribe();
  }, []);

  const openForm = (note = null) => {
    if (note) {
      setForm({ title: note.title, text: note.text });
      setEditingId(note.id);
    } else {
      setForm({ title: '', text: '' });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.text) return;

    const noteData = {
      title: form.title,
      text: form.text,
      color: lavenderColors[Math.floor(Math.random() * lavenderColors.length)],
      addedBy: user,
      timestamp: serverTimestamp(),
    };

    try {
      if (editingId) {
        const noteDoc = doc(db, 'stickyNotes', editingId);
        await updateDoc(noteDoc, noteData);
      } else {
        await addDoc(notesRef, noteData);
      }
    } catch (error) {
      console.error("Error saving note:", error);
    }

    setForm({ title: '', text: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const deleteNote = async (id) => {
    try {
      await deleteDoc(doc(db, 'stickyNotes', id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <main className="sticky-notes-container">
      <motion.button
        className="back-button"
        onClick={() => navigate('/ourlittlespace')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Our Little Space
      </motion.button>

      <h2 className="page-title">📝 Sticky Notes Wall</h2>

      {notes.length === 0 ? (
        <p className="no-notes">Nothing pinned yet! Add your first note 💛</p>
      ) : (
        <div className="notes-grid">
          {notes.map(note => (
            <motion.div
              key={note.id}
              className="note-card pop-in"
              style={{ backgroundColor: note.color }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="note-card-actions">
                <button onClick={() => openForm(note)} title="Edit"><FiEdit2 /></button>
                <button onClick={() => deleteNote(note.id)} title="Delete"><FiTrash2 /></button>
              </div>
              <strong>{note.title}</strong>
              <p>{note.text}</p>
              <small className="added-by">— {note.addedBy || 'Unknown'}</small>
            </motion.div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="form-overlay" onClick={() => setShowForm(false)}>
          <form
            className="popup-form"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Your note..."
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              rows={4}
              required
            />
            <div className="form-buttons">
              <button type="submit">{editingId ? 'Update Note' : 'Pin Note'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <button className="floating-add-btn" onClick={() => openForm()}>+ Add Note</button>
    </main>
  );
}
