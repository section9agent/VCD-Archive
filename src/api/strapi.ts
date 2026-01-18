const API_URL = import.meta.env.VITE_API_URL;

export async function fetchStrapi(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error("Strapi fetch failed");
  return res.json();
}
