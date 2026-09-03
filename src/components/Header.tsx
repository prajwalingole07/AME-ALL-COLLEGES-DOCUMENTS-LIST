"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, GraduationCap, Search, ShieldCheck, Info, Plus } from "lucide-react";

export default function Header(){
  const [open,setOpen]=useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-[#0a0a0f]/70 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0a0a0f]/60">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src="/logo.png" alt="Admissions Made Easy Latur" className="h-9 w-9 rounded-xl object-contain bg-white p-1 shadow shadow-black/20"/>
            <div className="leading-tight hidden sm:block">
              <div className="text-sm font-bold tracking-tight text-white">ADMISSIONS MADE EASY, LATUR</div>
              <div className="text-xs font-medium text-zinc-500">Maharashtra Engineering Admission 2026–27</div>
            </div>
            <div className="sm:hidden leading-tight">
              <div className="text-sm font-bold text-white">ADMISSIONS MADE EASY</div>
              <div className="text-xs font-medium text-zinc-500">LATUR</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link href="/" className="rounded-full px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white">Home</Link>
            <Link href="/colleges" className="rounded-full px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white">Colleges</Link>
            <Link href="/admin" className="rounded-full px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white">Admin</Link>
            <Link href="/about" className="rounded-full px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white">About</Link>
            <Link href="/disclaimer" className="rounded-full px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white">Disclaimer</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/add-college" className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow shadow-indigo-900/30 hover:shadow-indigo-800/40">
              <Plus className="h-4 w-4"/> Add College
            </Link>
            <Link href="/add-college" className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
              <Plus className="h-5 w-5"/>
            </Link>
            <button onClick={()=>setOpen(v=>!v)} aria-label="Toggle menu" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-white lg:hidden">
              {open? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="border-t border-zinc-800/50 bg-[#0a0a0f] lg:hidden">
          <nav className="mx-auto max-w-[1400px] px-4 py-3 flex flex-col gap-1">
            <Link onClick={()=>setOpen(false)} href="/" className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-zinc-900 text-zinc-300 flex items-center gap-2"><Search className="h-4 w-4"/> Home</Link>
            <Link onClick={()=>setOpen(false)} href="/colleges" className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-zinc-900 text-zinc-300 flex items-center gap-2"><GraduationCap className="h-4 w-4"/> Colleges</Link>
            <Link onClick={()=>setOpen(false)} href="/add-college" className="rounded-xl px-3 py-3 text-sm font-bold bg-indigo-600 text-white flex items-center gap-2"><Plus className="h-4 w-4"/> Add / Import College</Link>
            <Link onClick={()=>setOpen(false)} href="/about" className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-zinc-900 text-zinc-300 flex items-center gap-2"><Info className="h-4 w-4"/> About</Link>
            <Link onClick={()=>setOpen(false)} href="/disclaimer" className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-zinc-900 text-zinc-300 flex items-center gap-2"><ShieldCheck className="h-4 w-4"/> Disclaimer</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
