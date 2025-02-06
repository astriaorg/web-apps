import type { IconProps } from "@repo/flame-types";

export const FlameIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
}: IconProps) => {
  return (
    <div
      className={`inline-block bg-contain bg-no-repeat bg-center ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: "url(/assets/icons/logos/flame-logo-color.png)",
      }}
    />
  );
};
