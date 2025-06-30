import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { motion } from "framer-motion";
import "../styles/GiftWishlist.css";

export default function GiftWishlist() {
  const [gifts, setGifts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: "",
    description: "",
    link: "",
    addedBy: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "gifts"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGifts(data);
    });

    return () => unsub();
  }, []);

  const isValidLink = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    if (form.link && !isValidLink(form.link)) {
      alert("Please enter a valid URL for the link.");
      return;
    }

    const giftData = {
      name: form.name,
      description: form.description,
      link: form.link,
      addedBy: form.addedBy || "Sai",
      timestamp: serverTimestamp(),
    };

    if (isEditing && form.id) {
      await updateDoc(doc(db, "gifts", form.id), giftData);
    } else {
      await addDoc(collection(db, "gifts"), giftData);
    }

    setForm({ id: null, name: "", description: "", link: "", addedBy: "" });
    setIsEditing(false);
    setShowForm(false);
  };

  const handleEdit = (gift) => {
    setForm({
      id: gift.id,
      name: gift.name,
      description: gift.description || "",
      link: gift.link || "",
      addedBy: gift.addedBy || "Sai",
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "gifts", id));
  };

  return (
    <div className="gift-page">
      <motion.button
        className="back-button"
        onClick={() => navigate("/ourlittlespace")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Our Little Space
      </motion.button>

      <h2 className="gift-title">🎁 Gift Wishlist</h2>

      {gifts.length === 0 ? (
        <p className="gift-empty">Kya gift chahiye cutiepie, add krdo!</p>
      ) : (
        <div className="gift-list">
          {gifts.map((gift) => (
            <motion.div
              key={gift.id}
              className="gift-card pop-in"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="gift-card-actions">
                <button onClick={() => handleEdit(gift)} title="Edit">
                  <FiEdit2 />
                </button>
                <button onClick={() => handleDelete(gift.id)} title="Delete">
                  <FiTrash2 />
                </button>
              </div>
              <p><strong>{gift.name}</strong></p>
              {gift.description && <p>{gift.description}</p>}
              {gift.link && isValidLink(gift.link) && (
                <a href={gift.link} target="_blank" rel="noopener noreferrer">
                  Gift Dekho
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <button className="gift-add-btn" onClick={() => setShowForm(true)}>
        + Add Gift
      </button>

      {showForm && (
        <div className="gift-popup" onClick={() => setShowForm(false)}>
          <form
            className="gift-form"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder="Mera baby ko kya chahiye?"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Uske baare mein likho"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              type="text"
              placeholder="Link dedo please"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
            <div className="gift-form-actions">
              <button type="submit">
                {isEditing ? "Update" : "Add"} Gift
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
