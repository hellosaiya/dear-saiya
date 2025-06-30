import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { FiTrash2 } from "react-icons/fi";
import "../styles/SpotifyPlaylist.css";
import { motion } from "framer-motion";

export default function SpotifyPlaylist() {
  const [playlists, setPlaylists] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [showForm, setShowForm] = useState(false);

  const playlistsRef = collection(db, "spotifyPlaylists");

  useEffect(() => {
    const unsub = onSnapshot(playlistsRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlaylists(data);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showForm]);

  const getEmbedUrl = (inputUrl) => {
    const match = inputUrl.match(/(playlist\/[a-zA-Z0-9]+)/);
    if (match) {
      return `https://open.spotify.com/embed/${match[1]}`;
    }
    return "";
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const embedUrl = getEmbedUrl(url);
    if (!embedUrl) return alert("Invalid Spotify playlist link.");

    await addDoc(playlistsRef, {
      title,
      url: embedUrl,
      timestamp: serverTimestamp(),
    });

    setTitle("");
    setUrl("");
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "spotifyPlaylists", id));
  };

  return (
    <div className="spotify-page">
      {/* Animated Back Button */}
      <motion.button
        className="back-button"
        onClick={() => window.history.back()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Our Little Space
      </motion.button>

      <motion.h2
        className="spotify-title"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        🎶 Songs that bring us closer 💖
      </motion.h2>

      <div className="playlist-grid">
        {playlists.map((playlist, index) => (
          <motion.div
            key={playlist.id}
            className="playlist-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            <div className="playlist-title">
              <strong>{playlist.title}</strong>
              <button
                className="delete-btn"
                onClick={() => handleDelete(playlist.id)}
                title="Delete playlist"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
            <iframe
              src={playlist.url}
              width="100%"
              height="380"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={playlist.title}
            ></iframe>
          </motion.div>
        ))}
      </div>

      <motion.button className="add-button" onClick={() => setShowForm(true)}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  + Add Playlist
</motion.button>


      {showForm && (
        <div className="playlist-modal">
          <form className="playlist-form" onSubmit={handleAdd}>
            <input
              type="text"
              placeholder="Playlist (e.g. Saiya's fav)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Spotify playlist link baby"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <div className="form-buttons">
              <button type="submit">Add</button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
