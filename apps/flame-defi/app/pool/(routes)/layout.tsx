export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="w-full max-w-(--breakpoint-xl) my-10 lg:my-36">
        <div className="w-full mx-auto max-w-screen-lg px-4 md:px-20">
          {children}
        </div>
      </div>
    </>
  );
}
