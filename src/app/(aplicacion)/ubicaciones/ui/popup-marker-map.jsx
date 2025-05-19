"use client";

import { useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import { FullscreenControl } from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/styles.css";

const icon = L.icon({ iconUrl: "/marcador.webp", iconSize: [40, 41] });

export function ChangeView({ coords }) {
  const map = useMap();
  map.setView(coords, 12);
  return null;
}

export default function PopupMarkerMap({ ubicaciones }) {
  const [geoData, setGeoData] = useState({
    lat: 28.0994,
    lng: -15.441,
  });

  const center = [geoData.lat, geoData.lng];
  return (
    <div className="w-full">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: "52rem", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FullscreenControl />
        {ubicaciones.slice(1).map((ubicacion, index) => (
          <Marker
            key={index}
            position={[ubicacion.latitud, ubicacion.longitud]}
            icon={icon}
          >
            <Popup>{ubicacion.nombre}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
