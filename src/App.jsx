// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Layout from "./components/Layout"; // <-- New layout component
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

export default function App() {
  return (
    <Router>
      <Routes>
        {/* <Route element={<Layout />}> */}
          <Route path="/" element={<Home />} />
          <Route path="/ourlittlespace" element={<OurLittleSpace />} />
          <Route path="/hug" element={<VirtualHug />} />
          <Route path="/message" element={<AnimatedMessage />} />
          <Route path="/moodmeter" element={<MoodMeter />} />
          <Route path="/lovecalendar" element={<LoveCalendar />} />
          <Route path="/memoriestimeline" element={<MemoriesTimeline />} />
          <Route path="/spotifyplaylist" element={<SpotifyPlaylist />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/giftwishlist" element={<GiftWishlist />} />
          <Route path="/stickynotes" element={<StickyNotesWall />} />
          <Route path="/missyou" element={<MissYou />} />
          <Route path="/wishwall" element={<WishWall />} />
          <Route path="/doodleboard" element={<DoodleBoard />} />
          <Route path="/map" element={<WhereAreWe />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/specialday" element={<SpecialDay />} />
        {/* </Route> */}
      </Routes>
    </Router>
  );
}
