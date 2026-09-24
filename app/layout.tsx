import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
    metadataBase: new URL("https://citifix.betteriligancity.org"),
    title: {
        default: "CitiFIX BetterIligan - Report Infrastructure Issues",
        template: "%s | CitiFIX BetterIligan",
    },
    description: "Civic reporting platform for Iligan City infrastructure issues",
    openGraph: {
        siteName: "CitiFIX BetterIligan",
        locale: "en_PH",
        type: "website",
        url: "https://citifix.betteriligancity.org",
    },
    twitter: {
        card: "summary_large_image",
    },
    facebook: {
        appId: "1036061575471786",
    },
    other: {
        "fb:app_id": "1036061575471786",
    },

};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    {children}
                </Providers>
                <Toaster position="bottom-right" richColors />
            </body>
        </html>
    );
}
