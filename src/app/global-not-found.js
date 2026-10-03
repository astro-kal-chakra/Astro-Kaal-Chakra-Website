import Link from "next/link";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" });

export const metadata = {
  title: "404 – Page not found",
  robots: { index: false },
};

/** Fallback 404 for URLs that match no route at all (e.g. unknown locale). */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="bg-cosmic flex min-h-dvh items-center justify-center p-6 font-sans text-white">
        <div className="text-center">
          <p className="font-bold text-white/90">404</p>
          <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
          <p className="mt-2 text-white/90">The page you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-brand-700">
            Go to home
          </Link>
        </div>
      </body>
    </html>
  );
}
