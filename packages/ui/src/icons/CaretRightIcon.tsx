import type { IconProps } from "@repo/flame-types";

export const CaretRightIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
}: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z"
      />
    </svg>
  );
};
