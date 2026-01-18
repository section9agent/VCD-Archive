type Props = {
  src: string | null;
  alt: string;
};

export default function MediaImage({ src, alt }: Props) {
  if (!src) {
    return <div className="image-placeholder">No Image</div>;
  }

  return <img src={src} alt={alt} loading="lazy" />;
}
