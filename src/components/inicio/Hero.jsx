import { LogIn } from "lucide-react";
import "./hero.css";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
const fadeInFromBottomVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};
const AnimacionInicio = dynamic(
  () => import("@/components/inicio/AnimacionInicio"),
  {
    ssr: false,
  }
);
export const Hero = () => {
  return (
    <>
      <div className="pt-10 pb-16 lg:pt-5 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between">
          <div className="text-center lg:text-left lg:max-w-md lg:mr-12">
            <p className="mx-auto max-w-2xl text-lg tracking-tight text-slate-700 sm:mt-6 lg:mx-0">
              Inicia sesión para continuar
            </p>
            <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl lg:mx-0">
              <span className="inline-block">
                Bienvenido a
                <span className="relative whitespace-nowrap text-colorPrincipal">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 418 42"
                    className="mt-3.5 absolute top-2/3 left-0 h-[0.58em] w-full animate-stroke"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z"
                      fill="none"
                      stroke="rgba(0, 123, 255, 0.7)"
                      strokeWidth="2"
                      strokeDasharray="1000"
                      strokeDashoffset="1000"
                    />
                  </svg>
                  <span className="relative"> Miguel León</span>
                </span>
              </span>
              <span className="inline-block mt-20">Ubicador de vehículos</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg tracking-tight text-slate-700 sm:mt-6 lg:mx-0">
              <span className="inline-block">
                Accede a tu cuenta para entrar en la
              </span>
              <span className=" inline-block border-b border-dotted ml-1 border-slate-300">
                {" plataforma"}
              </span>
            </p>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInFromBottomVariants}
              transition={{ duration: 1 }}
            >
              <div className="mt-12 flex flex-col justify-center gap-y-5  sm:flex-row sm:gap-y-0 sm:gap-x-6 lg:justify-start">
                <Link href="/login">
                  <div className=" md:hidden shadow-lg group inline-flex items-center justify-center rounded-lg py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-colorPrincipal text-white hover:bg-colorClaro hover:text-slate-100 active:bg-colorClaro active:text-slate-300 focus-visible:outline-slate-900 animate-fade-in-left">
                    <LogIn className="w-5 h-5 mr-2" />
                    <span className="">Iniciar sesión</span>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>

          <div className=" lg:mt-0 lg:w-1/2 flex justify-center lg:justify-end">
            <AnimacionInicio />
          </div>
        </div>
      </div>
      <footer className="flex flex-col justify-center m-20">
        <nav className="flex justify-center flex-wrap gap-6 text-gray-500 font-medium">
          <a className="hover:text-gray-900" href="https://miguelleon.es">
            Inicio
          </a>
          <a
            className="hover:text-gray-900"
            href="https://miguelleon.es/otros-contenidos/aviso-legal.html"
          >
            Aviso Legal
          </a>
          <a
            className="hover:text-gray-900"
            href="https://miguelleon.es/otros-contenidos/politica-de-privacidad.html"
          >
            Política de privacidad
          </a>
          <a
            className="hover:text-gray-900"
            href="https://miguelleon.es/contacto.html"
          >
            Contacto
          </a>
        </nav>

        <p className="text-center mt-5 text-gray-700 font-medium">
          &copy; Miguel León
        </p>
      </footer>
    </>
  );
};
