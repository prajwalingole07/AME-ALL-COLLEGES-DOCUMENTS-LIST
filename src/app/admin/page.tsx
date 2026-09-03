"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Plus, Edit3, Trash2, Download, ShieldCheck, Building2, ExternalLink, FileText, Upload, FolderArchive, Settings, AlertTriangle } from "lucide-react";
import LoginGate from "@/components/LoginGate";
import { getAllCollegesMerged, deleteCustomCollege, exportCollegesJSON, createProjectPatch, saveCustomCollege, fileToDataUrl, savePdfDataUrl, deleteAllCustomColleges, deleteAllCollegesCompletely, isBaseHidden, restoreBaseColleges } from "@/lib/store";
import { CODE_MAP } from "@/lib/codes";
import type { College } from "@/lib/data";
import JSZip from "jszip";

export default function AdminPage(){
  const [colleges,setColleges]=useState<College[]>([]);
  const [q,setQ]=useState("");
  const [authed,setAuthed]=useState(false);
  const [importing,setImporting]=useState(false);
  const [importMsg,setImportMsg]=useState("");
  const [activeTab,setActiveTab]=useState<"manage"|"import">("manage");

  const refresh = ()=> setColleges(getAllCollegesMerged());
  useEffect(()=>{
    refresh();
    const h=()=> refresh();
    window.addEventListener("colleges-updated", h);
    window.addEventListener("storage", h);
    return ()=> { window.removeEventListener("colleges-updated", h); window.removeEventListener("storage", h); };
  },[]);

  const filtered = useMemo(()=>{
    const query=q.trim().toLowerCase();
    if(!query) return colleges;
    return colleges.filter(c=> `${c.name} ${c.city} ${c.slug}`.toLowerCase().includes(query));
  },[q,colleges]);

  const handleDelete=(slug:string, name:string)=>{
    if(!confirm(`Delete "${name}"? Removes local edits/custom college. Base colleges remain unless you use Delete All.`)) return;
    deleteCustomCollege(slug);
  };

  const handleDeleteAllCustom=()=>{
    if(!confirm(`Delete ALL custom/edits? (${colleges.length} colleges in local edits will be removed, base 55 remain).`)) return;
    deleteAllCustomColleges();
    alert("All custom colleges removed. Base 55 restored.");
  };
  const handleDeleteAllCompletely=()=>{
    if(!confirm(`⚠️ DELETE ALL COLLEGES? This will hide ALL 55 base colleges + custom. Only use to clear everything. You can Restore base later.`)) return;
    if(!confirm(`Are you sure? This will make college list EMPTY until you Restore or Import ZIP.`)) return;
    deleteAllCollegesCompletely();
    alert("All colleges deleted (base hidden). List now empty. Use Restore Base or Import ZIP to add back.");
  };
  const handleRestoreBase=()=>{
    restoreBaseColleges();
    alert("Base 55 colleges restored.");
  };

  const handleExportJSON=()=>{
    const blob=new Blob([exportCollegesJSON()],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="colleges.json"; a.click(); URL.revokeObjectURL(url);
  };

  const handleExportZIP=async()=>{
    const patch = await createProjectPatch();
    const zip = new JSZip();
    zip.file("data/colleges.json", patch.json);
    for(const pdf of patch.pdfs){
      const base64 = pdf.dataUrl.split(',')[1];
      if(base64){
        zip.file(`public/documents/${pdf.slug}/${pdf.fileName}`, base64, {base64:true});
      }
    }
    zip.file("README_ADMIN.txt", `Admin export ${new Date().toISOString()}\nReplace data/colleges.json and public/documents/ in project, then push to GitHub for Vercel deploy.\n`);
    const content = await zip.generateAsync({type:"blob"});
    const url=URL.createObjectURL(content);
    const a=document.createElement("a"); a.href=url; a.download=`maha-update-${Date.now()}.zip`; a.click(); URL.revokeObjectURL(url);
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    setImporting(true);
    setImportMsg(`Reading ${file.name}...`);
    try{
      const zip = await JSZip.loadAsync(file);
      const entries = Object.keys(zip.files);
      // group by college folder
      const groups = new Map<string, {name:string, files: {path:string, dataUrl:string, isImage:boolean}[]}>();
      const slugify = (n:string)=> n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,80);
      const classify = (fname:string)=>{
        const l=fname.toLowerCase();
        if(l.includes("fee")||l.includes("fess")||l.includes("fra")||l.includes("catogery")) return "fees";
        if(l.includes("document")||l.includes("required")|| (l.includes("list") && !l.includes("fee"))) return "documents";
        if(l.includes("admission")||l.includes("flowchart")||l.includes("notice")) return "admission";
        if(l.includes("form")) return "forms";
        return l.endsWith(".jpg")||l.endsWith(".png")||l.endsWith(".jpeg") ? "documents" : "other";
      };
      let processed=0;
      for(const entryName of entries){
        const entry = zip.files[entryName];
        if(entry.dir) continue;
        const parts = entryName.split("/").filter(Boolean);
        // expect at least 2 parts: root folder + college folder + file
        if(parts.length < 2) continue;
        // find college folder: if top folder is "ALL COLLEGES PDF..." then college is parts[1], else parts[0]
        let collegeName = "";
        let fileName = parts[parts.length-1];
        if(parts[0].toLowerCase().includes("all colleges") && parts.length>=3){
          collegeName = parts[1].trim();
        } else if(parts.length>=2){
          collegeName = parts[parts.length-2].trim();
          // if collegeName is file name, skip
          if(collegeName.includes(".")){ collegeName = parts[parts.length-3] || parts[0]; }
        }
        if(!collegeName || collegeName.toLowerCase().includes("all colleges")) continue;
        const slug = slugify(collegeName);
        // read file as base64 dataUrl
        const isImage = fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".png") || fileName.toLowerCase().endsWith(".jpeg");
        const mime = isImage ? (fileName.toLowerCase().endsWith(".png") ? "image/png":"image/jpeg") : "application/pdf";
        const base64 = await entry.async("base64");
        const dataUrl = `data:${mime};base64,${base64}`;
        if(!groups.has(slug)){
          groups.set(slug, {name: collegeName, files: []});
        }
        // For bulk import, don't store Data URL in localStorage (quota) — store placeholder path, keep DataUrl only in memory for this session if needed
        groups.get(slug)!.files.push({fileName, path: `/documents/${slug}/${fileName}`, dataUrl, isImage} as any);
        processed++;
      }
      // Now create colleges from groups
      let created=0;
      for(const [slug, group] of groups){
        const collegeName = group.name;
        const city = collegeName.split(",").pop()?.trim() || "Maharashtra";
        const feesFiles:any[] = [];
        const docsFiles:any[] = [];
        const admFiles:any[] = [];
        for(const f of group.files as any[]){
          const fname = f.fileName || f.path;
          const cls = classify(fname);
          // Use placeholder path for persistence (avoids quota), DataUrl kept only for memory if needed
          const meta = { fileName: fname, path: `/documents/${slug}/${fname}`, type: cls, status:"available", extracted:false, isImage: f.isImage };
          if(cls==="fees") feesFiles.push(meta);
          else if(cls==="documents") docsFiles.push(meta);
          else if(cls==="admission") admFiles.push(meta);
          else docsFiles.push(meta);
        }
        const existing = getAllCollegesMerged().find(c=>c.slug===slug);
        const newCollege:any = {
          id: slug,
          slug,
          name: collegeName,
          location: `${city}, Maharashtra`,
          city: city.replace("Maharashtra","").trim() || city,
          type: collegeName.toLowerCase().includes("government") ? "Government" : collegeName.toLowerCase().includes("university") ? "University" : "Private",
          acronym: collegeName.split(/\s+/).map((w:string)=>w[0]).join("").slice(0,6).toUpperCase(),
          code: (CODE_MAP as any)[slug] || (CODE_MAP as any)[collegeName.toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()] || "",
          cetCode: (CODE_MAP as any)[slug] || (CODE_MAP as any)[collegeName.toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()] || "",
          officialWebsite: `https://www.google.com/search?q=${encodeURIComponent(collegeName+" official website")}`,
          admissionLink: `https://www.google.com/search?q=${encodeURIComponent(collegeName+" admission")}`,
          documents: {
            fees: { available: feesFiles.length>0, files: feesFiles },
            documentsRequired: { available: docsFiles.length>0, files: docsFiles },
            admissionProcess: { available: admFiles.length>0, files: admFiles },
            forms: { available: false, files: [] },
            other: { available: false, files: [] },
          },
          fees: { available: feesFiles.length>0, categories: existing?.fees?.categories || [], rawEntries: existing?.fees?.rawEntries || [] },
          requiredDocuments: existing?.requiredDocuments || [],
          admissionProcess: existing?.admissionProcess || [],
          extractedText: existing?.extractedText || {},
          stats: { totalDocs: group.files.length, feesCount: feesFiles.length, docsCount: docsFiles.length }
        };
        saveCustomCollege(newCollege);
        created++;
      }
      setImportMsg(`Imported ${created} colleges, ${processed} files from ZIP. They appear instantly and on refresh. Use Download Project ZIP to add PDFs to public/documents for Vercel.`);
    }catch(err:any){
      setImportMsg(`Import failed: ${err?.message || err}`);
    }finally{
      setImporting(false);
      // clear input
      (e.target as HTMLInputElement).value="";
      setTimeout(()=> setImportMsg(""), 8000);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-6">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-orange-500"/> Admin — Edit Colleges</h1>
        <p className="mt-2 text-sm text-zinc-400">Login required. Edit any college, add PDFs, changes save instantly to <code className="bg-zinc-800 px-1 rounded">localStorage</code> and appear on refresh. Export ZIP to add PDFs to <code>public/documents/</code> for Vercel.</p>
      </div>

      <div className="mt-6">
        <LoginGate onAuthChange={setAuthed}>
          {/* New Tabs: Manage + Import - orange glow like CAP */}
          <div className="flex gap-2 border-b border-zinc-800 mb-4">
            <button onClick={()=>setActiveTab("manage")} className={`px-4 py-2 rounded-t-xl text-sm font-bold border-b-2 transition-all ${activeTab==="manage" ? "bg-white text-black border-orange-500" : "text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900"}`}><Settings className="h-4 w-4 inline mr-1"/> Manage Colleges</button>
            <button onClick={()=>setActiveTab("import")} className={`px-4 py-2 rounded-t-xl text-sm font-bold border-b-2 transition-all ${activeTab==="import" ? "bg-white text-black border-orange-500" : "text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900"}`}><FolderArchive className="h-4 w-4 inline mr-1"/> Import / Export ZIP</button>
          </div>

          {activeTab==="manage" ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"/>
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search college to edit/delete..." className="w-full rounded-xl border border-zinc-800 bg-black pl-10 pr-3 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none"/>
              </div>
              <Link href="/admin/edit/new" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 px-5 py-3 text-sm font-bold text-white shadow"><Plus className="h-4 w-4"/> Add New</Link>
            </div>

            {/* Delete All - new tab feature */}
            <div className="rounded-2xl border border-red-900/50 bg-gradient-to-br from-red-950/30 via-black to-zinc-900 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-red-400"><AlertTriangle className="h-4 w-4"/> Danger Zone — Delete Colleges</div>
              <p className="mt-1 text-xs text-zinc-400">Edit any college via <b>Edit</b>, delete single via <b>trash</b>, or delete all from this tab. Changes save instantly and persist on refresh.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={handleDeleteAllCustom} className="inline-flex items-center gap-2 rounded-full border border-orange-800 bg-orange-950/30 px-4 py-2 text-xs font-bold text-orange-400 hover:bg-orange-500 hover:text-white"><Trash2 className="h-4 w-4"/> Delete All Custom Edits</button>
                <button onClick={handleDeleteAllCompletely} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"><Trash2 className="h-4 w-4"/> Delete ALL Colleges</button>
                <button onClick={handleRestoreBase} className="inline-flex items-center gap-2 rounded-full border border-emerald-800 bg-emerald-950/30 px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white"><Building2 className="h-4 w-4"/> Restore Base 55</button>
                <button onClick={handleExportZIP} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-black"><Download className="h-4 w-4"/> Download ZIP</button>
              </div>
              {isBaseHidden() && <div className="mt-2 text-xs text-red-400">Base colleges are currently hidden (list empty) — click Restore Base 55.</div>}
            </div>

            <div className="text-sm text-zinc-500">Showing {filtered.length} of {colleges.length} colleges — Edit/Delete from this tab</div>
          </div>
          ) : (
          <div className="space-y-4">
            <div className="flex gap-3">
              <button onClick={handleExportJSON} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:border-orange-500/30"><Download className="h-4 w-4"/> Export JSON</button>
              <button onClick={handleExportZIP} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black hover:bg-orange-500 hover:text-white"><Download className="h-4 w-4"/> Download Project ZIP</button>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-zinc-700 bg-black p-4 hover:border-orange-500/30 transition-colors">
              <div className="flex items-center gap-2 text-sm font-bold text-white"><FolderArchive className="h-4 w-4 text-orange-500"/> Import ZIP — Bulk Add Colleges from ZIP</div>
              <p className="mt-1 text-xs text-zinc-400">Upload ZIP like <code className="bg-zinc-800 px-1 rounded">ALL COLLEGES PDF OF FEES & DOCUMENTS LIST.zip</code> — folders per college. Auto extracts and adds colleges with preview-always-on, saved to <code className="bg-zinc-800 px-1 rounded">localStorage</code>.</p>
              <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 py-6 text-sm text-zinc-300 hover:border-orange-500/50 hover:bg-zinc-800">
                <input type="file" accept=".zip" className="hidden" onChange={handleImportZip} disabled={importing}/>
                <span className="flex items-center gap-2"><Upload className="h-4 w-4"/> {importing ? "Importing..." : "Click to select ZIP — auto extract"}</span>
              </label>
              {importMsg && <div className="mt-2 rounded-xl bg-emerald-950/30 border border-emerald-800 p-3 text-xs text-emerald-400">{importMsg}</div>}
            </div>
            <div className="text-sm text-zinc-500">Showing {filtered.length} colleges — switch to <b>Manage Colleges</b> tab to edit/delete.</div>
          </div>
          )}

          {/* College grid - only in manage tab */}
          {activeTab==="manage" && (
            <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(c=>(
                <div key={c.slug} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-orange-500/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0"><Building2 className="h-5 w-5"/></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-white line-clamp-2">{c.name}</div>
                      <div className="text-xs text-zinc-500">{c.city} • {c.type}</div>
                      <div className="text-xs text-orange-400 truncate">{(c as any).officialWebsite || ""}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link href={`/admin/edit/${c.slug}`} className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-bold text-black hover:bg-orange-500 hover:text-white"><Edit3 className="h-4 w-4"/> Edit</Link>
                    <Link href={`/college/${c.slug}`} target="_blank" className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:border-orange-500/30"><ExternalLink className="h-4 w-4"/> View</Link>
                    <button onClick={()=>handleDelete(c.slug,c.name)} className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-800"><Trash2 className="h-4 w-4"/></button>
                  </div>
                  <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1"><FileText className="h-3 w-3"/> {c.stats.totalDocs} docs • {c.documents.fees.available? "Fees":"No fees"}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-4">
              <div className="text-sm font-bold text-white">How persistence works</div>
              <ul className="mt-2 list-disc pl-5 text-xs text-zinc-400 space-y-1">
                <li><b className="text-white">Immediate:</b> Save → writes to <code className="bg-zinc-800 px-1 rounded">localStorage</code> → appears instantly and on refresh (same browser).</li>
                <li><b className="text-white">PDFs:</b> uploaded PDFs stored as Data URL in <code>localStorage</code> (preview always on) and shown inline. For large PDFs, use Export ZIP.</li>
                <li><b className="text-white">For Vercel / next view on other PC:</b> Click <b>Download Project ZIP</b> → extract → replace <code>data/colleges.json</code> and copy PDFs to <code>public/documents/&lt;slug&gt;/</code> in project → push to GitHub → Vercel auto-deploys.</li>
                <li><b className="text-white">Edit any college:</b> click Edit, change name/location/official site, add/remove PDFs, Save → updates immediately.</li>
              </ul>
            </div>
            </>
          )}
        </LoginGate>
      </div>
    </div>
  );
}
