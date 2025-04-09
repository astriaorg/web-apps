import type { IconProps } from "@repo/flame-types";

import { DEFAULT_ICON_SIZE } from "../constants";

export const ArrowUpDownIcon: React.FC<IconProps> = ({
  className = "",
  size = DEFAULT_ICON_SIZE,
}: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
