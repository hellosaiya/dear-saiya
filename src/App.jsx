// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";

import Home from "./pages/Home";
import OurLittleSpace from "./pages/OurLittleSpace";
import VirtualHug from "./pages/VirtualHug";
import AnimatedMessage from "./pages/AnimatedMessage";
import MoodMeter from "./pages/MoodMeter";
import LoveCalendar from "./pages/LoveCalendar";
import MemoriesTimeline from "./pages/MemoriesTimeline";
import SpotifyPlaylist from "./pages/SpotifyPlaylist";
import Polls from "./pages/Polls";
import GiftWishlist from "./pages/GiftWishlist";
import StickyNotesWall from "./pages/StickyNotesWall";
import MissYou from "./pages/MissYou";
import WishWall from "./pages/WishWall";
import DoodleBoard from "./pages/DoodleBoard";
import WhereAreWe from "./pages/WhereAreWe";
import Weather from "./pages/Weather";
import SpecialDay from "./pages/SpecialDay";
import Login from './components/Login';
import PrivateRoute from "./components/PrivateRoute";

function AuthWatcher() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        localStorage.removeItem("username");
        navigate("/", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <Router>
      <AuthWatcher />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/ourlittlespace" element={<PrivateRoute><OurLittleSpace /></PrivateRoute>} />
        <Route path="/hug" element={<PrivateRoute><VirtualHug /></PrivateRoute>} />
        <Route path="/message" element={<PrivateRoute><AnimatedMessage /></PrivateRoute>} />
        <Route path="/moodmeter" element={<PrivateRoute><MoodMeter /></PrivateRoute>} />
        <Route path="/lovecalendar" element={<PrivateRoute><LoveCalendar /></PrivateRoute>} />
        <Route path="/memoriestimeline" element={<PrivateRoute><MemoriesTimeline /></PrivateRoute>} />
        <Route path="/spotifyplaylist" element={<PrivateRoute><SpotifyPlaylist /></PrivateRoute>} />
        <Route path="/polls" element={<PrivateRoute><Polls /></PrivateRoute>} />
        <Route path="/giftwishlist" element={<PrivateRoute><GiftWishlist /></PrivateRoute>} />
        <Route path="/stickynotes" element={<PrivateRoute><StickyNotesWall /></PrivateRoute>} />
        <Route path="/missyou" element={<PrivateRoute><MissYou /></PrivateRoute>} />
        <Route path="/wishwall" element={<PrivateRoute><WishWall /></PrivateRoute>} />
        <Route path="/doodleboard" element={<PrivateRoute><DoodleBoard /></PrivateRoute>} />
        <Route path="/map" element={<PrivateRoute><WhereAreWe /></PrivateRoute>} />
        <Route path="/weather" element={<PrivateRoute><Weather /></PrivateRoute>} />
        <Route path="/specialday" element={<PrivateRoute><SpecialDay /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}
