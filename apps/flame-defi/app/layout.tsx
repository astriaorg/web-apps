import "@interchain-ui/react/styles";
import "@rainbow-me/rainbowkit/styles.css";
import { Footer } from "components/footer";
import { NavigationMenu } from "components/navigation-menu";
import { RouteAnimation } from "components/route-animation/route-animation";
import localFont from "next/font/local";
import { SideTag } from "./components/side-tag/side-tag";
import { Observability } from "./features/observability";
import { Providers } from "./providers";

import "./globals.css";

export const metadata = {
  title: "Flame App",
  description: "DeFi on Flame",
};

const nbAkademieMono = localFont({
  src: [
    {
      path: "../public/fonts/nb_akademie_mono_900-webfont.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/fonts/nb_akademie_mono_800-webfont.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/fonts/nb_akademie_mono_700-webfont.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/nb_akademie_mono_600-webfont.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/nb_akademie_mono_500-webfont.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/nb_akademie_mono_400-webfont.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/nb_akademie_mono_300-webfont.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/nb_akademie_mono_200-webfont.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/nb_akademie_mono_200_italic-webfont.woff2",
      weight: "200",
      style: "italic",
    },
    {
      path: "../public/fonts/nb_akademie_mono_900_italic-webfont.woff2",
      weight: "900",
      style: "italic",
    },
    {
      path: "../public/fonts/nb_akademie_mono_800_italic-webfont.woff2",
      weight: "800",
      style: "italic",
    },
    {
      path: "../public/fonts/nb_akademie_mono_700_italic-webfont.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "../public/fonts/nb_akademie_mono_600_italic-webfont.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "../public/fonts/nb_akademie_mono_500_italic-webfont.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/fonts/nb_akademie_mono_400_italic-webfont.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/nb_akademie_mono_300_italic-webfont.woff2",
      weight: "300",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-nb-akademie-mono",
});

const switzer = localFont({
  src: [
    {
      path: "../public/fonts/Switzer-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/Switzer-ThinItalic.woff2",
      weight: "100",
      style: "italic",
    },
    {
      path: "../public/fonts/Switzer-Extralight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/Switzer-ExtralightItalic.woff2",
      weight: "200",
      style: "italic",
    },
    {
      path: "../public/fonts/Switzer-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Switzer-LightItalic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/fonts/Switzer-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Switzer-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/Switzer-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Switzer-MediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/fonts/Switzer-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Switzer-SemiboldItalic.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "../public/fonts/Switzer-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Switzer-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "../public/fonts/Switzer-Extrabold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/fonts/Switzer-ExtraboldItalic.woff2",
      weight: "800",
      style: "italic",
    },
    {
      path: "../public/fonts/Switzer-Black.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/fonts/Switzer-BlackItalic.woff2",
      weight: "900",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-switzer",
});

const ledDotMatrix = localFont({
  src: "../public/fonts/LED_Dot-Matrix.woff2",
  display: "swap",
  variable: "--font-dot-matrix",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // TODO: Add theme toggle.
    <html
      lang="en"
      data-theme="dark"
      className={`${ledDotMatrix.variable} ${nbAkademieMono.variable} ${switzer.variable}`}
    >
      <body>
        <Providers>
          <Observability />
          <div className="min-h-screen flex flex-col">
            <NavigationMenu />
            <SideTag label="Get Help" />
            <RouteAnimation>
              <main className="flex flex-col grow items-center w-full">
                {children}
              </main>
            </RouteAnimation>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
