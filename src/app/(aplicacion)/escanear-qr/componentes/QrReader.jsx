"use client";
import { useEffect, useRef, useState } from "react";
import { SwitchCamera } from "lucide-react";
// Qr Scanner
import QrScanner from "qr-scanner";

const QrReader = ({ updateState }) => {
  // QR States
  const scanner = useRef();
  const videoEl = useRef(null);
  const qrBoxEl = useRef(null);
  const [qrOn, setQrOn] = useState(true);
  const [currentCamera, setCurrentCamera] = useState("environment");

  // Result

  // Success
  const onScanSuccess = (result) => {
    // 🖨 Print the "result" to browser console.
    // ✅ Handle success.
    // 😎 You can do whatever you want with the scanned result.
    updateState("matricula", result?.data);
  };

  // Fail
  const onScanFail = (err) => {
    // 🖨 Print the "err" to browser console.
  };

  useEffect(() => {
    if (videoEl?.current && !scanner.current) {
      // 👉 Instantiate the QR Scanner
      scanner.current = new QrScanner(videoEl?.current, onScanSuccess, {
        onDecodeError: onScanFail,
        // 📷 This is the camera facing mode. In mobile devices, "environment" means back camera and "user" means front camera.
        preferredCamera: currentCamera,
        // 🖼 This will help us position our "QrFrame.svg" so that user can only scan when qr code is put in between our QrFrame.svg.
        highlightScanRegion: true,
        // 🔥 This will produce a yellow (default color) outline around the qr code that we scan, showing a proof that our qr-scanner is scanning that qr code.
        highlightCodeOutline: true,
        // 📦 A custom div which will pair with "highlightScanRegion" option above 👆. This gives us full control over our scan region.
      });

      // 🚀 Start QR Scanner
      scanner?.current
        ?.start()
        .then(() => {
          setQrOn(true);
        })
        .catch((err) => {
          if (err) setQrOn(false);
        });
    }

    // 🧹 Clean up on unmount.
    // 🚨 This removes the QR Scanner from rendering and using camera when it is closed or removed from the UI.
    return () => {
      if (!videoEl?.current) {
        scanner?.current?.stop();
      }
    };
  }, []);

  // ❌ If "camera" is not allowed in browser permissions, show an alert.
  useEffect(() => {
    if (!qrOn)
      alert(
        "La cámara está bloqueada o no tiene los permisos activados. Compruebe los permisos"
      );
  }, [qrOn]);

  const switchCamera = () => {
    const nextCamera = currentCamera === "environment" ? "user" : "environment";
    scanner?.current?.setCamera(nextCamera);
    setCurrentCamera(nextCamera);
  };
  return (
    <div className="qr-reader relative">
      <div className="relative">
        <video ref={videoEl} className="w-full"></video>
        <div
          ref={qrBoxEl}
          className="qr-box absolute top-0 left-0 w-full h-full"
        ></div>
        <button
          className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-lg flex items-center justify-center"
          onClick={switchCamera}
        >
          <SwitchCamera size={24} />
        </button>
      </div>
    </div>
  );
};

export default QrReader;
