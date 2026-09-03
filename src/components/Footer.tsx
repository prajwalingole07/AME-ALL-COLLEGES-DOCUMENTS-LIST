import Link from "next/link";
export default function Footer(){
  return (
    <footer className="border-t border-zinc-800/50 bg-[#0a0a0f]/50 backdrop-blur">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="font-bold text-white">Engineering Admission 2026–27</div>
            <p className="mt-2 text-sm text-zinc-400">Organizes information extracted from college documents provided in the dataset. Verify fees and procedures with the college and official authorities before payment.</p>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-white">Quick Links</div>
            <div className="mt-2 flex flex-col gap-1">
              <Link href="/" className="text-zinc-400 hover:text-white">Home</Link>
              <Link href="/colleges" className="text-zinc-400 hover:text-white">Colleges</Link>
              <Link href="/about" className="text-zinc-400 hover:text-white">About</Link>
              <Link href="/disclaimer" className="text-zinc-400 hover:text-white">Disclaimer</Link>
            </div>
          </div>
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
            <div className="text-sm font-semibold text-white">Important Notice</div>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">Fee structures, admission procedures, and document requirements are based on available college documents. Students should verify latest information with the college and official admission authorities before making payment.</p>
          </div>
        </div>
        <div className="mt-8 border-t border-zinc-900 pt-6 text-center text-xs text-zinc-600">© 2026 Maharashtra Engineering Admission Helper • Not an official government website</div>
      </div>
    </footer>
  );
}
