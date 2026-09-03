import Link from "next/link";
import { MapPin, FileText, GraduationCap } from "lucide-react";
import type { College } from "@/lib/data";

export default function CollegeCard({college}:{college:College}){
  const code = (college as any).code || (college as any).cetCode;
  const hasCode = code && String(code).trim() !== "";
  return (
    <Link href={`/college/${college.slug}`} className={`group flex flex-col rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black shadow-sm hover:border-orange-500/50 hover:shadow-[0_0_25px_rgba(249,115,22,0.15)] transition-all ${hasCode ? 'relative p-6 pt-12' : 'p-5'}`}>
      {hasCode && <div className="absolute top-4 left-4 bg-orange-500/10 border border-orange-500/50 text-orange-400 text-[10px] font-extrabold px-3 py-1.5 rounded-full tracking-wide">CODE: {code}</div>}
      <div className={hasCode ? "flex items-start gap-4 mt-3" : "flex items-start gap-3"}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow shadow-indigo-950/30">
          <GraduationCap className="h-5 w-5"/>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-tight text-white group-hover:text-orange-400 transition-colors">{college.name}</h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500"><MapPin className="h-3.5 w-3.5"/>{college.location}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400"><FileText className="h-3.5 w-3.5"/> {college.stats.totalDocs} docs</span>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black group-hover:bg-orange-500 group-hover:text-white transition-colors">View Details →</span>
      </div>
    </Link>
  );
}
