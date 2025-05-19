import Lottie from "lottie-react";
import Error from "@/assets/error.json";

const style = {
  height: 280,
  with: 280,
};

const ErrorEscaneo = () => {
  return (
    <Lottie
      animationData={Error}
      style={style}
      loop={false}
      className="-mt-12"
    />
  );
};

export default ErrorEscaneo;
