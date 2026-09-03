"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Check, Minus, Download, ExternalLink, GraduationCap, Printer, Images, FileImage, Edit3 } from "lucide-react";
import type { College } from "@/lib/data";
import { getAllCollegesMerged } from "@/lib/store";
import { isAuthenticated } from "@/lib/auth";

const FALLBACK_CET_LINK = "https://cetcell.mahacet.org/";

export default function CollegeDetailClient({slug, serverCollege}:{slug:string, serverCollege: College | null}){
  const [college,setCollege]=useState<College | null>(serverCollege);
  const [imageModal,setImageModal]=useState<string | null>(null);
  const [isAdmin,setIsAdmin]=useState(false);
  useEffect(()=>{ setIsAdmin(isAuthenticated()); const h=()=> setIsAdmin(isAuthenticated()); window.addEventListener("auth-changed",h); window.addEventListener("storage",h); return ()=>{window.removeEventListener("auth-changed",h); window.removeEventListener("storage",h);}; },[]);

  useEffect(()=>{
    if(!college){
      const merged = getAllCollegesMerged();
      const found = merged.find(c=> c.slug===slug);
      if(found) setCollege(found);
    }
    const h=()=>{
      const merged = getAllCollegesMerged();
      const found = merged.find(c=> c.slug===slug);
      if(found) setCollege(found);
    };
    window.addEventListener("colleges-updated", h);
    window.addEventListener("storage", h);
    return ()=>{window.removeEventListener("colleges-updated", h); window.removeEventListener("storage", h);};
  },[slug, college]);

  if(!college){
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-12 text-center">
        <p className="text-sm text-zinc-400">College not found.</p>
        <Link href="/colleges" className="mt-4 inline-flex rounded-full bg-black px-5 py-2 text-sm font-bold text-white">Back to Colleges</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
      <Link href="/colleges" className="inline-flex items-center gap-1 text-sm font-medium text-zinc-400 hover:text-white no-print"><ArrowLeft className="h-4 w-4"/> Back to Colleges</Link>

      <div className="mt-4 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-[#0a0a0f] p-5 sm:p-6 hover:border-orange-500/20 hover:shadow-[0_0_40px_rgba(249,115,22,0.08)] transition-all backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shrink-0"><GraduationCap className="h-6 w-6"/></div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold leading-tight text-white">{college.name}</h1>
              <div className="mt-1 flex items-center gap-1 text-sm text-zinc-400"><MapPin className="h-4 w-4"/> {college.location} • {college.type}</div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Badge ok={college.documents.fees.available} label="Fee Structure"/>
                <Badge ok={college.documents.documentsRequired.available} label="Documents Required"/>
                <a href={(college as any).officialWebsite || FALLBACK_CET_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 px-2.5 py-1 text-xs font-semibold hover:bg-orange-500/20 hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all"><ExternalLink className="h-3.5 w-3.5"/> Official Website</a>
              </div>
            </div>
          </div>
          <div className="flex gap-2 no-print">
            {isAdmin && <Link href={`/admin/edit/${college.slug}`} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 px-4 py-2 text-sm font-bold text-white"><Edit3 className="h-4 w-4"/> Edit College</Link>}
            <button onClick={()=> window.print()} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:border-orange-500/30"><Printer className="h-4 w-4"/> Print</button>
            <Link href="/add-college" className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm font-bold text-white hover:border-orange-500/30">+ Add</Link>
          </div>
        </div>

        {/* Only Source PDFs & Images - first three removed as requested, black bg like CAP automation */}
        <div className="mt-6">
          <PdfsTab college={college} onImageClick={setImageModal}/>
        </div>
      </div>

      {/* Image Modal - like PDF open */}
      {imageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={()=>setImageModal(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-zinc-900 rounded-2xl overflow-hidden shadow-xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b bg-zinc-900">
              <span className="text-sm font-semibold flex items-center gap-2"><FileImage className="h-4 w-4"/> Image Preview</span>
              <button onClick={()=>setImageModal(null)} className="rounded-full bg-zinc-900 border px-3 py-1 text-sm hover:bg-zinc-800">Close ✕</button>
            </div>
            <div className="overflow-auto max-h-[75vh] p-4 bg-zinc-800 flex items-center justify-center">
              <img src={imageModal} alt="College document" className="max-w-full h-auto rounded-xl shadow" />
            </div>
            <div className="p-3 border-t flex gap-2 justify-end bg-zinc-900">
              <a href={imageModal} target="_blank" rel="noopener noreferrer" className="rounded-full bg-zinc-900 border px-4 py-2 text-sm font-semibold hover:bg-zinc-900 flex items-center gap-1"><ExternalLink className="h-4 w-4"/> Open in new tab</a>
              <a href={imageModal} download className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white flex items-center gap-1"><Download className="h-4 w-4"/> Download</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ok,label}:{ok:boolean,label:string}){
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${ok? "bg-emerald-950/50 border-emerald-800 text-emerald-400":"bg-zinc-800 border-zinc-700 text-zinc-500"}`}>{ok? <Check className="h-3.5 w-3.5"/>: <Minus className="h-3.5 w-3.5"/>} {label} {ok? "Available":"Not Available"}</span>
}

function PdfsTab({college, onImageClick}:{college:College, onImageClick:(url:string)=>void}){
  const all = [
    ...college.documents.fees.files.map((f:any)=> ({...f, group:"Fees"})),
    ...college.documents.documentsRequired.files.map((f:any)=> ({...f, group:"Documents"})),
    ...college.documents.admissionProcess.files.map((f:any)=> ({...f, group:"Admission"})),
    ...college.documents.forms.files.map((f:any)=> ({...f, group:"Form"})),
  ];
  if(all.length===0) return <div className="rounded-2xl border border-zinc-800 border-dashed p-8 text-center text-sm text-zinc-500">No PDFs/Images available for this college.</div>;
  const official = (college as any).officialWebsite || FALLBACK_CET_LINK;
  return (
    <div className="space-y-4">
      <div className="group rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all">
        <div>
          <div className="text-sm font-bold text-white">Direct Admission Process — Official College Website</div>
          <p className="text-xs text-orange-400/90 break-all font-medium">{official}</p>
        </div>
        <a href={official} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow shadow-orange-900/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all"><ExternalLink className="h-4 w-4"/> Visit Official Website</a>
      </div>
      <PdfsList files={all as any} onImageClick={onImageClick}/>
    </div>
  );
}

function PdfsList({files, onImageClick}:{files:any[], onImageClick?:(url:string)=>void}){
  if(!files || files.length===0) return null;
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-4">
      <div className="text-sm font-bold text-white">Source Documents — PDFs & Images (Preview always on below)</div>
      <p className="text-xs text-zinc-500 mt-1">PDFs preview inline below • click arrow ↗ to open in new tab</p>
      <div className="mt-3 grid gap-3">
        {files.map((f:any,i:number)=>(
          <div key={i} className="group flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 hover:border-orange-500/40 hover:shadow-[0_0_20px_rgba(249,115,22,0.12)] transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate flex items-center gap-2 text-white">{f.isImage? <Images className="h-4 w-4 text-orange-500"/>: <FileImage className="h-4 w-4 text-orange-500"/>} {f.fileName}</div>
                <div className="text-xs text-zinc-500">{f.group? `${f.group} • `:""}{f.isImage? "Image":"PDF"} • {f.path}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 text-xs font-semibold text-orange-400"><FileImage className="h-3.5 w-3.5"/> Preview On</span>
                <a href={f.path} target="_blank" rel="noopener noreferrer" title="Open in new tab (arrow)" className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-orange-500/50 hover:bg-orange-500 hover:text-white hover:shadow-[0_0_12px_rgba(249,115,22,0.4)] transition-all"><ExternalLink className="h-4 w-4"/></a>
                <a href={f.path} download className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-orange-500 hover:text-white transition-colors"><Download className="h-3.5 w-3.5"/> Download</a>
              </div>
            </div>
            {f.isImage ? (
              <div className="rounded-xl overflow-hidden border border-zinc-700 bg-black cursor-pointer hover:border-orange-500/30 transition-colors" onClick={()=> onImageClick && onImageClick(f.path)}>
                <img src={f.path} alt={f.fileName} className="w-full h-auto max-h-[420px] object-contain bg-zinc-900" loading="lazy" />
                <div className="px-3 py-2 text-xs text-zinc-500 flex items-center gap-1"><ExternalLink className="h-3 w-3"/> Click image to open full-screen</div>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-zinc-700 bg-white">
                <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-700 text-xs">
                  <span className="text-zinc-400">Preview: {f.fileName}</span>
                  <a href={f.path} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 flex items-center gap-1">Open in new tab <ExternalLink className="h-3 w-3"/></a>
                </div>
                <iframe src={f.path} title={f.fileName} className="w-full h-[700px] bg-white" loading="lazy" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
