import "./globals.css";
import { CartProvider } from "../components/CartContext";

import { AuthProvider } from "./Providers";

export const metadata = {
  title: "Symphony Fashion - Fashion Store",
  description: "Modern e-commerce store for men and women clothing."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

