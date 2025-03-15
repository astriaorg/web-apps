import { IconProps } from "@repo/flame-types";

import { DEFAULT_ICON_SIZE } from "../constants";

export const InfoIcon: React.FC<IconProps> = ({
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
        d="M12.25 22.25C17.7728 22.25 22.25 17.7728 22.25 12.25C22.25 6.72715 17.7728 2.25 12.25 2.25C6.72715 2.25 2.25 6.72715 2.25 12.25C2.25 17.7728 6.72715 22.25 12.25 22.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
      <path
        d="M12.25 17.25V11.75C12.25 11.474 12.026 11.25 11.75 11.25H10.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
      <path
        d="M12.25 8.75C12.9404 8.75 13.5 8.19036 13.5 7.5C13.5 6.80964 12.9404 6.25 12.25 6.25C11.5596 6.25 11 6.80964 11 7.5C11 8.19036 11.5596 8.75 12.25 8.75Z"
        fill="currentColor"
      />
    </svg>
  );
};
