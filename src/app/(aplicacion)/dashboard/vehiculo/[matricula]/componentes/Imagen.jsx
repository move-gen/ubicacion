"use client";
import { useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { ImageOff } from "lucide-react";
export default function Imagen({ matricula }) {
  const [imageUrl, setImageUrl] = useState("");
  const [hasImage, setHasImage] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      const response = await fetch(`/api/imagen-coche?matricula=${matricula}`);
      if (response.ok) {
        const data = await response.json();
        if (data.image) {
          setImageUrl(data.image);
          setHasImage(true);
        } else {
          setHasImage(false);
        }
      } else {
        setHasImage(false);
      }
    };

    fetchImage();
  }, [matricula]);

  return (
    <div className="flex justify-center items-center h-full">
      {hasImage ? (
        <Zoom>
          <img
            src={imageUrl}
            alt={`Imagen del vehículo con matrícula ${matricula}`}
            width={200}
            height={200}
          />
        </Zoom>
      ) : (
        <div className="flex flex-col items-center p-4">
          <ImageOff className="w-12 h-12 mb-2 " color="gray" />
          <div className="text-center mt-5">No hay imagen del vehículo </div>
        </div>
      )}
    </div>
  );
}
