import type { IconProps } from "@repo/flame-types";

import { DEFAULT_ICON_SIZE } from "../constants";

export const ArrowRightIcon: React.FC<IconProps> = ({
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
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3.25 12.25H21.25H20.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M14.25 19.25L21.25 12.25L14.25 5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
