import type { IconProps } from "@repo/flame-types";

import { DEFAULT_ICON_SIZE } from "../constants";

export const ChevronRightSmallIcon: React.FC<IconProps> = ({
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
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10.75 8.25L14.75 12.25L10.75 16.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
    </svg>
  );
};
