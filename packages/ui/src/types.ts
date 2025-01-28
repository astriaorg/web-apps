export interface IconProps {
  className?: string;
  size?: number;
}
export interface TokenItem {
  Icon: React.ComponentType<IconProps>;
  title: string;
  symbol: string;
}
export interface TokenState {
  token?: TokenItem | null;
  value: number | undefined;
}
