import { cn } from "@repo/ui/utils";
import NextImage from "next/image";
import { ComponentPropsWithoutRef } from "react";

interface ImageProps
  extends Omit<ComponentPropsWithoutRef<typeof NextImage>, "src" | "alt"> {
  className?: string;
  src?: string | null;
  alt?: string | null;
}

/**
 * @returns A Next `Image` component with a fallback placeholder.
 */
export const Image = ({
  className,
  src,
  alt,
  width,
  height,
  ...props
}: ImageProps) => {
  return src && alt ? (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("shrink-0", className)}
      {...props}
    />
  ) : (
    <div
      className={cn(
        "shrink-0 bg-icon-light",
        `w-[${width}px] h-[${height}px]`,
        className,
      )}
    />
  );
};
