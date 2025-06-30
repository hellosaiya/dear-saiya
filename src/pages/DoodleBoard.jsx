import { useEffect, useRef, useState } from 'react';
import { db } from '../config/firebase';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import '../styles/DoodleBoard.css';

export default function DoodleBoard() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [points, setPoints] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [partnerCursor, setPartnerCursor] = useState(null);

  const user = localStorage.getItem('loveUser') || 'Sai';
  const partner = user === 'Sai' ? 'Sia' : 'Sai';

  const canvasId = 'sharedCanvas';
  const doodleRef = doc(db, 'doodleBoard', canvasId);
  const cursorRef = doc(db, 'doodleBoard', `${user}-cursor`);
  const partnerCursorRef = doc(db, 'doodleBoard', `${partner}-cursor`);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const unsub = onSnapshot(doodleRef, (docSnap) => {
      const data = docSnap.data();
      if (data?.points) {
        setPoints(data.points);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSmoothLines(data.points);
      }
    });

    const cursorUnsub = onSnapshot(partnerCursorRef, (docSnap) => {
      const data = docSnap.data();
      if (data) {
        setPartnerCursor(data);
      }
    });

    return () => {
      unsub();
      cursorUnsub();
    };
  }, []);

  const drawSmoothLines = (allPoints) => {
    const ctx = canvasRef.current.getContext('2d');
    if (allPoints.length < 2) return;

    let stroke = [];
    for (let i = 0; i < allPoints.length; i++) {
      const point = allPoints[i];
      const next = allPoints[i + 1];

      stroke.push(point);

      if (!next || next.strokeId !== point.strokeId) {
        // Draw current stroke
        for (let j = 1; j < stroke.length; j++) {
          const p1 = stroke[j - 1];
          const p2 = stroke[j];
          ctx.beginPath();
          ctx.strokeStyle = p2.color;
          ctx.lineWidth = p2.brushSize;
          ctx.lineCap = 'round';
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        stroke = [];
      }
    }
  };

  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const updateCursor = async (e) => {
    const { x, y } = getCoordinates(e);
    await setDoc(cursorRef, { x, y, user }, { merge: true });
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const strokeId = Date.now().toString();
    const initialPoint = { x, y, color, brushSize, strokeId };
    setDrawing(true);
    setCurrentStroke([initialPoint]);
  };

  const draw = (e) => {
    if (!drawing) return;
    const { x, y } = getCoordinates(e);
    const strokeId = currentStroke[0]?.strokeId;
    const newPoint = { x, y, color, brushSize, strokeId };

    const ctx = canvasRef.current.getContext('2d');
    const lastPoint = currentStroke[currentStroke.length - 1];

    if (lastPoint) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(newPoint.x, newPoint.y);
      ctx.stroke();
    }

    setCurrentStroke((prev) => [...prev, newPoint]);
  };

  const stopDrawing = async () => {
    setDrawing(false);
    const updatedPoints = [...points, ...currentStroke];
    setPoints(updatedPoints);
    setCurrentStroke([]);
    await updateDoc(doodleRef, { points: updatedPoints });
  };

  const clearCanvas = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPoints([]);
    await setDoc(doodleRef, { points: [] });
  };

  return (
    <main className="doodle-container">
      <motion.button
        className="back-button"
        onClick={() => navigate("/ourlittlespace")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Our Little Space
      </motion.button>
      <h2 className="doodle-heading">🎨 Doodle Board</h2>

      <div className="canvas-layout">
        <div className="left-tools">
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="brush-size"
          />
        </div>

        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={700}
            height={400}
            className="doodle-canvas"
            onMouseDown={startDrawing}
            onMouseMove={(e) => {
              draw(e);
              updateCursor(e);
            }}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={(e) => {
              draw(e);
              updateCursor(e);
            }}
            onTouchEnd={stopDrawing}
          />
          <button className="clear-btn" onClick={clearCanvas}>🧼 Clear</button>

          {partnerCursor && (
            <div
              className="partner-cursor"
              style={{ top: partnerCursor.y, left: partnerCursor.x }}
            >
              {partner}
            </div>
          )}
        </div>

        <div className="right-tools">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="color-picker"
          />
        </div>
      </div>
    </main>
  );
}
