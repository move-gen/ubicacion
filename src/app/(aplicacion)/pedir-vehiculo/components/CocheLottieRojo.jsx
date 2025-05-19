import React from "react";
import Lottie from "lottie-react";
import Coche from "./assets/cocheRojo.json";

const style = {
  height: "100%", // Ajustamos la altura al contenedor padre
  width: "100%", // Ajustamos el ancho al contenedor padre
};

const CocheLottieRojo = () => {
  return <Lottie animationData={Coche} loop={true} style={style} />;
};

export default CocheLottieRojo;
