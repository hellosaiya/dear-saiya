// src/pages/OurLittleSpace.jsx
import { Link, useNavigate } from "react-router-dom";
import "../styles/OurLittleSpace.css";
import { motion } from "framer-motion";

const features = [
  { path: "/hug", label: "🤗 Virtual Hug" },
  { path: "/missyou", label: "🥺 I Miss You Button" },
  { path: "/moodmeter", label: "🎭 Mood Meter" },
  { path: "/message", label: "💌 Animated Message" },
  { path: "/lovecalendar", label: "🗓️ Love Calendar" },
  { path: "/memoriestimeline", label: "🕰️ Memories Timeline" },
  { path: "/spotifyplaylist", label: "🎵 Spotify Playlist" },
  { path: "/polls", label: "🗳️ Polls" },
  { path: "/giftwishlist", label: "🎁 Gift Wishlist" },
  { path: "/stickynotes", label: "📌 Sticky Notes Wall" },
  { path: "/wishwall", label: "🌠 Wish Wall" },
  { path: "/doodleboard", label: "🎨 Doodle Board" },
  { path: "/map", label: "🗺️ Where Are We?" },
  { path: "/specialday", label: "🎂 Birthday & Anniversary" },
  { path: "/weather", label: "⛅ Weather" },
];

export default function OurLittleSpace() {
  const navigate = useNavigate();

  return (
    <div className="our-little-space">
      <motion.button
        className="back-button"
        onClick={() => navigate("/home")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Back to Home
      </motion.button>

      <h2 className="space-title">🌸 Our Little Space 🌸</h2>

      <div className="feature-grid">
        {features.map((feature) => (
          <Link key={feature.path} to={feature.path} className="feature-button">
            {feature.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
