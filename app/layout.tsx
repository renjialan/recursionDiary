import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loop Journal",
  description: "Loop Journal reimagines journaling as an introspective loop. This minimalist app lets users explore their thoughts through layered AI analysis, where each entry becomes fuel for deeper pattern recognition.",
  icons: {
    icon: "/favicon.ico",
  }
};

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>

//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         <ThemeProvider>
//         attribute="class"
//         defaultTheme="system"
//         enableSystem
//         disableTransitionOnChange
//         storageKey="loop-theme-2"
//         {children}
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="loop-theme-2"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
