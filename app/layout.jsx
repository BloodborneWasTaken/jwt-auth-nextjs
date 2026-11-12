import "./globals.css";
import "./animation.css";

export const metadata = {
  title: "JWT Auth | Next.js",
  description: "Access Token و Refresh Token با Next.js و MongoDB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
