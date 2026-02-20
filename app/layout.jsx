import "./globals.css";
import { CartProvider } from "../components/CartContext";

export const metadata = {
  title: "Symphony Fashion - Fashion Store",
  description: "Modern e-commerce store for men and women clothing."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

