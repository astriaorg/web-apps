import type { IconProps } from "@repo/flame-types";

import { DEFAULT_ICON_SIZE } from "../constants";

export const ShareRightIcon: React.FC<IconProps> = ({
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
        d="M9.25 16.25C9.25 10.727 13.727 6.25 19.25 6.25H22.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M18.25 10.25L22.25 6.25L18.25 2.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M9.25 6.25H5.25C4.145 6.25 3.25 7.145 3.25 8.25V19.25C3.25 20.355 4.145 21.25 5.25 21.25H16.25C17.355 21.25 18.25 20.355 18.25 19.25V14.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
