import Lottie from "lottie-react";
import QREscaneado from "@/assets/vehiculoPaso2.json";

const style = {
  height: 280,
  with: 280,
};

const AnimacionQREscaneado = () => {
  return <Lottie animationData={QREscaneado} style={style} loop={false} />;
};

export default AnimacionQREscaneado;
