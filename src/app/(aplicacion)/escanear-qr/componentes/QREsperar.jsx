import Lottie from "lottie-react";
import QREspera from "@/assets/animacionEsperar.json";

const style = {
  height: 280,
  with: 280,
};

const QREsperar = () => {
  return <Lottie animationData={QREspera} style={style} loop={true} />;
};

export default QREsperar;
