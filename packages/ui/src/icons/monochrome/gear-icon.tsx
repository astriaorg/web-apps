import type { IconProps } from "@repo/flame-types";

import { DEFAULT_ICON_SIZE } from "../constants";

export const GearIcon: React.FC<IconProps> = ({
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
        d="M7.25 21.25L2.25 12.25L7.25 3.25H17.25L22.25 12.25L17.25 21.25H7.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M12.25 16.25C14.4591 16.25 16.25 14.4591 16.25 12.25C16.25 10.0409 14.4591 8.25 12.25 8.25C10.0409 8.25 8.25 10.0409 8.25 12.25C8.25 14.4591 10.0409 16.25 12.25 16.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
