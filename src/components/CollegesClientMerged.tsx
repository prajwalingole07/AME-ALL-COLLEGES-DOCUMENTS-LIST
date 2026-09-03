"use client";
import { useEffect, useMemo, useState } from "react";
import type { College } from "@/lib/data";
import CollegeCard from "./CollegeCard";
import CollegeSearch from "./CollegeSearch";
import { getAllCollegesMerged, exportCollegesJSON } from "@/lib/store";
import Link from "next/link";
import { Download, Trash2 } from "lucide-react";

export default function CollegesClientMerged({initialColleges, cities}:{initialColleges:College[], cities:string[]}){
  const [colleges,setColleges]=useState<College[]>(initialColleges);
  const [q,setQ]=useState("");
  const [city,setCity]=useState("");
  const [feesOnly,setFeesOnly]=useState(false);

  useEffect(()=>{
    const update=()=> setColleges(getAllCollegesMerged());
    update();
    window.addEventListener("colleges-updated", update);
    window.addEventListener("storage", update);
    return ()=> {
      window.removeEventListener("colleges-updated", update);
      window.removeEventListener("storage", update);
    };
  },[]);

  const filtered = useMemo(()=>{
    const query=q.trim().toLowerCase();
    const queryNoZero=query.replace(/^0+/, "");
    return colleges.filter(c=>{
      if(city && c.city!==city) return false;
      if(feesOnly && !c.documents.fees.available) return false;
      if(!query) return true;
      const code=(c as any).code||(c as any).cetCode||"";
      const codeNoZero=code.replace(/^0+/, "");
      const hay=`${c.name} ${c.location} ${c.city} ${c.acronym} ${c.slug} ${code} ${codeNoZero}`.toLowerCase();
      return hay.includes(query) || (queryNoZero && hay.includes(queryNoZero));
    });
  },[q,city,feesOnly,colleges]);

  const downloadJSON=()=>{
    const blob=new Blob([exportCollegesJSON()],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download="colleges-merged.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <CollegeSearch query={q} onQuery={setQ} city={city} onCity={setCity} feesOnly={feesOnly} onFeesOnly={setFeesOnly} cities={cities}/>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
        <span>Showing <b className="text-white">{filtered.length}</b> of {colleges.length}</span>
        <span className="text-slate-300">•</span>
        <button onClick={downloadJSON} className="inline-flex items-center gap-1 rounded-full border bg-zinc-900 px-3 py-1 text-xs font-semibold hover:bg-zinc-900"><Download className="h-3.5 w-3.5"/> Export JSON</button>
        <Link href="/add-college" className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">+ Add College</Link>
      </div>
      {filtered.length===0? (
        <div className="mt-8 rounded-2xl border border-dashed bg-zinc-900 p-12 text-center">
          <div className="text-sm font-semibold">No colleges found</div>
          <p className="mt-1 text-sm text-zinc-400">Try different search.</p>
        </div>
      ):(
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c=> <CollegeCard key={c.slug} college={c}/>)}
        </div>
      )}
    </div>
  );
}
