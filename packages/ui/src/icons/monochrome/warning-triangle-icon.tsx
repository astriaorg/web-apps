import type { IconProps } from "@repo/flame-types";

import { DEFAULT_ICON_SIZE } from "../constants";

export const WarningTriangleIcon: React.FC<IconProps> = ({
  className = "",
  size = DEFAULT_ICON_SIZE,
}: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12.25 18.25C12.9404 18.25 13.5 17.6904 13.5 17C13.5 16.3096 12.9404 15.75 12.25 15.75C11.5596 15.75 11 16.3096 11 17C11 17.6904 11.5596 18.25 12.25 18.25Z"
        fill="currentColor"
      />
      <path
        d="M12.25 13.25V9.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
      <path
        d="M10.421 4.31024L2.52203 18.0932C1.71603 19.4992 2.73103 21.2502 4.35103 21.2502H20.149C21.769 21.2502 22.784 19.4992 21.978 18.0932L14.079 4.31024C13.269 2.89724 11.231 2.89724 10.421 4.31024Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
    </svg>
  );
};
