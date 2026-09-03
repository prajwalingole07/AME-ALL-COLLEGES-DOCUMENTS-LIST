import colleges from "../../data/colleges.json";
import stats from "../../data/stats.json";

export type College = (typeof colleges)[number];
export type FeeCategory = College["fees"]["categories"][number];

export function getAllColleges(): College[] { return colleges as College[]; }
export function getCollegeBySlug(slug:string): College | undefined { return (colleges as College[]).find(c=>c.slug===slug || c.id===slug); }
export function getStats(){ return stats; }

export function getCities(): string[] {
  const s = new Set((colleges as College[]).map(c=>c.city));
  return Array.from(s).sort();
}
