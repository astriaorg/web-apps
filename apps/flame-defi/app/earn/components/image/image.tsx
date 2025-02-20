import { cn } from "@repo/ui/lib";
import NextImage from "next/image";
import { ComponentPropsWithoutRef } from "react";

interface ImageProps
  extends Omit<ComponentPropsWithoutRef<typeof NextImage>, "src" | "alt"> {
  className?: string;
  src?: string | null;
  alt?: string | null;
}

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
      className={cn("rounded-full shrink-0", className)}
      {...props}
    />
  ) : (
    <div
      className={cn(
        "rounded-full shrink-0 bg-icon-light",
        `w-[${width}px] h-[${height}px]`,
        className,
      )}
    />
  );
};
