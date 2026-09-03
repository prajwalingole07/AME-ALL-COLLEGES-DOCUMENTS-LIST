import { getAllColleges, getStats } from "@/lib/data";
import CollegesClientMerged from "@/components/CollegesClientMerged";

export const metadata = {
  title: "All Colleges — Maharashtra Engineering Admission 2026–27",
};

export default function CollegesPage(){
  const colleges = getAllColleges();
  const stats = getStats();
  const cities = Array.from(new Set(colleges.map(c=>c.city))).sort();
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">All Colleges</h1>
          <p className="mt-1 text-sm text-zinc-400">{stats.totalColleges} colleges • {stats.feesAvailable} with fees • {stats.documentsAvailable} with document lists</p>
        </div>
      </div>
      <div className="mt-6">
        <CollegesClientMerged initialColleges={colleges as any} cities={cities}/>
      </div>
    </div>
  );
}
