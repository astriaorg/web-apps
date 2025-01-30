import { Footer } from "@repo/ui/components";
import Navbar from "./components/Navbar/Navbar";
import { Providers } from "./providers";
import "./globals.css";
import "@interchain-ui/react/styles";
import "@rainbow-me/rainbowkit/styles.css";
import { SideTag } from "./components/SideTag/SideTag";

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
            <SideTag label="Get Help" />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
