"use client";

import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  Popup,
} from "react-leaflet";
import { FullscreenControl } from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/styles.css";

// Function to create a numbered icon
const createNumberedIcon = (number) => {
  return L.divIcon({
    html: `<div style="position: relative;">
             <img src="/marcador.webp" style="width: 40px; height: 41px;" />
             <span style="position: absolute; top: 0; right: 0; background: red; color: white; border-radius: 50%; padding: 2px 5px; font-size: 10px;">${number}</span>
           </div>`,
    className: "numbered-icon",
    iconSize: [40, 41],
    iconAnchor: [20, 41],
  });
};

export function ChangeView({ coords }) {
  const map = useMap();
  map.setView(coords, 12);
  return null;
}

export default function PopupMarkerMap({ ubicaciones }) {
  const [geoData, setGeoData] = useState({
    lat: ubicaciones[ubicaciones.length - 1].ubicacion.latitud,
    lng: ubicaciones[ubicaciones.length - 1].ubicacion.longitud,
  });

  useEffect(() => {
    if (ubicaciones.length > 0 && ubicaciones[0].ubicacion) {
      setGeoData({
        lat: ubicaciones[0].ubicacion.latitud,
        lng: ubicaciones[0].ubicacion.longitud,
      });
    }
  }, [ubicaciones]);

  const center = [geoData.lat, geoData.lng];

  // Create an array of positions for the Polyline excluding the first occurrence
  const positions = ubicaciones
    .slice(1) // Skip the first occurrence
    .map((ubicacion) => ubicacion.ubicacion)
    .filter((ubicacion) => ubicacion && ubicacion.latitud && ubicacion.longitud)
    .map((ubicacion) => [ubicacion.latitud, ubicacion.longitud]);

  return (
    <div className="w-full">
      <MapContainer
        className="rounded-lg"
        center={center}
        zoom={10}
        style={{ height: "60rem", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FullscreenControl />

        {ubicaciones.slice(1).map((ubicacion, index) => {
          // Skip the first occurrence que es sin ubicación
          if (
            ubicacion.ubicacion &&
            ubicacion.ubicacion.latitud &&
            ubicacion.ubicacion.longitud
          ) {
            return (
              <Marker
                key={index + 1} // Adjust the index to match the new numbering
                position={[
                  ubicacion.ubicacion.latitud,
                  ubicacion.ubicacion.longitud,
                ]}
                icon={createNumberedIcon(index + 1)} // Adjust the numbering
              >
                <Popup>{ubicacion.ubicacion.nombre}</Popup>
              </Marker>
            );
          }
          return null;
        })}
        <Polyline positions={positions} color="green" />
      </MapContainer>
    </div>
  );
}
