import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Antigravity | AI Handwriting",
    description: "Transform digital text into authentic handwritten notes with AI.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&family=Architects+Daughter&family=Bad+Script&family=Caveat:wght@400..700&family=Coming+Soon&family=Covered+By+Your+Grace&family=Dancing+Script:wght@400..700&family=Gloria+Hallelujah&family=Gochi+Hand&family=Handlee&family=Homemade+Apple&family=Indie+Flower&family=Just+Another+Hand&family=Kalam:wght@300;400;700&family=Loved+by+the+King&family=Nothing+You+Could+Do&family=Patrick+Hand&family=Permanent+Marker&family=Reenie+Beanie&family=Rock+Salt&family=Sacramento&family=Satisfy&family=Schoolbell&family=Shadows+Into+Light&family=Walter+Turncoat&family=Yellowtail&family=Zeyada&display=swap" rel="stylesheet" />
            </head>
            <body className={`${inter.className} bg-deepSpace text-paperWhite min-h-screen overflow-x-hidden selection:bg-holoCyan/30`}>
                {children}
            </body>
        </html>
    );
}
