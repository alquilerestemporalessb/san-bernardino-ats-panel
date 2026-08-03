"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

// San Bernardino, Paraguay — centro aproximado del mapa (no la ubicacion exacta de ninguna
// propiedad puntual, solo el encuadre inicial).
const SAN_BERNARDINO_CENTER: [number, number] = [-25.32, -57.28];

const pinIcon = L.divIcon({
  className: "sb-map-pin",
  html: `<svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 23 15 23s15-12.5 15-23C30 6.7 23.3 0 15 0Z" fill="#9d6540"/>
    <circle cx="15" cy="15" r="6" fill="#0e1c29"/>
  </svg>`,
  iconSize: [30, 38],
  iconAnchor: [15, 38],
  popupAnchor: [0, -34],
});

interface MapProperty {
  code: string;
  name: string;
  zone: string;
  latitude: number;
  longitude: number;
}

export function PropertiesMap({ properties }: { properties: MapProperty[] }) {
  return (
    <MapContainer
      center={SAN_BERNARDINO_CENTER}
      zoom={13}
      scrollWheelZoom={false}
      className="h-[420px] w-full rounded-2xl"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {properties.map((property) => (
        <Marker
          key={property.code}
          position={[property.latitude, property.longitude]}
          icon={pinIcon}
        >
          <Popup>
            <div className="flex flex-col gap-1">
              <strong>{property.name}</strong>
              <span className="text-xs opacity-70">{property.zone}</span>
              <Link
                href={`/propiedades/${property.code.toLowerCase()}`}
                className="mt-1 text-xs font-semibold"
              >
                Ver propiedad →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
