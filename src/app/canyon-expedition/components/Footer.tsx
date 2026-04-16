import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-ce-surface-highest bg-ce-surface-lowest">
      <div className="flex flex-col gap-6">
        <div className="text-lg font-headline font-bold text-ce-on-surface">
          APACHE SPRINGS RETREAT
        </div>
        <p className="text-[10px] font-label text-ce-outline leading-relaxed uppercase tracking-widest">
          A technical outpost for elite explorers. <br />
          Built for the high desert.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Link href="/canyon-expedition" className="text-ce-outline hover:text-ce-on-surface transition-colors font-label text-[10px] uppercase tracking-tighter">The Mission</Link>
          <Link href="/canyon-expedition/routes" className="text-ce-outline hover:text-ce-on-surface transition-colors font-label text-[10px] uppercase tracking-tighter">The Routes</Link>
          <Link href="/canyon-expedition/basecamp" className="text-ce-outline hover:text-ce-on-surface transition-colors font-label text-[10px] uppercase tracking-tighter">The Basecamp</Link>
        </div>
        <div className="flex flex-col gap-2">
          <a href="https://apachespringsranch.com" target="_blank" rel="noopener noreferrer" className="text-ce-outline hover:text-ce-on-surface transition-colors font-label text-[10px] uppercase tracking-tighter">The Ranch</a>
          <span className="text-ce-outline font-label text-[10px] uppercase tracking-tighter">Instagram</span>
          <span className="text-ce-outline font-label text-[10px] uppercase tracking-tighter">Signal</span>
        </div>
      </div>
      <div className="flex flex-col md:items-end justify-between">
        <div className="font-label text-[10px] text-ce-outline tracking-tight uppercase">
          © {new Date().getFullYear()} APACHE SPRINGS RETREAT. ALL RIGHTS RESERVED. // 31.6703° N, 110.7410° W
        </div>
      </div>
    </footer>
  );
}
