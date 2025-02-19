import "@interchain-ui/react/styles";
import "@rainbow-me/rainbowkit/styles.css";
import { Footer } from "@repo/ui/components";
import Navbar from "./components/Navbar/Navbar";
import { SideTag } from "./components/SideTag/SideTag";
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
    // TODO: Add theme toggle.
    <html lang="en" data-theme="dark">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <SideTag label="Get Help" />
            <main className="flex flex-col flex-grow items-center w-full">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
