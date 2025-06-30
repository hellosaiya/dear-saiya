// src/components/FloatingHearts.jsx
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const emojis = ['💜', '💟', '💟', '💟', '💜', '💟'];

export default function FloatingHearts() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now() + Math.random();
      const heart = {
        id,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        top: Math.random() * 90,   // Random Y%
        left: Math.random() * 90,  // Random X%
        size: 18 + Math.random() * 24,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 2 + Math.random() * 2, // 2 to 4 seconds
      };
      setHearts((prev) => [...prev, heart]);

      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== heart.id));
      }, heart.duration * 1000);
    }, 300); // frequency

    return () => clearInterval(interval);
  }, []);

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {hearts.map((heart) => (
        <span
          key={heart.id}
          style={{
            position: 'absolute',
            top: `${heart.top}%`,
            left: `${heart.left}%`,
            fontSize: `${heart.size}px`,
            color: heart.color,
            opacity: 0,
            animation: `popFade ${heart.duration}s ease-in-out forwards`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {heart.emoji}
        </span>
      ))}
      <style>
        {`
          @keyframes popFade {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.7);
            }
            25% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1.1);
            }
            75% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.9);
            }
          }
        `}
      </style>
    </div>,
    document.body
  );
}
