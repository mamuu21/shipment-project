import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import { useEffect } from "react"
import { MapPin } from "lucide-react"

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface ShipmentMapProps {
  latitude: number | null
  longitude: number | null
  shipmentNo: string
  origin: string
  destination: string
  status: string
  vessel: string
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true })
  }, [map, lat, lng])
  return null
}

export default function ShipmentMap({
  latitude, longitude, shipmentNo, origin, destination, status, vessel,
}: ShipmentMapProps) {
  if (latitude == null || longitude == null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <MapPin className="h-10 w-10 mb-3 text-gray-300" />
        <p className="text-sm font-medium">Location not available</p>
        <p className="text-xs mt-1">GPS coordinates have not been set for this shipment.</p>
      </div>
    )
  }

  const statusColor: Record<string, string> = {
    "In-transit": "text-blue-600",
    Delivered: "text-emerald-600",
    "Not-boarded": "text-gray-500",
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <MapContainer center={[latitude, longitude]} zoom={6} scrollWheelZoom zoomControl className="h-[420px] w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap lat={latitude} lng={longitude} />
        <Marker position={[latitude, longitude]} icon={markerIcon}>
          <Popup>
            <div className="text-xs space-y-1 min-w-[180px]">
              <p className="font-bold text-sm">{shipmentNo}</p>
              <p><span className="text-muted-foreground">Route: </span>{origin} → {destination}</p>
              <p><span className="text-muted-foreground">Vessel: </span>{vessel}</p>
              <p><span className="text-muted-foreground">Status: </span><span className={statusColor[status] ?? "text-gray-600"}>{status}</span></p>
              <p className="text-[10px] text-muted-foreground pt-1">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
