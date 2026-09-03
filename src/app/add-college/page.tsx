"use client";
import { useState } from "react";
import { Plus, Upload, Trash2, Download, Check, AlertTriangle, FileText, Building2, FolderArchive } from "lucide-react";
import { saveCustomCollege, exportCollegesJSON, savePdfDataUrl } from "@/lib/store";
import { CODE_MAP } from "@/lib/codes";
import type { College } from "@/lib/data";
import Link from "next/link";
import LoginGate from "@/components/LoginGate";
import JSZip from "jszip";

function slugify(name:string){
  return name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,80);
}

export default function AddCollegePage(){
  const [name,setName]=useState("");
  const [location,setLocation]=useState("Pune, Maharashtra");
  const [city,setCity]=useState("Pune");
  const [type,setType]=useState("Private");
  const [officialWebsite,setOfficialWebsite]=useState("");
  const [feesFiles,setFeesFiles]=useState<File[]>([]);
  const [docsFiles,setDocsFiles]=useState<File[]>([]);
  const [admFiles,setAdmFiles]=useState<File[]>([]);
  const [msg,setMsg]=useState<string | null>(null);
  const [importing,setImporting]=useState(false);
  const [importMsg,setImportMsg]=useState("");

  const handleAdd=()=>{
    if(!name.trim()){ setMsg("Please enter college name"); return;}
    const slug = slugify(name);
    if(!slug){ setMsg("Invalid name for slug"); return;}

    const toFileMeta = (files:File[], type:string) => files.map(f=> ({
      fileName: f.name,
      path: URL.createObjectURL(f),
      type,
      status: "available",
      extracted: false,
      isImage: f.type.startsWith("image/")
    }));

    const code = (CODE_MAP as any)[slug] || (CODE_MAP as any)[name.toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()] || "";
    const newCollege: College = {
      id: slug,
      name: name.trim(),
      slug,
      location: location.trim() || `${city}, Maharashtra`,
      city: city.trim() || "Maharashtra",
      type,
      acronym: name.split(/\s+/).map(w=>w[0]).join("").slice(0,6).toUpperCase(),
      code, cetCode: code,
      officialWebsite: officialWebsite.trim() || `https://www.google.com/search?q=${encodeURIComponent(name.trim() + " official website")}`,
      admissionLink: officialWebsite.trim() || `https://www.google.com/search?q=${encodeURIComponent(name.trim() + " admission official")}`,
      documents: {
        fees: { available: feesFiles.length>0, files: toFileMeta(feesFiles,"fees") as any },
        documentsRequired: { available: docsFiles.length>0, files: toFileMeta(docsFiles,"documents") as any },
        admissionProcess: { available: admFiles.length>0, files: toFileMeta(admFiles,"admission") as any },
        forms: { available: false, files: [] as any },
        other: { available: false, files: [] as any },
      },
      fees: { available: feesFiles.length>0, categories: [] as any, rawEntries: [] as any },
      requiredDocuments: [] as any,
      admissionProcess: [] as any,
      extractedText: {} as any,
      stats: { totalDocs: feesFiles.length+docsFiles.length+admFiles.length, feesCount: feesFiles.length, docsCount: docsFiles.length }
    } as any;

    saveCustomCollege(newCollege as any);
    setMsg(`Added "${name}" (slug: ${slug}). It now appears in Home & Colleges list.`);
    setName(""); setOfficialWebsite(""); setFeesFiles([]); setDocsFiles([]); setAdmFiles([]);
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    setImporting(true);
    setImportMsg(`Reading ${file.name}...`);
    try{
      const zip = await JSZip.loadAsync(file);
      const entries = Object.keys(zip.files);
      const groups = new Map<string, {name:string, files: {fileName:string, dataUrl:string, isImage:boolean}[]}>();
      const slugifyZip = (n:string)=> n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,80);
      const classify = (fname:string)=>{
        const l=fname.toLowerCase();
        if(l.includes("fee")||l.includes("fess")||l.includes("fra")||l.includes("catogery")) return "fees";
        if(l.includes("document")||l.includes("required")|| (l.includes("list") && !l.includes("fee"))) return "documents";
        if(l.includes("admission")||l.includes("flowchart")||l.includes("notice")) return "admission";
        if(l.includes("form")) return "forms";
        return l.endsWith(".jpg")||l.endsWith(".png") ? "documents" : "other";
      };
      let processed=0;
      for(const entryName of entries){
        const entry = zip.files[entryName];
        if(entry.dir) continue;
        const parts = entryName.split("/").filter(Boolean);
        if(parts.length < 2) continue;
        let collegeName = "";
        let fileName = parts[parts.length-1];
        if(parts[0].toLowerCase().includes("all colleges") && parts.length>=3){
          collegeName = parts[1].trim();
        } else if(parts.length>=2){
          collegeName = parts[parts.length-2].trim();
          if(collegeName.includes(".")){ collegeName = parts[parts.length-3] || parts[0]; }
        }
        if(!collegeName || collegeName.toLowerCase().includes("all colleges")) continue;
        const slug = slugifyZip(collegeName);
        const isImage = fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".png") || fileName.toLowerCase().endsWith(".jpeg");
        const mime = isImage ? (fileName.toLowerCase().endsWith(".png") ? "image/png":"image/jpeg") : "application/pdf";
        const base64 = await entry.async("base64");
        const dataUrl = `data:${mime};base64,${base64}`;
        if(!groups.has(slug)) groups.set(slug, {name: collegeName, files: []});
        // Store placeholder path to avoid quota, keep dataUrl in fileName for memory only if needed
        groups.get(slug)!.files.push({fileName, dataUrl, isImage} as any);
        processed++;
      }
      let created=0;
      for(const [slug, group] of groups){
        const collegeName = group.name;
        const city = collegeName.split(",").pop()?.trim() || "Maharashtra";
        const feesFilesZip:any[]=[]; const docsFilesZip:any[]=[]; const admFilesZip:any[]=[];
        for(const f of group.files as any[]){
          const cls = classify(f.fileName);
          const meta = { fileName: f.fileName, path: `/documents/${slug}/${f.fileName}`, type: cls, status:"available", extracted:false, isImage: f.isImage };
          if(cls==="fees") feesFilesZip.push(meta);
          else if(cls==="documents") docsFilesZip.push(meta);
          else if(cls==="admission") admFilesZip.push(meta);
          else docsFilesZip.push(meta);
        }
        const normKey = collegeName.toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
        const code = (CODE_MAP as any)[slug] || (CODE_MAP as any)[normKey] || "";
        const newCollege:any = {
          id: slug, slug, name: collegeName, location: `${city}, Maharashtra`, city: city.replace("Maharashtra","").trim() || city,
          type: collegeName.toLowerCase().includes("government") ? "Government" : collegeName.toLowerCase().includes("university") ? "University" : "Private",
          acronym: collegeName.split(/\s+/).map((w:string)=>w[0]).join("").slice(0,6).toUpperCase(),
          code, cetCode: code,
          officialWebsite: `https://www.google.com/search?q=${encodeURIComponent(collegeName+" official website")}`,
          admissionLink: `https://www.google.com/search?q=${encodeURIComponent(collegeName+" admission")}`,
          documents: { fees: { available: feesFilesZip.length>0, files: feesFilesZip }, documentsRequired: { available: docsFilesZip.length>0, files: docsFilesZip }, admissionProcess: { available: admFilesZip.length>0, files: admFilesZip }, forms: { available:false, files:[] }, other: { available:false, files:[] } },
          fees: { available: feesFilesZip.length>0, categories: [], rawEntries: [] },
          requiredDocuments: [], admissionProcess: [], extractedText: {},
          stats: { totalDocs: group.files.length, feesCount: feesFilesZip.length, docsCount: docsFilesZip.length }
        };
        saveCustomCollege(newCollege);
        created++;
      }
      setImportMsg(`Imported ${created} colleges, ${processed} files from ZIP. They appear instantly on main page with code and on refresh. Use Download Project ZIP to add PDFs to public/documents for Vercel.`);
    }catch(err:any){
      setImportMsg(`Import failed: ${err?.message || err}`);
    }finally{
      setImporting(false);
      (e.target as HTMLInputElement).value="";
      setTimeout(()=> setImportMsg(""), 8000);
    }
  };

  const downloadMerged=()=>{
    const blob=new Blob([exportCollegesJSON()],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="colleges.json"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white">
        <h1 className="text-2xl font-extrabold flex items-center gap-2"><Plus className="h-6 w-6"/> Add / Import New College</h1>
        <p className="mt-2 text-sm text-white/85">Admin-only import. Login to unlock. After verification, the import form opens automatically.</p>
      </div>

      <div className="mt-6">
        <LoginGate>
          {/* Import ZIP here as requested */}
          <div className="mb-4 rounded-2xl border-2 border-dashed border-zinc-700 bg-black p-4 hover:border-orange-500/30 transition-colors">
            <div className="flex items-center gap-2 text-sm font-bold text-white"><FolderArchive className="h-4 w-4 text-orange-500"/> Import ZIP — Bulk Add Colleges from ZIP</div>
            <p className="mt-1 text-xs text-zinc-400">Upload ZIP like <code className="bg-zinc-800 px-1 rounded">ALL COLLEGES PDF OF FEES & DOCUMENTS LIST.zip</code> — folders per college. It will automatically extract folders and add colleges with PDFs (preview always on).</p>
            <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 py-6 text-sm text-zinc-300 hover:border-orange-500/50 hover:bg-zinc-800">
              <input type="file" accept=".zip" className="hidden" onChange={handleImportZip} disabled={importing}/>
              <span className="flex items-center gap-2"><Upload className="h-4 w-4"/> {importing ? "Importing ZIP..." : "Click to select ZIP — auto extract & add colleges"}</span>
            </label>
            {importMsg && <div className="mt-2 rounded-xl bg-emerald-950/30 border border-emerald-800 p-3 text-xs text-emerald-400">{importMsg}</div>}
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold">College Name *</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Trinity College of Engineering, Pune" className="mt-1 w-full rounded-xl border bg-zinc-900 px-3 py-3 text-sm outline-none focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div>
                <label className="text-sm font-semibold">City</label>
                <input value={city} onChange={e=>setCity(e.target.value)} placeholder="Pune" className="mt-1 w-full rounded-xl border bg-zinc-900 px-3 py-3 text-sm outline-none focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div>
                <label className="text-sm font-semibold">Type</label>
                <select value={type} onChange={e=>setType(e.target.value)} className="mt-1 w-full rounded-xl border bg-zinc-900 px-3 py-3 text-sm">
                  <option>Private</option><option>Government</option><option>University</option><option>Autonomous</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold">Location (full)</label>
                <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Pune, Maharashtra" className="mt-1 w-full rounded-xl border bg-zinc-900 px-3 py-3 text-sm outline-none focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold">Official College Website (Direct Admission Link) *</label>
                <input value={officialWebsite} onChange={e=>setOfficialWebsite(e.target.value)} placeholder="https://www.college.edu.in" className="mt-1 w-full rounded-xl border bg-zinc-900 px-3 py-3 text-sm outline-none focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500"/>
                <p className="mt-1 text-xs text-zinc-500">This will be shown as “Direct Admission Process — Official College Website” on the college page.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <FileUpload label="Fee Structure PDFs / Images" files={feesFiles} setFiles={setFeesFiles} accept=".pdf,.jpg,.png,.jpeg"/>
              <FileUpload label="Documents Required PDFs / Images" files={docsFiles} setFiles={setDocsFiles} accept=".pdf,.jpg,.png,.jpeg"/>
              <FileUpload label="Admission Process PDFs (optional)" files={admFiles} setFiles={setAdmFiles} accept=".pdf,.jpg,.png,.jpeg"/>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={handleAdd} className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white hover:bg-slate-800"><Check className="h-4 w-4"/> Save College</button>
              <button onClick={downloadMerged} className="inline-flex items-center gap-2 rounded-full border bg-zinc-900 px-6 py-3 text-sm font-semibold hover:bg-zinc-900"><Download className="h-4 w-4"/> Export Merged JSON</button>
              <Link href="/colleges" className="inline-flex items-center gap-2 rounded-full border bg-zinc-900 px-6 py-3 text-sm font-semibold hover:bg-zinc-900">View Colleges →</Link>
            </div>

            {msg && <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 flex gap-2"><Check className="h-4 w-4 mt-0.5"/>{msg}</div>}

            <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <div className="text-sm font-semibold text-amber-900 flex items-center gap-2"><AlertTriangle className="h-4 w-4"/> How it works</div>
              <ol className="mt-2 list-decimal pl-5 text-xs leading-relaxed text-amber-800 space-y-1">
                <li>Login with admin credentials — form unlocks after verification</li>
                <li>Fill name, city, type — slug auto-generated for URL</li>
                <li>Upload PDFs per category (fees, docs, admission)</li>
                <li>Click Save — college appears instantly via localStorage</li>
                <li>Export Merged JSON and replace <code>data/colleges.json</code> for permanent Vercel deploy</li>
              </ol>
            </div>

            <div className="mt-6 rounded-xl bg-zinc-900 border p-4">
              <div className="text-sm font-semibold flex items-center gap-2"><Building2 className="h-4 w-4"/> Bulk Import (ZIP)</div>
              <p className="mt-1 text-xs text-zinc-400">For many colleges, put PDFs into folders per college inside <code>downloads_extract/ALL COLLEGES...</code> and run: <code className="bg-zinc-900 border px-1 py-0.5 rounded">python extract_colleges.py</code></p>
            </div>
          </div>
        </LoginGate>
      </div>
    </div>
  );
}

function FileUpload({label, files, setFiles, accept}:{label:string, files:File[], setFiles:(f:File[])=>void, accept:string}){
  return (
    <div className="rounded-xl border bg-zinc-900 p-4">
      <div className="text-sm font-semibold flex items-center gap-2"><Upload className="h-4 w-4"/> {label} <span className="text-xs font-normal text-zinc-500">({files.length})</span></div>
      <label className="mt-2 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed bg-zinc-900 py-6 text-sm font-medium hover:bg-zinc-900">
        <input type="file" multiple accept={accept} className="hidden" onChange={e=> {
          const list = e.target.files ? Array.from(e.target.files) : [];
          setFiles([...files, ...list]);
        }}/>
        <span className="flex items-center gap-2"><FileText className="h-4 w-4"/> Click to upload or drag PDFs/images</span>
      </label>
      {files.length>0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f,i)=>(
            <li key={i} className="flex items-center justify-between rounded-lg bg-zinc-900 border px-3 py-2 text-xs">
              <span className="truncate">{f.name} • {(f.size/1024).toFixed(0)} KB</span>
              <button onClick={()=> setFiles(files.filter((_,idx)=> idx!==i))} className="rounded-full p-1 hover:bg-zinc-800"><Trash2 className="h-4 w-4 text-zinc-500"/></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
