"use client";
import { useState } from "react";
import { IndianRupee, AlertTriangle } from "lucide-react";
import type { College } from "@/lib/data";
import { formatINR } from "@/lib/utils";

export default function FeeDisplay({college}:{college:College}){
  const cats = college.fees.categories;
  const entries = college.fees.rawEntries;
  const [active,setActive]=useState<number>(0);

  if(!college.documents.fees.available){
    return <div className="rounded-2xl border border-dashed bg-zinc-900 p-8 text-center text-sm text-zinc-400">Fee Structure: <span className="font-semibold">Not Available</span> in provided documents.</div>
  }
  // If parsed categories exist, show them
  if(cats && (cats as any[]).length>0){
    const catsAny = cats as any[];
    return (
      <div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {catsAny.map((c:any,i:number)=>(
            <button key={i} onClick={()=>setActive(i)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold border ${i===active? "bg-black text-white border-slate-900":"bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-900"}`}>{c.category}</button>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border bg-zinc-900 overflow-hidden">
          {catsAny[active] && (
            <div className="p-5">
              <div className="text-sm font-semibold text-white flex items-center gap-2"><IndianRupee className="h-4 w-4"/> Category: {catsAny[active].category}</div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FeeItem label="Tuition Fee" value={catsAny[active].tuitionFee}/>
                <FeeItem label="Development Fee" value={catsAny[active].developmentFee}/>
                <FeeItem label="Total" value={catsAny[active].total} highlight/>
              </div>
              <p className="mt-3 text-xs text-zinc-500">Source: {college.documents.fees.files[0]?.fileName}</p>
            </div>
          )}
        </div>
        {entries.length>0 && (
          <div className="mt-4 rounded-2xl border bg-zinc-900 p-4">
            <div className="text-sm font-semibold">All fee components (extracted)</div>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-zinc-500"><th className="py-2 pr-4">Fee Type</th><th className="py-2">Amounts (per category)</th></tr></thead>
                <tbody>
                  {entries.map((e,idx)=>(
                    <tr key={idx} className="border-t"><td className="py-2 pr-4 font-medium">{e.label}</td><td className="py-2 font-mono text-xs">{e.amounts.join(" • ")}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback: show feeEntries if any
  if(entries.length>0){
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border bg-zinc-900 overflow-hidden">
          <div className="p-4 border-b flex items-center gap-2 text-sm font-semibold"><IndianRupee className="h-4 w-4"/> Fee components extracted from PDF</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900"><tr><th className="text-left px-4 py-2">Fee Type</th><th className="text-left px-4 py-2">Amount(s)</th></tr></thead>
              <tbody>
                {entries.map((e,i)=>(
                  <tr key={i} className="border-t"><td className="px-4 py-2">{e.label}</td><td className="px-4 py-2 font-mono text-xs break-all">{e.amounts.join(" | ")}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-zinc-500 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5"/> Category-wise split not auto-detected for this PDF. Please view original PDF for exact category table.</p>
      </div>
    );
  }

  // Last fallback: scanned image
  return (
    <div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex gap-2"><AlertTriangle className="h-5 w-5 shrink-0"/> This fee PDF appears to be a scanned image. Text could not be auto-extracted. Please open the original document below.</div>
    </div>
  );
}

function FeeItem({label,value,highlight}:{label:string, value:any, highlight?:boolean}){
  return (
    <div className={`rounded-2xl border p-4 ${highlight? "bg-black text-white border-slate-900":"bg-zinc-900 border-zinc-800"}`}>
      <div className={`text-xs ${highlight? "text-slate-300":"text-zinc-500"}`}>{label}</div>
      <div className="mt-1 text-lg font-bold">{formatINR(value)}</div>
    </div>
  );
}
