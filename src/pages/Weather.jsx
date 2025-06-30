import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Weather.css';
import { useNavigate } from "react-router-dom";

const WEATHER_API_KEY = 'e4c49bac288a4e14968133807252806';

export default function Weather() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sai: '', sia: '' });
  const [weatherData, setWeatherData] = useState({ sai: null, sia: null });
  const [activeAnimation, setActiveAnimation] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'weather', 'locations'), (ds) => {
      const d = ds.data() || {};
      setForm({ sai: d.sai?.location || '', sia: d.sia?.location || '' });
      if (d.sai?.location) fetchWeather(d.sai.location, 'sai');
      if (d.sia?.location) fetchWeather(d.sia.location, 'sia');
    });
    return () => unsub();
  }, []);

  const fetchWeather = async (loc, who) => {
    try {
      const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(loc)}`);
      const json = await res.json();
      if (json.location) setWeatherData(prev => ({ ...prev, [who]: json }));
    } catch (e) {
      console.error(e);
    }
  };

  const getMessage = (text) => {
    const t = text.toLowerCase();
    if (t.includes('sunny')) return 'Bright and warm, just like our love ☀️';
    if (t.includes('cloud')) return 'Cloudy skies, but hearts are clear 🌥️';
    if (t.includes('rain')) return 'Rainy day cuddles, even from afar 🌧️';
    if (t.includes('snow')) return 'Cold outside, warm inside 💞';
    if (t.includes('fog') || t.includes('mist')) return 'Lost in the fog but never in love 🌫️';
    return 'No matter the weather, thinking of you 💌';
  };

  const handleCardClick = (condition) => {
    setActiveAnimation(condition.toLowerCase());
    setTimeout(() => setActiveAnimation(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, 'weather', 'locations'), {
      sai: { location: form.sai },
      sia: { location: form.sia },
    }, { merge: true });
    setShowForm(false);
  };

  return (
    <main className="weather-container">
      <motion.button
        className="back-button"
        onClick={() => navigate("/ourlittlespace")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }} >
        ← Our Little Space
        </motion.button>

      <h1 className="weather-heading">⛅ Weather</h1>

      <div className="weather-cards">
        {['sai', 'sia'].map((who, i) => (
          <motion.div
            key={who}
            className="weather-card"
            onClick={() => handleCardClick(weatherData[who]?.current.condition.text)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.2, duration: 0.4 }}
          >
            <h3>{who === 'sai' ? 'Sai 💙' : 'Sia 💖'}</h3>
            {weatherData[who] ? (
              <>
                <p>📍 {weatherData[who].location.name}</p>
                <p>🌡️ {weatherData[who].current.temp_c}°C</p>
                <p>🔥 Feels: {weatherData[who].current.feelslike_c}°C</p>
                <p>⛅ {weatherData[who].current.condition.text}</p>
                <p>💬 {getMessage(weatherData[who].current.condition.text)}</p>
              </>
            ) : (
              <p className="no-data">No data</p>
            )}
          </motion.div>
        ))}
      </div>

      {activeAnimation && (
        <div className={`weather-animation ${activeAnimation}`}>
          {/* Animation layer */}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="weather-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              className="weather-popup-content"
              onSubmit={handleSubmit}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <input
                placeholder="Sai’s Location"
                value={form.sai}
                onChange={e => setForm({ ...form, sai: e.target.value })}
                required
              />
              <input
                placeholder="Sia’s Location"
                value={form.sia}
                onChange={e => setForm({ ...form, sia: e.target.value })}
                required
              />
              <div className="popup-buttons">
                <button type="submit" className="submit-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="floating-add-button"
        onClick={() => setShowForm(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        + Update
      </motion.button>
    </main>
  );
}
