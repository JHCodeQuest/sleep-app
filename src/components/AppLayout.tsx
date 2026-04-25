"use client";

import { Navigation } from "@/components/Navigation";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex-1 pb-20">{children}</div>
      <Navigation />
    </>
  );
}