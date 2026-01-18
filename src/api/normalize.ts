export function normalizeVCDItem(item: any) {
  const attrs = item.attributes;

  return {
    id: item.id,
    title: attrs.title,
    description: attrs.description,
    year: attrs.year,
    category: attrs.category,
    tags: attrs.tags || [],
    image: attrs.coverImage?.data
      ? `${import.meta.env.VITE_API_URL}${attrs.coverImage.data.attributes.url}`
      : null,
    gallery: attrs.gallery?.data?.map((img: any) =>
      `${import.meta.env.VITE_API_URL}${img.attributes.url}`
    ) || [],
  };
}
