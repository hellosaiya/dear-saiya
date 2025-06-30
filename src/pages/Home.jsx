import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingHearts from '../components/FloatingHearts';
import WhoAreYouModal from '../components/WhoAreYouModal';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import '../styles/Home.css';

const photos = [
  '/photos/photo1.jpg',
  '/photos/photo2.jpg'
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
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
    const stored = localStorage.getItem("username");
    if (!stored) {
      setShowPrompt(true);
    } else {
      navigate('/ourlittlespace');
    }
  };

  const handleUserSelect = async (name) => {
    localStorage.setItem("username", name);
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

  return (
    <div className="home-wrapper">
      <FloatingHearts />

      <div className="carousel-box">
        <img
          src={photos[current]}
          alt={`Memory ${current + 1}`}
          onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
          className={`carousel-image ${fade ? 'fade-in' : 'fade-out'}`}
        />
      </div>

      <button
        className="enter-button"
        onClick={handleEnter}
      >
        Enter the Love Space 💫
      </button>

      {showPrompt && <WhoAreYouModal onSelect={handleUserSelect} />}
    </div>
  );
}
