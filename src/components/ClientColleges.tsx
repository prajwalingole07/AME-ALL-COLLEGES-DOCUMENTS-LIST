"use client";
import { useEffect, useMemo, useState } from "react";
import type { College } from "@/lib/data";
import CollegeCard from "./CollegeCard";
import CollegeSearch from "./CollegeSearch";
import { getAllCollegesMerged } from "@/lib/store";

export default function ClientColleges({colleges: initialColleges, cities: initialCities}:{colleges:College[], cities:string[]}){
  const [colleges,setColleges]=useState<College[]>(initialColleges);
  const [cities,setCities]=useState<string[]>(initialCities);
  const [q,setQ]=useState("");
  const [city,setCity]=useState("");
  const [feesOnly,setFeesOnly]=useState(false);

  useEffect(()=>{
    const update=()=>{
      const merged=getAllCollegesMerged();
      setColleges(merged);
      setCities(Array.from(new Set(merged.map(c=>c.city))).sort());
    };
    update();
    window.addEventListener("colleges-updated", update);
    window.addEventListener("storage", update);
    return ()=>{window.removeEventListener("colleges-updated", update); window.removeEventListener("storage", update);};
  },[]);

  const filtered = useMemo(()=>{
    const query = q.trim().toLowerCase();
    const queryNoZero = query.replace(/^0+/, "");
    return colleges.filter(c=>{
      if(city && c.city !== city) return false;
      if(feesOnly && !c.documents.fees.available) return false;
      if(!query) return true;
      const code = (c as any).code || (c as any).cetCode || "";
      const codeNoZero = code.replace(/^0+/, "");
      const hay = `${c.name} ${c.location} ${c.city} ${c.acronym} ${c.slug} ${code} ${codeNoZero}`.toLowerCase();
      return hay.includes(query) || (queryNoZero && hay.includes(queryNoZero));
    });
  },[q,city,feesOnly,colleges]);

  return (
    <div>
      <CollegeSearch query={q} onQuery={setQ} city={city} onCity={setCity} feesOnly={feesOnly} onFeesOnly={setFeesOnly} cities={cities}/>
      <div className="mt-3 text-sm text-zinc-400">Showing <span className="font-semibold text-white">{filtered.length}</span> of {colleges.length} colleges {q && <button onClick={()=>setQ("")} className="ml-2 rounded-full bg-zinc-900 border px-3 py-1 text-xs">Clear “{q}”</button>}</div>
      {filtered.length===0? (
        <div className="mt-8 rounded-2xl border border-dashed bg-zinc-900 p-12 text-center">
          <div className="text-sm font-semibold text-white">No colleges found</div>
          <p className="mt-1 text-sm text-zinc-400">Try a different search or clear filters.</p>
        </div>
      ): (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c=> <CollegeCard key={c.id} college={c}/>)}
        </div>
      )}
    </div>
  );
}
