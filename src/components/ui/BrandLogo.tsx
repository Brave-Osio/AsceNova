interface BrandLogoProps {
  size?: number;
  className?: string;
}

/** The ASCENOVA mark, served from /public (resized from the app's existing icon asset). */
export default function BrandLogo({ size = 32, className = '' }: BrandLogoProps) {
  return (
    <img
      src="/ascenova-logo.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`flex-shrink-0 rounded-lg ${className}`}
    />
  );
}
