import Lottie from "lottie-react";
import qrAnimado from "@/assets/animacion.json";
import { motion } from "framer-motion";

const slideInFromRightVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
};
const style = {
  height: 600,
  with: 600,
};

const AnimacionQR = () => {
  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={slideInFromRightVariants}
        transition={{ duration: 1 }}
      >
        <Lottie animationData={qrAnimado} style={style} />
      </motion.div>
    </>
  );
};

export default AnimacionQR;
