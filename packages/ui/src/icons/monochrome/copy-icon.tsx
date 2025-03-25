import type { IconProps } from "@repo/flame-types";

import { DEFAULT_ICON_SIZE } from "../constants";

export const CopyIcon: React.FC<IconProps> = ({
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
        d="M10.75 8.25H19.75C20.5784 8.25 21.25 8.92157 21.25 9.75V20.75C21.25 21.5784 20.5784 22.25 19.75 22.25H10.75C9.92157 22.25 9.25 21.5784 9.25 20.75V9.75C9.25 8.92157 9.92157 8.25 10.75 8.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
      <path
        d="M15.25 4.25V3.75C15.25 2.92157 14.5784 2.25 13.75 2.25H4.75C3.92157 2.25 3.25 2.92157 3.25 3.75V14.75C3.25 15.5784 3.92157 16.25 4.75 16.25H5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
    </svg>
  );
};
