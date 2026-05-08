import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix per le icone che spariscono in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function App() {
  const [markers, setMarkers] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    // Carichiamo il file generato dallo script Python
    fetch('./outbreak.json')
      .then(response => response.json())
      .then(data => {
        if (!Array.isArray(data)) {
          setMarkers([]);
          setTotalReports(0);
          setLoadError('Formato dati non valido');
          setIsLoading(false);
          return;
        }

        // Teniamo solo le news che hanno le coordinate
        const geocoded = data.filter(item => item.coordinates);
        setTotalReports(data.length);
        setLoadError('');
        setMarkers(geocoded);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Errore caricamento dati:", error);
        setMarkers([]);
        setTotalReports(0);
        setLoadError('Impossibile caricare i dati');
        setIsLoading(false);
      });
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div style={{ 
        position: 'absolute', top: 10, left: 50, zIndex: 1000, 
        background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' 
      }}>
        <h2 style={{ margin: 0, color: '#b91c1c' }}>⚠️ HantaWatch Live</h2>
        {isLoading && <div style={{ marginTop: '4px', color: '#92400e' }}>Caricamento dati...</div>}
        <small style={{ display: 'block' }}>Report totali: {totalReports}</small>
        <small>Punti geolocalizzati: {markers.length}</small>
        {loadError && <div style={{ marginTop: '4px', color: '#991b1b' }}>{loadError}</div>}
      </div>

      <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
        {markers.map((m, i) => (
          <Marker key={i} position={m.coordinates}>
            <Popup>
              <strong>{m.title}</strong><br/>
              <a href={m.link} target="_blank" rel="noreferrer">Leggi report</a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;