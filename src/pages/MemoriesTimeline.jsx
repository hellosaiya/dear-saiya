// src/pages/MemoriesTimeline.jsx
import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import "../styles/MemoriesTimeline.css";

const getCurrentUser = () => localStorage.getItem("love_user");

export default function MemoriesTimeline() {
  const [memories, setMemories] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: "",
    date: "",
    description: "",
    image: null,
  });
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    const q = query(collection(db, "memories"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const filtered = all.filter((mem) => mem.createdBy !== user);
      setMemories(all);
    });

    return () => unsubscribe();
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, date, description, image, id } = form;
    if (!title || !date || !description || !image) return;

    try {
      if (isEditing && id) {
        const docRef = doc(db, "memories", id);
        await updateDoc(docRef, {
          title,
          date,
          description,
          image,
          timestamp: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "memories"), {
          title,
          date,
          description,
          image,
          createdBy: user,
          timestamp: serverTimestamp(),
        });
      }

      setForm({
        id: null,
        title: "",
        date: "",
        description: "",
        image: null,
      });
      setIsEditing(false);
      setShowForm(false);
    } catch (err) {
      console.error("Error saving memory:", err);
    }
  };

  const handleEdit = (memory) => {
    setForm({
      id: memory.id,
      title: memory.title,
      date: memory.date,
      description: memory.description,
      image: memory.image,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "memories", id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <>
      <main className="memory-wall">
        <motion.button
          className="back-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.back()}
        >
          ← Our Little Space
        </motion.button>

        <motion.h2
          className="memory-title"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          📸 Our Memories Wall
        </motion.h2>

        <div className="polaroid-grid">
          {memories.length === 0 ? (
            <p className="no-memories">No memories from your partner yet.</p>
          ) : (
            memories.map((mem, index) => (
              <motion.div
                key={mem.id}
                className="polaroid-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
              >
                <img src={mem.image} alt={mem.title} />
                <div className="caption">
                  <strong>{mem.title}</strong>
                  <small>{new Date(mem.date).toLocaleDateString()}</small>
                  <p>{mem.description}</p>
                  <div className="card-actions">
                    <button onClick={() => handleEdit(mem)} title="Edit">
                      <FiEdit2 />
                    </button>
                    <button onClick={() => handleDelete(mem.id)} title="Delete">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      <motion.button
        className="upload-float-btn"
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setShowForm(true);
          setIsEditing(false);
          setForm({
            id: null,
            title: "",
            date: "",
            description: "",
            image: null,
          });
        }}
      >
        + Upload
      </motion.button>

      {showForm && (
        <div className="form-modal">
          <form className="memory-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Write about the memory..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <div className="modal-inputs">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                required={!form.image}
              />
            </div>
            <div className="modal-buttons">
              <button type="submit">
                {isEditing ? "Update" : "Add"} Memory
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
