import Lottie from "lottie-react";
import qrAnimado from "@/assets/AnimacionGenerarQR.json";

const style = {
  height: 220,
  with: 220,
};

const AnimacionGenerarQR = () => {
  return <Lottie animationData={qrAnimado} style={style} />;
};

export default AnimacionGenerarQR;
