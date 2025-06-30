import { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { db } from '../config/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import 'leaflet/dist/leaflet.css';
import '../styles/WhereAreWe.css';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function WhereAreWe() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [coords, setCoords] = useState(null);
  const [otherUser, setOtherUser] = useState('');
  const [otherCoords, setOtherCoords] = useState(null);
  const [otherAddress, setOtherAddress] = useState('');

  useEffect(() => {
    if (!username) return;
    const me = username;
    const you = me === 'Sai' ? 'Sia' : 'Sai';
    setOtherUser(you);

    const unsub = onSnapshot(doc(db, 'locations', 'mapData'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data[me]) {
          setCoords(data[me].coords);
          setAddress(data[me].address);
        }
        if (data[you]) {
          setOtherCoords(data[you].coords);
          setOtherAddress(data[you].address);
        }
      }
    });

    return () => unsub();
  }, [username]);

  const fetchCoordinates = async (inputAddress) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputAddress)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const foundCoords = await fetchCoordinates(address);
    if (!foundCoords) return alert('Location not found.');

    await setDoc(doc(db, 'locations', 'mapData'), {
      [username]: {
        address,
        coords: foundCoords
      }
    }, { merge: true });

    setIsModalOpen(false);
  };

  const deg2rad = (deg) => (deg * Math.PI) / 180;
  const calculateDistance = () => {
    if (!coords || !otherCoords) return '';
    const R = 6371;
    const dLat = deg2rad(otherCoords.lat - coords.lat);
    const dLng = deg2rad(otherCoords.lng - coords.lng);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(coords.lat)) *
      Math.cos(deg2rad(otherCoords.lat)) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const CustomZoomControls = () => {
    const map = useMap();
    return (
      <div className="leaflet-control-zoom">
        <button className="leaflet-control-zoom-in" onClick={() => map.zoomIn()}><FaPlus /></button>
        <button className="leaflet-control-zoom-out" onClick={() => map.zoomOut()}><FaMinus /></button>
      </div>
    );
  };

  return (
    <main className="where-container">
      <motion.button
        className="back-button"
        onClick={() => navigate("/ourlittlespace")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }} >
        ← Our Little Space
      </motion.button>
      <h2 className="where-heading">📍 Where Are We?</h2>

      <button className="floating-add-btn" onClick={() => setIsModalOpen(true)}>📍 Set Location</button>

      {coords && otherCoords && (
        <MapContainer center={coords} zoom={5} scrollWheelZoom={false} className="map fade-in">
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Marker position={coords}>
            <Popup>{username} 📍<br />{address}</Popup>
          </Marker>
          <Marker position={otherCoords}>
            <Popup>{otherUser} 💖<br />{otherAddress}</Popup>
          </Marker>

          <Marker position={coords} icon={L.divIcon({
            html: `<div class="label-label">${username}</div>`,
            className: 'label-icon',
            iconSize: [60, 20],
          })} />
          <Marker position={otherCoords} icon={L.divIcon({
            html: `<div class="label-label">${otherUser}</div>`,
            className: 'label-icon',
            iconSize: [60, 20],
          })} />

          <Polyline positions={[coords, otherCoords]} color="#ff4d88" />
          <Marker position={[
            (coords.lat + otherCoords.lat) / 2,
            (coords.lng + otherCoords.lng) / 2,
          ]} icon={L.divIcon({
            html: `<div class="distance-popup">${calculateDistance()} km</div>`,
            className: 'distance-icon',
            iconSize: [100, 40],
          })} />

          <CustomZoomControls />
        </MapContainer>
      )}

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="e.g., Jayanagar, Bangalore"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <div className="modal-buttons">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
