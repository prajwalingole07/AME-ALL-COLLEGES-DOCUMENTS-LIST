export const metadata = { title: "Disclaimer — Maharashtra Admission 2026–27" };
export default function Disclaimer(){
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-extrabold">Disclaimer</h1>
      <div className="mt-4 rounded-2xl border bg-zinc-900 p-6 text-sm leading-relaxed text-zinc-300 space-y-3">
        <p className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-900 font-medium">This website organizes information extracted from college documents provided in the dataset. Information may change and may contain extraction errors. Students should verify fees, admission procedures, deadlines, eligibility, and required documents with the respective college and official admission authorities before completing admission or making any payment.</p>
        <p>This website is an informational tool and is not an official website of any college or admission authority unless explicitly stated.</p>
        <p>Fee totals marked “Calculated” are derived from components found in the source PDF. Missing ≠ ₹0. “Not Available” means the document was not present in the provided ZIP.</p>
        <p>Source PDFs remain available for verification on every college page.</p>
      </div>
    </div>
  );
}
