import { useEffect, useState } from "react";
import "../styles/Polls.css";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

export default function Polls() {
  const currentUser = localStorage.getItem("username") || "anon";
  const [polls, setPolls] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: null, question: "", options: ["", ""] });
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "polls"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPolls(data);
    });
    return () => unsub();
  }, []);

  const addOption = () =>
    setForm(prev => ({ ...prev, options: [...prev.options, ""] }));

  const handleOptionChange = (i, v) =>
    setForm(prev => {
      const ops = [...prev.options];
      ops[i] = v;
      return { ...prev, options: ops };
    });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.question || form.options.some(o => !o)) return;

    const docRef = form.id ? doc(db, "polls", form.id) : null;

    const optionsData = form.options.map((text, i) => {
      if (form.id) {
        const existing = polls.find(p => p.id === form.id)?.options[i];
        return {
          text,
          votes: existing?.votes || 0,
          voters: existing?.voters || [],
        };
      }
      return { text, votes: 0, voters: [] };
    });

    if (form.id) {
      await updateDoc(docRef, {
        question: form.question,
        options: optionsData,
      });
    } else {
      await addDoc(collection(db, "polls"), {
        question: form.question,
        options: optionsData,
        timestamp: serverTimestamp(),
      });
    }

    setForm({ id: null, question: "", options: ["", ""] });
    setShowForm(false);
    setIsEditing(false);
  };

  const handleVote = async (pId, idx) => {
    const poll = polls.find(p => p.id === pId);
    if (!poll) return;

    const options = poll.options.map((opt, i) => {
      const hasVoted = opt.voters?.includes(currentUser);
      if (i === idx && !hasVoted) {
        return {
          ...opt,
          votes: opt.votes + 1,
          voters: [...(opt.voters || []), currentUser],
        };
      } else if (i !== idx && hasVoted) {
        return {
          ...opt,
          votes: opt.votes - 1,
          voters: opt.voters.filter(u => u !== currentUser),
        };
      }
      return opt;
    });

    await updateDoc(doc(db, "polls", pId), { options });
  };

  const deleteOption = i =>
    setForm(prev => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== i),
    }));

  const handleEdit = p => {
    setForm({
      id: p.id,
      question: p.question,
      options: p.options.map(o => o.text),
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async id => await deleteDoc(doc(db, "polls", id));

  return (
    <div className="polls-page">
      <motion.button
        className="back-button"
        onClick={() => navigate("/ourlittlespace")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Our Little Space
      </motion.button>

      <h2 className="title">🗳️ Cute Polls</h2>

      <button
        className="add-poll-button"
        onClick={() => {
          setForm({ id: null, question: "", options: ["", ""] });
          setShowForm(true);
          setIsEditing(false);
        }}
      >
        + Add Poll
      </button>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-form fixed-size">
            <form onSubmit={handleSubmit}>
              <div className="form-scroll-area">
                <input
                  type="text"
                  placeholder="Enter your question"
                  value={form.question}
                  onChange={e =>
                    setForm(prev => ({ ...prev, question: e.target.value }))
                  }
                  required
                />
                {form.options.map((opt, i) => (
                  <div key={i} className="option-wrapper side-by-side">
                    <input
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={e => handleOptionChange(i, e.target.value)}
                      required
                    />
                    {i >= 2 && (
                      <button
                        type="button"
                        className="delete-option"
                        onClick={() => deleteOption(i)}
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-option" onClick={addOption}>
                  + Add Option
                </button>
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-btn">
                  {isEditing ? "Update Poll" : "Create Poll"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setForm({ id: null, question: "", options: ["", ""] });
                    setShowForm(false);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="polls-grid">
        {polls.length === 0 && (
          <p className="empty-text">No polls yet. Add something fun!</p>
        )}

        {polls.map(p => {
          const total = p.options.reduce((a, o) => a + o.votes, 0);
          return (
            <motion.div
              key={p.id}
              className="poll-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="poll-header">
                <h4>{p.question}</h4>
                <div className="card-actions">
                  <button className="edit-btn" onClick={() => handleEdit(p)}>
                    <FiEdit2 />
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(p.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <div className="options">
                {p.options.map((opt, i) => {
                  const percent = total
                    ? Math.round((opt.votes / total) * 100)
                    : 0;
                  const isSelected = opt.voters?.includes(currentUser);
                  return (
                    <div key={i} className="option-wrapper">
                      <button
                        className={`option-btn ${isSelected ? "selected" : ""}`}
                        onClick={() => handleVote(p.id, i)}
                      >
                        {opt.text}
                      </button>
                      <div className="vote-bar">
                        <div className="vote-fill" style={{ width: `${percent}%` }}></div>
                        <span>{percent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
