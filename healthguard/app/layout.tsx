import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

// Local font for better compatibility with Turbopack
const fontFamily = `
  -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
  sans-serif
`;


export const metadata: Metadata = {
  title: {
    default: "HealthGuard",
    template: "%s · HealthGuard",
  },
  description:
    "Hospital-grade secure patient monitoring, coordinated care workflows, and protected healthcare experiences for patients and care teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="min-h-full bg-background antialiased font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
