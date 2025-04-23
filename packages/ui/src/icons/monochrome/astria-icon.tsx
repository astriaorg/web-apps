import type { IconProps } from "@repo/flame-types";

import { DEFAULT_ICON_SIZE } from "../constants";

export const AstriaIcon: React.FC<IconProps> = ({
  className = "",
  size = DEFAULT_ICON_SIZE,
}: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14.7865 12.8929H18.9011V17.4339H14.7865V12.8929Z"
        fill="currentColor"
      />
      <path
        d="M13.7578 6.08127L4.5 16.2987V17.4339H8.61459V12.8929H14.7865V6.08127H13.7578Z"
        fill="currentColor"
      />
    </svg>
  );
};
