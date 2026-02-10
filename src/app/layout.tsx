import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: "Gravity: AntiGravity Text to Handwriting",
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
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossOrigin="anonymous" />
                <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8" crossOrigin="anonymous"></script>
            </head>
            <body className={`font-sans bg-deepSpace text-paperWhite min-h-screen overflow-x-hidden selection:bg-holoCyan/30`}>
                {children}
            </body>
        </html>
    );
}
