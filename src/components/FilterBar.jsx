import { Search, Wrench, Zap, Sparkles, Hammer, WashingMachine, Snowflake } from "lucide-react";
import { getManagedCategories, getManagedNeighborhoods } from "../lib/demoStore";

const iconMap = { Wrench, Zap, Sparkles, Hammer, WashingMachine, Snowflake };

export default function FilterBar({ 
  search, setSearch, 
  category, setCategory, 
  neighborhood, setNeighborhood 
}) {
  const categories = getManagedCategories();
  const neighborhoods = getManagedNeighborhoods();

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search for a service (e.g. leaking pipe)..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white shadow-sm"
        />
      </div>

      {/* Category Pills - Horizontally Scrollable on Mobile */}
      <div className="flex overflow-x-auto pb-2 gap-2 snap-x [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setCategory("all")}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors snap-start ${
            category === "all" ? "bg-brand-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Services
        </button>
        {categories.map((c) => {
          const Icon = iconMap[c.icon];
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors snap-start ${
                category === c.id ? "bg-brand-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {Icon && <Icon size={16} />}
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Neighborhood Dropdown */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">Estate:</label>
        <select
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5"
        >
          <option value="all">All Neighborhoods</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
    </div>
  );
}