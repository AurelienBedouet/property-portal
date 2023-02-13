import Navbar from "@/components/shared/Navbar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body className="bg-slate-100 ">
        <div className="mx-auto w-full px-4 max-w-7xl mt-12 mb-36">
          {children}
        </div>
        <Navbar />
      </body>
    </html>
  );
}
