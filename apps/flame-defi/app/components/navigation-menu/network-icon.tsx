import { FlameNetwork, type IconProps } from "@repo/flame-types";

interface NetworkIconProps extends IconProps {
  network: FlameNetwork;
}

const NETWORK_TO_BACKGROUND_COLOR_MAP: { [key in FlameNetwork]: string } = {
  [FlameNetwork.LOCAL]: "text-surface-1",
  [FlameNetwork.DUSK]: "text-purple",
  [FlameNetwork.DAWN]: "text-chartreuse",
  [FlameNetwork.MAINNET]: "text-orange",
};

const NETWORK_TO_ICON_COLOR_MAP: { [key in FlameNetwork]: string } = {
  [FlameNetwork.LOCAL]: "text-black",
  [FlameNetwork.DUSK]: "text-white",
  [FlameNetwork.DAWN]: "text-black",
  [FlameNetwork.MAINNET]: "text-white",
};

export const NetworkIcon = ({ network, size, ...props }: NetworkIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect
        width="24"
        height="24"
        rx="12"
        fill="currentColor"
        className={NETWORK_TO_BACKGROUND_COLOR_MAP[network]}
      />
      <path
        d="M14.7865 12.8929H18.9011V17.4339H14.7865V12.8929Z"
        fill="currentColor"
        className={NETWORK_TO_ICON_COLOR_MAP[network]}
      />
      <path
        d="M13.7578 6.08127L4.5 16.2987V17.4339H8.61459V12.8929H14.7865V6.08127H13.7578Z"
        fill="currentColor"
        className={NETWORK_TO_ICON_COLOR_MAP[network]}
      />
    </svg>
  );
};
