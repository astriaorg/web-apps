import type { IconProps } from "@repo/flame-types";

import { DEFAULT_ICON_SIZE } from "../constants";

export const WalletIcon: React.FC<IconProps> = ({
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
        d="M21.25 17.25H18.25C16.593 17.25 15.25 15.907 15.25 14.25C15.25 12.593 16.593 11.25 18.25 11.25H21.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M12.25 7.25H19.25C20.3546 7.25 21.25 8.14543 21.25 9.25V13.75V19.25C21.25 20.3546 20.3546 21.25 19.25 21.25H5.25C4.14543 21.25 3.25 20.3546 3.25 19.25V5.25V5.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M17.25 3.25H5.25C4.14543 3.25 3.25 4.14543 3.25 5.25C3.25 6.35457 4.14543 7.25 5.25 7.25H12.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
