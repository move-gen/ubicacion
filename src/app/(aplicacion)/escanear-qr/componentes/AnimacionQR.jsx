"use client";
import Lottie from "lottie-react";
import qrAnimado from "@/assets/QrAnimado.json";

const style = {
  height: 280,
  with: 280,
};

const AnimacionQR = () => {
  return <Lottie animationData={qrAnimado} style={style} />;
};

export default AnimacionQR;
