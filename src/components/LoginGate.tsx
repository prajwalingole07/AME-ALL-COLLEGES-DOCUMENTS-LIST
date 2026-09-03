"use client";
import { useState, useEffect } from "react";
import { isAuthenticated, login, logout } from "@/lib/auth";
import { Lock, LogOut, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function LoginGate({ children, onAuthChange }: { children: React.ReactNode, onAuthChange?: (v:boolean)=>void }) {
  const [authed, setAuthed] = useState(false);
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setAuthed(isAuthenticated());
    const h = () => {
      const v = isAuthenticated();
      setAuthed(v);
      onAuthChange?.(v);
    };
    window.addEventListener("auth-changed", h);
    window.addEventListener("storage", h);
    return () => { window.removeEventListener("auth-changed", h); window.removeEventListener("storage", h); };
  }, [onAuthChange]);

  const handleLogin = () => {
    setErr("");
    if (login(id.trim(), pass)) {
      setAuthed(true);
      onAuthChange?.(true);
    } else {
      setErr("Invalid ID or Password. Please contact administrator.");
    }
  };

  if (authed) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs sm:text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-800"><ShieldCheck className="h-4 w-4"/> Admin verified — Import unlocked</span>
          <button onClick={() => { logout(); setAuthed(false); onAuthChange?.(false); setId(""); setPass(""); }} className="inline-flex items-center gap-1 rounded-full border bg-zinc-900 px-3 py-1 text-xs font-semibold hover:bg-zinc-900">
            <LogOut className="h-3.5 w-3.5"/> Logout
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-zinc-900 p-5 sm:p-6 shadow-sm">
      <div className="mx-auto max-w-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white mx-auto">
          <Lock className="h-6 w-6"/>
        </div>
        <h2 className="mt-3 text-center text-lg font-extrabold">Admin Login Required</h2>
        <p className="mt-1 text-center text-sm text-zinc-400">Enter credentials to unlock <b>Add / Import College</b>. Only verified admin can add colleges.</p>

        <form onSubmit={(e)=>{e.preventDefault(); handleLogin();}} className="mt-5 space-y-3">
          <div>
            <label className="text-sm font-semibold text-white">Admin ID</label>
            <input value={id} onChange={e=>setId(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault(); handleLogin();}}} placeholder="Enter Admin ID" className="mt-1 w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"/>
          </div>
          <div>
            <label className="text-sm font-semibold text-white">Password</label>
            <div className="relative mt-1">
              <input type={show? "text":"password"} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault(); handleLogin();}}} placeholder="Enter Password" className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 pr-10 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"/>
              <button type="button" onClick={()=>setShow(v=>!v)} aria-label={show? "Hide password":"Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700">
                {show? <><EyeOff className="h-4 w-4"/> Hide</> : <><Eye className="h-4 w-4"/> Show</>}
              </button>
            </div>
          </div>
          {err && <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{err}</div>}
          <button type="submit" className="w-full rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white shadow hover:shadow-md">Verify & Unlock Import</button>
          <p className="text-center text-xs text-zinc-500">Contact administrator for credentials.</p>
        </form>
      </div>
    </div>
  );
}
