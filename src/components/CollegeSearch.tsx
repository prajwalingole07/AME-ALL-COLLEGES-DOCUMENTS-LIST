"use client";
import { Search, SlidersHorizontal } from "lucide-react";

export default function CollegeSearch({query, onQuery, city, onCity, feesOnly, onFeesOnly, cities}:{query:string, onQuery:(v:string)=>void, city:string, onCity:(v:string)=>void, feesOnly:boolean, onFeesOnly:(v:boolean)=>void, cities:string[]}){
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-sm hover:border-orange-500/20 hover:shadow-[0_0_20px_rgba(249,115,22,0.08)] transition-all">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"/>
          <input value={query} onChange={e=>onQuery(e.target.value)} placeholder="Search college, city, acronym — e.g. trinity, pune, VIT" className="w-full rounded-xl border border-zinc-800 bg-black pl-10 pr-3 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:bg-zinc-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50" />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"/>
            <select value={city} onChange={e=>onCity(e.target.value)} className="rounded-xl border border-zinc-800 bg-black pl-9 pr-8 py-3 text-sm text-white">
              <option value="">All Cities</option>
              {cities.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-300">
            <input type="checkbox" checked={feesOnly} onChange={e=>onFeesOnly(e.target.checked)} className="h-4 w-4 rounded border-zinc-700 bg-black text-indigo-600"/>
            Fees available
          </label>
        </div>
      </div>
    </div>
  );
}
