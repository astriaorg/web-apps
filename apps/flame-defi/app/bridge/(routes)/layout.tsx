"use client";

export default function BridgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="w-full min-h-[calc(100vh-85px-96px)] flex flex-col items-center mt-[100px]">
      {children}
    </section>
  );
}
