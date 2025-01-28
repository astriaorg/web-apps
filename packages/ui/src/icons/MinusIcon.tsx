import type { IconProps } from "../types";

export const MinusIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
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
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
};
