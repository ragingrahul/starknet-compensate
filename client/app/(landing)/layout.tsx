import { Instrument_Sans } from "next/font/google";

const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${instrumentSans.className} antialiased`}>
      {children}
    </div>
  );
}
