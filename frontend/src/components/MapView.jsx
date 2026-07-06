import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'


// Fix Leaflet's default marker icon broken in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function MapView({ stations }) {
  // Default center — India
  const defaultCenter = [20.5937, 78.9629]
  const defaultZoom = 5

  // If stations exist, center on first one
  const center = stations.length > 0
    ? [stations[0].lat, stations[0].lng]
    : defaultCenter

  const zoom = stations.length > 0 ? 8 : defaultZoom

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      key={stations.length}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {stations.map((station, index) => (
        station.lat && station.lng ? (
          <Marker
            key={index}
            position={[station.lat, station.lng]}
          >
            <Popup>
              <div style={{ minWidth: '180px' }}>
                <strong>{station.name}</strong>
                <br />
                {station.city}
                <br />
                <span style={{ color: '#666', fontSize: '12px' }}>
                  {station.charger_info}
                </span>
                <br />
                <span style={{ color: '#666', fontSize: '12px' }}>
                  Operator: {station.operator}
                </span>
                <br />
                <span style={{
                  color: station.status === 'Operational' ? 'green' : 'orange',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {station.status}
                </span>
              </div>
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  )
}

export default MapView