import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./auth/AuthProvider";
const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Localización coches | Miguel León",
  description: "Localización coches",
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang="es">
        <body className={`bg-white${outfit.className}`}>{children}</body>
      </html>
    </AuthProvider>
  );
}
