import type { IconProps } from "@repo/flame-types";

import { DEFAULT_ICON_SIZE } from "../constants";

export const FuelIcon: React.FC<IconProps> = ({
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
        d="M18.25 14.25V15.75C18.25 17.1307 19.3693 18.25 20.75 18.25C22.1307 18.25 23.25 17.1307 23.25 15.75V6.25H21.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M14.25 6.25H7.25V11.25H14.25V6.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M3.25 22.25V4.25C3.25 3.14543 4.14543 2.25 5.25 2.25H16.25C17.3546 2.25 18.25 3.14543 18.25 4.25V22.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M1.25 22.25H20.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
