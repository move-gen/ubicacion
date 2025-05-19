import Lottie from "lottie-react";
import QREscaneado from "@/assets/ok.json";

const style = {
  height: 280,
  with: 280,
};

const QRescaneado = () => {
  return <Lottie animationData={QREscaneado} style={style} loop={false} />;
};

export default QRescaneado;
