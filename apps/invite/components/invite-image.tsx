import Image, { type ImageProps } from "next/image";

type InviteImageProps = Omit<ImageProps, "alt" | "height" | "src" | "width"> & {
  alt: string;
  height?: number;
  src: string;
  width?: number;
};

export function InviteImage({ alt, height = 1067, src, width = 1600, ...props }: InviteImageProps) {
  return <Image alt={alt} height={height} src={src} unoptimized width={width} {...props} />;
}
