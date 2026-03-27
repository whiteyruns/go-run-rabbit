export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <p className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-1">Corner Bar Management</p>
        <h1 className="text-3xl font-bold text-white">Sponsorship Opportunity Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">9 Venues &middot; 2,532 Combined Capacity &middot; 40,900 Sq Ft</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-2">Status</p>
          <p className="text-2xl font-bold text-emerald-400">Active</p>
          <p className="text-gray-500 text-xs mt-1">Portal online</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-2">Venues</p>
          <p className="text-2xl font-bold text-white">9</p>
          <p className="text-gray-500 text-xs mt-1">Fremont East + Arts District</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-2">POS Data</p>
          <p className="text-2xl font-bold text-amber-400">Sample</p>
          <p className="text-gray-500 text-xs mt-1">Connect Toast for live data</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-2">Pipeline</p>
          <p className="text-2xl font-bold text-white">0</p>
          <p className="text-gray-500 text-xs mt-1">Active deals</p>
        </div>
      </div>

      <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-6">
        <h3 className="text-amber-400 font-bold text-lg mb-3">Getting Started</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-white font-bold text-sm mb-2">1. Upload POS Data</p>
            <p className="text-gray-400 text-sm">Go to <a href="/dashboard/pos-data" className="text-amber-400 hover:underline">POS Data</a> and upload Toast PMIX exports or load the demo dataset.</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-white font-bold text-sm mb-2">2. Build Pipeline</p>
            <p className="text-gray-400 text-sm">Track sponsor outreach in the <a href="/dashboard/pipeline" className="text-amber-400 hover:underline">Pipeline</a> — brands, categories, deal status.</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-white font-bold text-sm mb-2">3. Create Pitch Links</p>
            <p className="text-gray-400 text-sm">Generate shareable brand-specific pitch pages to send to sponsor reps.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
