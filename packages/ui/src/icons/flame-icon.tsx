import type { IconProps } from "@repo/flame-types";

import { DEFAULT_ICON_SIZE } from "./constants";

export const FlameIcon: React.FC<IconProps> = ({
  className = "",
  size = DEFAULT_ICON_SIZE,
}: IconProps) => {
  return (
    <div
      className={`inline-block bg-contain bg-no-repeat bg-center ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: "url(/assets/icons/logos/flame-logo-color.png)",
      }}
    />
  );
};
