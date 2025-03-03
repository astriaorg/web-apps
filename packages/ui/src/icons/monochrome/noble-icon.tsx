import type { IconProps } from "@repo/flame-types";

import { DEFAULT_ICON_SIZE } from "../constants";

export const NobleIcon: React.FC<IconProps> = ({
  className = "",
  size = DEFAULT_ICON_SIZE,
}: IconProps) => {
  return (
    <div
      className={`inline-block bg-contain bg-no-repeat bg-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: "url(/assets/icons/logos/noble-logo-color.png)",
      }}
    />
  );
};
