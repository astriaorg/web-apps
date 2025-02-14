import { usePageContext } from "earn/modules/vault-details/hooks/usePageContext";

export const HeaderSection = () => {
  const { id } = usePageContext();

  return (
    <section className="flex flex-col px-4 md:px-20">
      <h1>{id}</h1>
    </section>
  );
};
