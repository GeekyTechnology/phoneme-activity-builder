import "./globals.css";
import SiteShell from "@/components/SiteShell";

export const metadata = {
  title: "Phoneme Activity Builder",
  description: "Assessment 1 frontend for phoneme classroom activities"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteShell>{children}</SiteShell></body></html>;
}
