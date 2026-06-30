import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Optimized metadata for broader keyword reach and explicit brand naming
export const metadata: Metadata = {
  title: "St. Ann's College Hall Booking Portal | Official Venue Reservation",
  manifest: "/manifest.json",
  description: "Welcome to the official St. Ann's College Hall Booking Portal. View real-time availability and book campus spaces including Gnanamma Hall, Deickmann Hall, and St. Joseph's Auditorium.",
  alternates: {
    canonical: 'https://st-anns-hall-booking.vercel.app/',
  },
  // OpenGraph tags help control how social networks and search engine snippets pull your info
  openGraph: {
    title: "St. Ann's College Hall Booking Portal",
    description: "Official venue coordination and booking platform for St. Ann's College.",
    url: "https://st-anns-hall-booking.vercel.app/",
    siteName: "St. Ann's Hall Booking", // Explicitly tells crawlers what the name above the URL should be
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        
        {/* Safely registers the sw.js cache worker on window mount */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('ServiceWorker registration successful'); })
                    .catch(function(err) { console.log('ServiceWorker registration failed: ', err); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}