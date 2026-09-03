export const metadata = { title: "About — Maharashtra Admission 2026–27" };
export default function About(){
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-extrabold">About</h1>
      <div className="mt-4 space-y-4 rounded-2xl border bg-zinc-900 p-6 text-sm leading-relaxed text-zinc-300">
        <p>This website organizes information extracted from college documents provided in the ZIP dataset <code>ALL COLLEGES PDF OF FEES & DOCUMENTS LIST.zip</code> for Maharashtra Engineering Admission 2026–27.</p>
        <p>It extracts fee structures, document checklists, and admission steps from PDFs, displays them category-wise, and keeps original PDFs available for verification.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>55 colleges indexed</li>
          <li>105 PDFs/images copied to <code>public/documents/&lt;college-slug&gt;/</code></li>
          <li>Structured data in <code>data/colleges.json</code> and per-college files in <code>data/colleges/</code></li>
          <li>Update pipeline: add PDFs to <code>downloads_extract</code> and run <code>python extract_colleges.py</code></li>
        </ul>
        <p className="rounded-xl bg-zinc-900 border p-3 text-xs">Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and deployed on Vercel. No database required — static JSON for speed and zero cost.</p>
      </div>
    </div>
  );
}
