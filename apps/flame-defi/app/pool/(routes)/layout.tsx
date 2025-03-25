import { PoolContextProvider } from "../context/pool-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PoolContextProvider>
      <section className="w-full min-h-[calc(100vh-85px-96px)] flex flex-col mt-[100px]">
        <div className="w-full mx-auto max-w-screen-lg px-4 md:px-20">
          {children}
        </div>
      </section>
    </PoolContextProvider>
  );
}
