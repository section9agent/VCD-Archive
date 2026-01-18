import { fetchAPI } from "./strapi";
import { normalizeVCDItem } from "./normalize";

export async function getVCDItems() {
  const res = await fetchAPI("/api/vcd-items?populate=*");
  return res.data.map(normalizeVCDItem);
}

export async function getVCDItem(id: number) {
  const res = await fetchAPI(`/api/vcd-items/${id}?populate=*`);
  return normalizeVCDItem(res.data);
}
