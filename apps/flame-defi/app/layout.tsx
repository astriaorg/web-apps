import { Footer } from "@repo/ui/components";
import Navbar from "./components/Navbar/Navbar";
import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "Flame App",
  description: "DeFi on Flame",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
