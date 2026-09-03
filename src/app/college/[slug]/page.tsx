import { getAllColleges, getCollegeBySlug } from "@/lib/data";
import CollegeDetailClient from "@/components/CollegeDetailClient";

export async function generateStaticParams(){
  return getAllColleges().map(c=> ({ slug: c.slug }));
}

export async function generateMetadata({params}:{params: Promise<{slug:string}>}){
  const {slug}=await params;
  const college = getCollegeBySlug(slug);
  if(!college) return { title: "College not found" };
  return {
    title: `${college.name} — Fees & Admission 2026–27`,
    description: `Fee structure, required documents and PDFs for ${college.name}, ${college.location}`,
  };
}

export default async function Page({params}:{params: Promise<{slug:string}>}){
  const {slug}=await params;
  const college = getCollegeBySlug(slug);
  // Pass server college if found; client will also check localStorage for custom
  return <CollegeDetailClient slug={slug} serverCollege={college as any}/>;
}
