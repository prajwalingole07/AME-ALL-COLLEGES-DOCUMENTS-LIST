"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Upload, Trash2, FileText, Building2 } from "lucide-react";
import LoginGate from "@/components/LoginGate";
import { getMergedCollegeBySlug, saveCustomCollege, fileToDataUrl, savePdfDataUrl } from "@/lib/store";
import { getAllColleges } from "@/lib/data";
import type { College } from "@/lib/data";

function slugify(name:string){
  return name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,80);
}

export default function EditPage(){
  const params = useParams<{slug:string}>();
  const router = useRouter();
  const slugParam = params.slug;
  const isNew = slugParam === "new";

  const [authed,setAuthed]=useState(false);
  const [name,setName]=useState("");
  const [location,setLocation]=useState("");
  const [city,setCity]=useState("");
  const [type,setType]=useState("Private");
  const [official,setOfficial]=useState("");
  const [feesFiles,setFeesFiles]=useState<{name:string, path:string, dataUrl?:string, isImage:boolean}[]>([]);
  const [docsFiles,setDocsFiles]=useState<{name:string, path:string, dataUrl?:string, isImage:boolean}[]>([]);
  const [msg,setMsg]=useState("");

  useEffect(()=>{
    if(isNew) return;
    const c = getMergedCollegeBySlug(slugParam);
    if(c){
      setName(c.name);
      setLocation(c.location);
      setCity(c.city);
      setType(c.type);
      setOfficial((c as any).officialWebsite || "");
      setFeesFiles((c.documents.fees.files as any[]).map(f=> ({name:f.fileName, path:f.path, isImage:f.isImage})));
      setDocsFiles((c.documents.documentsRequired.files as any[]).map(f=> ({name:f.fileName, path:f.path, isImage:f.isImage})));
    }
  },[slugParam, isNew, authed]);

  const handleUpload = async (files: FileList | null, setter: any, slug:string)=>{
    if(!files) return;
    const arr = Array.from(files);
    const newEntries:any[]=[];
    for(const f of arr){
      const dataUrl = await fileToDataUrl(f);
      const isImage = f.type.startsWith("image/");
      newEntries.push({ name: f.name, path: dataUrl, dataUrl, isImage });
      // persist dataUrl for refresh
      savePdfDataUrl(slug, f.name, dataUrl);
    }
    setter((prev:any)=> [...prev, ...newEntries]);
  };

  const handleSave = async()=>{
    if(!name.trim()){ setMsg("Name required"); return; }
    const slug = isNew ? slugify(name) : slugParam;
    if(!slug){ setMsg("Invalid slug"); return; }

    const toFileMeta = (files:any[])=> files.map(f=> ({
      fileName: f.name,
      path: f.dataUrl || f.path, // dataUrl persists, preview always on
      type: "fees",
      status: "available",
      extracted: false,
      isImage: f.isImage
    }));

    // Need to handle both fees and docs separately but use same structure
    const feesMeta = toFileMeta(feesFiles).map(f=> ({...f, type:"fees"}));
    const docsMeta = toFileMeta(docsFiles).map(f=> ({...f, type:"documents"}));

    const base = getMergedCollegeBySlug(slug) || getAllColleges().find(c=>c.slug===slug);
    const newCollege: College = {
      id: slug,
      name: name.trim(),
      slug,
      location: location.trim() || `${city}, Maharashtra`,
      city: city.trim() || "Maharashtra",
      type,
      acronym: name.split(/\s+/).map(w=>w[0]).join("").slice(0,6).toUpperCase(),
      officialWebsite: official.trim() || `https://www.google.com/search?q=${encodeURIComponent(name.trim()+" official website")}`,
      admissionLink: official.trim() || `https://www.google.com/search?q=${encodeURIComponent(name.trim()+" admission")}`,
      documents: {
        fees: { available: feesMeta.length>0, files: feesMeta as any },
        documentsRequired: { available: docsMeta.length>0, files: docsMeta as any },
        admissionProcess: { available: (base as any)?.documents?.admissionProcess?.available || false, files: (base as any)?.documents?.admissionProcess?.files || [] as any },
        forms: { available: false, files: [] as any },
        other: { available: false, files: [] as any },
      },
      fees: { available: feesMeta.length>0, categories: (base as any)?.fees?.categories || [] as any, rawEntries: (base as any)?.fees?.rawEntries || [] as any },
      requiredDocuments: (base as any)?.requiredDocuments || [] as any,
      admissionProcess: (base as any)?.admissionProcess || [] as any,
      extractedText: (base as any)?.extractedText || {} as any,
      stats: { totalDocs: feesMeta.length+docsMeta.length, feesCount: feesMeta.length, docsCount: docsMeta.length }
    } as any;

    saveCustomCollege(newCollege);
    // ensure pdfs saved for refresh already via savePdfDataUrl above, but also ensure current fees/docs dataUrls saved
    feesFiles.forEach(f=> { if(f.dataUrl) savePdfDataUrl(slug, f.name, f.dataUrl); });
    docsFiles.forEach(f=> { if(f.dataUrl) savePdfDataUrl(slug, f.name, f.dataUrl); });

    setMsg(`Saved "${name}" (slug: ${slug}). Preview always on, appears on refresh, and will be included in Export ZIP for Vercel. PDFs added to project folder via ZIP.`);
    // also store that new slug needs folder for next view - handled via export ZIP
    setTimeout(()=> router.push(`/college/${slug}`), 800);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4"/> Back to Admin</Link>
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-zinc-800 p-6">
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2"><Building2 className="h-5 w-5 text-orange-500"/> {isNew? "Add New College":"Edit College"}</h1>
        <p className="text-sm text-zinc-400">Changes save to <code className="bg-zinc-800 px-1 rounded">localStorage</code> and show immediately + on refresh. Use Export ZIP to add PDFs to <code>public/documents/</code> for Vercel.</p>
      </div>

      <div className="mt-6">
        <LoginGate onAuthChange={setAuthed}>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-white">College Name *</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Trinity College..." className="mt-1 w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/50 outline-none"/>
              </div>
              <div>
                <label className="text-sm font-semibold text-white">City</label>
                <input value={city} onChange={e=>setCity(e.target.value)} className="mt-1 w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white focus:border-orange-500/50 outline-none"/>
              </div>
              <div>
                <label className="text-sm font-semibold text-white">Type</label>
                <select value={type} onChange={e=>setType(e.target.value)} className="mt-1 w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white">
                  <option>Private</option><option>Government</option><option>University</option><option>Autonomous</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-white">Location</label>
                <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Pune, Maharashtra" className="mt-1 w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/50 outline-none"/>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-white">Official Website (Direct Admission Link)</label>
                <input value={official} onChange={e=>setOfficial(e.target.value)} placeholder="https://www.college.edu.in" className="mt-1 w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/50 outline-none"/>
              </div>
            </div>

            <FileSection title="Fee Structure PDFs / Images" files={feesFiles} setFiles={setFeesFiles} onUpload={(e)=> handleUpload(e.target.files, setFeesFiles, isNew? slugify(name): slugParam)} />
            <FileSection title="Documents Required PDFs / Images" files={docsFiles} setFiles={setDocsFiles} onUpload={(e)=> handleUpload(e.target.files, setDocsFiles, isNew? slugify(name): slugParam)} />

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow"><Save className="h-4 w-4"/> Save (instant + refresh)</button>
              <Link href="/admin" className="rounded-full border border-zinc-700 bg-zinc-800 px-6 py-3 text-sm text-white">Cancel</Link>
            </div>
            {msg && <div className="rounded-xl bg-emerald-950/30 border border-emerald-800 p-3 text-sm text-emerald-400">{msg}</div>}
            <div className="rounded-xl bg-black border border-zinc-800 p-3 text-xs text-zinc-400">
              <b className="text-white">For Vercel / next view on other device:</b> After Save, go back to <Link href="/admin" className="text-orange-400 underline">Admin → Download Project ZIP</Link>, extract and replace <code className="bg-zinc-800 px-1 rounded">data/colleges.json</code> and copy PDFs to <code className="bg-zinc-800 px-1 rounded">public/documents/&lt;slug&gt;/</code>, push to GitHub.
            </div>
          </div>
        </LoginGate>
      </div>
    </div>
  );
}

function FileSection({title, files, setFiles, onUpload}:{title:string, files:any[], setFiles:any, onUpload:(e:any)=>void}){
  return (
    <div className="rounded-xl border border-zinc-800 bg-black p-4">
      <div className="text-sm font-semibold text-white flex items-center gap-2"><Upload className="h-4 w-4 text-orange-500"/> {title} ({files.length})</div>
      <label className="mt-2 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900 py-6 text-sm text-zinc-400 hover:border-orange-500/50 hover:bg-zinc-800">
        <input type="file" multiple accept=".pdf,.jpg,.png,.jpeg" className="hidden" onChange={onUpload}/>
        <span className="flex items-center gap-2"><FileText className="h-4 w-4"/> Click to upload PDFs/images (preview always on)</span>
      </label>
      {files.length>0 && (
        <div className="mt-3 space-y-2">
          {files.map((f:any,i:number)=>(
            <div key={i} className="flex items-center justify-between rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs">
              <span className="truncate text-white">{f.name} • {f.path?.startsWith('data:')? "Data URL (persisted)": f.path?.slice(0,40)}</span>
              <button onClick={()=> setFiles(files.filter((_:any,idx:number)=> idx!==i))} className="rounded-full p-1 hover:bg-zinc-800 text-zinc-400"><Trash2 className="h-4 w-4"/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
