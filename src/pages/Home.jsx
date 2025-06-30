import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingHearts from '../components/FloatingHearts';
import WhoAreYouModal from '../components/WhoAreYouModal';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import '../styles/Home.css';

const photos = [
  '/photos/photo1.png',
  '/photos/photo2.jpg',
  '/photos/photo3.png',
  '/photos/photo4.png', 
  '/photos/photo5.png',
  '/photos/photo6.png',
  '/photos/photo7.png',
  '/photos/photo8.png'
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("username") || null);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % photos.length);
        setFade(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    if (!username) {
      setShowPrompt(true);
    } else {
      navigate('/ourlittlespace');
    }
  };

  const handleUserSelect = async (name) => {
    localStorage.setItem("username", name);
    setUsername(name);
    setShowPrompt(false);

    try {
      await setDoc(doc(db, "users", name), {
        name: name,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error saving user to Firebase:", error);
    }

    navigate('/ourlittlespace');
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername(null);
    navigate("/"); 
  };

  return (
    <div className="home-wrapper">
      <FloatingHearts />

      <div className="carousel-box">
        {photos.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Memory ${i + 1}`}
          className={`carousel-image ${i === current ? 'show' : ''}`}
          onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
        />
        ))}
      </div>

      <button
        className="enter-button"
        onClick={handleEnter}
      >
        Enter the Love Space 💫
      </button>

      {username && (
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      )}

      {showPrompt && <WhoAreYouModal onSelect={handleUserSelect} />}
    </div>
  );
}
