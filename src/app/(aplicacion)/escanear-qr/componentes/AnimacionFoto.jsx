import Lottie from "lottie-react";
import QREscaneado from "@/assets/camara.json";

const style = {
  height: 280,
  with: 280,
};

const AnimacionFoto = () => {
  return <Lottie animationData={QREscaneado} style={style} loop={false} />;
};

export default AnimacionFoto;
