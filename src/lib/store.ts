"use client";
import type { College } from "./data";
import { getAllColleges } from "./data";

const KEY = "custom_colleges_2026";
const PDF_KEY_PREFIX = "pdf_data_2026_";
const DELETED_KEY = "deleted_base_2026";
const VERSION_KEY = "data_version_2026";
const CURRENT_VERSION = "68"; // bump when base colleges change (55->68) to clear stale custom with wrong codes

export function checkDataVersion(){
  if (typeof window === "undefined") return;
  const v = localStorage.getItem(VERSION_KEY);
  if (v !== CURRENT_VERSION){
    localStorage.removeItem(KEY);
    Object.keys(localStorage).forEach(k=>{
      if(k.startsWith(PDF_KEY_PREFIX)) localStorage.removeItem(k);
    });
    localStorage.removeItem(DELETED_KEY);
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    window.dispatchEvent(new CustomEvent("colleges-updated"));
  }
}

export function getCustomColleges(): College[] {
  if (typeof window === "undefined") return [];
  checkDataVersion();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveCustomCollege(college: College) {
  const existing = getCustomColleges();
  const idx = existing.findIndex(c => c.slug === college.slug);
  if (idx >= 0) existing[idx] = college;
  else existing.push(college);
  localStorage.setItem(KEY, JSON.stringify(existing));
  window.dispatchEvent(new CustomEvent("colleges-updated"));
}

export function updateCollege(slug: string, updates: Partial<College>) {
  const custom = getCustomColleges();
  const base = getAllColleges().find(c => c.slug === slug);
  const existing = custom.find(c => c.slug === slug) || base;
  if (!existing) return;
  const updated = { ...existing, ...updates, slug, id: slug } as College;
  saveCustomCollege(updated);
}

export function deleteCustomCollege(slug: string) {
  const existing = getCustomColleges().filter(c => c.slug !== slug);
  localStorage.setItem(KEY, JSON.stringify(existing));
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith(PDF_KEY_PREFIX + slug)) localStorage.removeItem(k);
  });
  window.dispatchEvent(new CustomEvent("colleges-updated"));
}

export function deleteCollege(slug: string) {
  // Handles both custom and base colleges - for base, add to deleted list
  const custom = getCustomColleges();
  const isCustom = custom.some(c => c.slug === slug);
  if (isCustom) {
    deleteCustomCollege(slug);
    return;
  }
  // Base college: add to deleted_base list
  try {
    const deleted: string[] = JSON.parse(localStorage.getItem(DELETED_KEY) || "[]");
    if (!deleted.includes(slug)) {
      deleted.push(slug);
      localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
    }
  } catch {}
  // Also remove any custom with same slug
  deleteCustomCollege(slug);
  window.dispatchEvent(new CustomEvent("colleges-updated"));
}

export function getDeletedBase(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(DELETED_KEY) || "[]"); } catch { return []; }
}

export function deleteAllCustomColleges() {
  localStorage.removeItem(KEY);
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith(PDF_KEY_PREFIX)) localStorage.removeItem(k);
  });
  // Keep deleted_base as is (so base deletions persist), but for "delete all custom" we don't clear deleted base
  window.dispatchEvent(new CustomEvent("colleges-updated"));
}

export function clearDeletedBase() {
  localStorage.removeItem(DELETED_KEY);
  window.dispatchEvent(new CustomEvent("colleges-updated"));
}

export function deleteAllCollegesCompletely() {
  // For admin: clear all custom + hide base? Base is static, can't delete, but we can mark deleted via localStorage flag
  // Instead, we clear custom and set a flag to hide base colleges (admin delete all)
  deleteAllCustomColleges();
  localStorage.setItem("hide_base_colleges", "true");
  window.dispatchEvent(new CustomEvent("colleges-updated"));
}

export function isBaseHidden(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("hide_base_colleges") === "true";
}

export function restoreBaseColleges() {
  localStorage.removeItem("hide_base_colleges");
  window.dispatchEvent(new CustomEvent("colleges-updated"));
}

export function getAllCollegesMerged(): College[] {
  const hideBase = isBaseHidden();
  const deleted = getDeletedBase();
  const base = hideBase ? [] : getAllColleges().filter(c => !deleted.includes(c.slug));
  const custom = getCustomColleges();
  const map = new Map<string, College>();
  base.forEach(c => map.set(c.slug, c));
  custom.forEach(c => map.set(c.slug, c));
  // Also filter out deleted that might be custom (already removed) but ensure custom not in deleted
  const result = Array.from(map.values()).filter(c => !deleted.includes(c.slug));
  return result.sort((a,b)=> a.name.localeCompare(b.name));
}

export function getMergedCollegeBySlug(slug: string): College | undefined {
  return getAllCollegesMerged().find(c => c.slug === slug);
}

export function exportCollegesJSON(): string {
  return JSON.stringify(getAllCollegesMerged(), null, 2);
}

// PDF persistence helpers
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function savePdfDataUrl(slug: string, fileName: string, dataUrl: string) {
  try {
    localStorage.setItem(`${PDF_KEY_PREFIX}${slug}_${fileName}`, dataUrl);
  } catch (e) {
    console.warn("localStorage full, cannot save PDF", e);
  }
}

export function getPdfDataUrl(slug: string, fileName: string): string | null {
  return localStorage.getItem(`${PDF_KEY_PREFIX}${slug}_${fileName}`);
}

// For Vercel export: create a downloadable project patch
export async function createProjectPatch(): Promise<{json: string, pdfs: {slug: string, fileName: string, dataUrl: string}[]}> {
  const colleges = getAllCollegesMerged();
  const json = JSON.stringify(colleges, null, 2);
  const pdfs: {slug: string, fileName: string, dataUrl: string}[] = [];
  colleges.forEach(c => {
    const allFiles = [
      ...(c.documents.fees.files as any[]),
      ...(c.documents.documentsRequired.files as any[]),
      ...(c.documents.admissionProcess.files as any[]),
      ...(c.documents.forms.files as any[]),
    ];
    allFiles.forEach(f => {
      if (f.path && f.path.startsWith('data:')) {
        pdfs.push({ slug: c.slug, fileName: f.fileName, dataUrl: f.path });
      } else {
        const stored = getPdfDataUrl(c.slug, f.fileName);
        if (stored) pdfs.push({ slug: c.slug, fileName: f.fileName, dataUrl: stored });
      }
    });
  });
  return { json, pdfs };
}
