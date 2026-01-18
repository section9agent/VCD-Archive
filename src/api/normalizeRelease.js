export function normalizeRelease(item, apiUrl) {
  const a = item.attributes;

  return {
    id: item.id,
    title: a.title,
    publisher: a.publisher,
    country: a.country,
    audio_language: a.audio_language,
    subtitle_language: a.subtitle_language,
    created_date: a.createdAt,
    coverImage: a.coverImage?.data
      ? `${apiUrl}${a.coverImage.data.attributes.url}`
      : null
  };
}
