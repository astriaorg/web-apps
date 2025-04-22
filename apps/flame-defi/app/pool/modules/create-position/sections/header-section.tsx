"use client";

import { Header, HeaderTitle } from "components/header";
import { useRouter } from "next/navigation";
import { ROUTES } from "pool/constants/routes";

export const HeaderSection = () => {
  const router = useRouter();

  return (
    <Header onClickBack={() => router.push(ROUTES.POOL)}>
      <HeaderTitle>New Position</HeaderTitle>
    </Header>
  );
};
