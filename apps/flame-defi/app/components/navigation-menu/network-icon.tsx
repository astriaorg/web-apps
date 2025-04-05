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
  [FlameNetwork.MAINNET]: "text-black",
};

export const NetworkIcon = ({ network, size, ...props }: NetworkIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
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
        d="M18.748 15.9205L17.7028 14.0476C15.7353 14.1291 14.3574 13.0803 13.8514 11.9682C13.4833 11.1597 13.5784 10.3413 14.1061 9.77856C14.4375 9.4252 14.8667 9.26222 15.3143 9.31912C15.7883 9.38024 16.2168 9.67599 16.46 10.1122C16.9537 10.9967 16.5225 11.7174 16.5041 11.747L16.4593 11.8193L17.4142 13.5292L17.5391 13.3908C17.9758 12.9082 18.8688 11.2278 17.7788 9.27416C16.9041 7.7069 15.2674 7.16808 13.8867 7.99281C13.863 8.00686 13.8406 8.02161 13.8175 8.03637C13.611 6.93766 13.1268 5.75115 12.3743 4.5L11.3291 6.37285C12.3811 8.09467 12.1923 9.85372 11.5139 10.8625C11.0208 11.5966 10.288 11.9205 9.55321 11.7287C9.0914 11.6086 8.74029 11.3058 8.5644 10.8759C8.37832 10.4206 8.41227 9.88885 8.6554 9.4533C9.14913 8.56886 9.96748 8.59485 10.0021 8.59625L10.085 8.60047L11.0398 6.89059L10.8612 6.84774C10.2391 6.69811 8.38511 6.73815 7.2951 8.69109C6.42038 10.2584 6.78779 11.9942 8.16846 12.819C8.19223 12.833 8.216 12.8464 8.23909 12.8597C7.42278 13.5938 6.67098 14.6209 6 15.9212H8.09104C9.00651 14.1179 10.5739 13.4076 11.7577 13.5109C12.6188 13.5854 13.2565 14.0799 13.4636 14.8337C13.594 15.3072 13.5159 15.7737 13.2443 16.1453C12.9563 16.5394 12.4938 16.7754 12.0076 16.7754C11.0201 16.7754 10.6324 16.0294 10.6167 15.9978L10.5787 15.9212H8.66966L8.72331 16.1024C8.9094 16.7347 9.86901 18.375 12.0497 18.375C13.7991 18.375 15.0691 17.1779 15.0691 15.5292C15.0691 15.5004 15.0678 15.473 15.0671 15.4449C16.0905 15.8088 17.3259 15.969 18.75 15.9205H18.748Z"
        fill="currentColor"
        className={NETWORK_TO_ICON_COLOR_MAP[network]}
      />
    </svg>
  );
};
