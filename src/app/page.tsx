import Link from "next/link";
import { getAllColleges, getStats } from "@/lib/data";
import ClientColleges from "@/components/ClientColleges";
import { GraduationCap, FileText, ShieldCheck, Search, Plus, Building2, IndianRupee, FileCheck } from "lucide-react";

export default function Home(){
  const colleges = getAllColleges();
  const stats = getStats();
  const cities = Array.from(new Set(colleges.map(c=>c.city))).sort();

  return (
    <div>
      {/* Hero - MIXING COLORS beautiful, not full black */}
      <div className="relative overflow-hidden border-b border-zinc-800/50 bg-gradient-to-br from-zinc-900 via-[#0a0a0f] to-black text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_1000px_700px_at_50%_42%,rgba(251,146,60,0.11),transparent_65%),radial-gradient(ellipse_900px_600px_at_15%_10%,rgba(99,102,241,0.16),transparent_60%),radial-gradient(ellipse_700px_500px_at_85%_85%,rgba(249,115,22,0.14),transparent_60%),radial-gradient(ellipse_600px_400px_at_50%_0%,rgba(139,92,246,0.10),transparent_60%)]"/>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.04]"/>
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"/> Admission 2026–27 • Maharashtra • 55 Colleges
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                Maharashtra<br/>Engineering<br/><span className="text-white/90">College Admission 2026–27</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm sm:text-[15px] leading-relaxed text-white/85">
                Find college fees, required documents, and admission procedures in one place. Search by name, city or acronym and view official PDFs instantly.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#explore" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow hover:bg-slate-50">
                  <Search className="h-4 w-4"/> Explore Colleges
                </a>
                <Link href="/add-college" className="inline-flex items-center gap-2 rounded-full bg-slate-900/20 border border-white/20 backdrop-blur px-5 py-3 text-sm font-bold text-white hover:bg-white/20">
                  <Plus className="h-4 w-4"/> Add / Import College
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/15 px-3 py-1">✓ Category-wise fees</span>
                <span className="rounded-full bg-white/15 px-3 py-1">✓ Document checklist</span>
                <span className="rounded-full bg-white/15 px-3 py-1">✓ Original PDFs</span>
                <span className="rounded-full bg-white/15 px-3 py-1">✓ Mobile-first</span>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<Building2 className="h-5 w-5"/>} label="Total Colleges" value={String(stats.totalColleges)} sub="All from ZIP"/>
              <StatCard icon={<IndianRupee className="h-5 w-5"/>} label="Fee PDFs" value={String(stats.feesAvailable)} sub={`${stats.feesAvailable} colleges`}/>
              <StatCard icon={<FileCheck className="h-5 w-5"/>} label="Document Lists" value={String(stats.documentsAvailable)} sub={`${stats.documentsAvailable} colleges`}/>
              <StatCard icon={<FileText className="h-5 w-5"/>} label="Total PDFs" value={String(stats.totalPdfs)} sub="Fees + Docs + Forms"/>
              <div className="col-span-2 rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-4">
                <div className="text-sm font-bold flex items-center gap-2"><ShieldCheck className="h-4 w-4"/> Important</div>
                <p className="mt-1 text-xs leading-relaxed text-white/85">Fees & documents are extracted from provided college PDFs. Verify with college & official authorities before payment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explore - ALL COLLEGES DOCUMENTS LIST BELOW */}
      <div id="explore" className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-white"><GraduationCap className="h-5 w-5 text-indigo-500"/> ALL COLLEGES DOCUMENTS LIST BELOW</h2>
          <Link href="/add-college" className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"><Plus className="h-4 w-4"/> Import New College</Link>
        </div>
        <div className="mt-4">
          {/* Client side search will use base data; local additions appear after refresh via merged view on colleges page */}
          <ClientColleges colleges={colleges as any} cities={cities}/>
        </div>
      </div>
    </div>
  );
}

function StatCard({icon,label,value,sub}:{icon:React.ReactNode,label:string,value:string,sub:string}){
  return (
    <div className="rounded-2xl bg-zinc-900 p-4 shadow-sm border border-zinc-800 text-white">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black">{icon}</div>
      <div className="mt-3 text-2xl font-extrabold text-white">{value}</div>
      <div className="text-xs font-semibold text-zinc-300">{label}</div>
      <div className="text-xs text-zinc-500">{sub}</div>
    </div>
  );
}
