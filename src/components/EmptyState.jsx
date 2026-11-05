import { SearchX } from "lucide-react";

export default function EmptyState({ onClear }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-slate-100 p-4 rounded-full mb-4">
        <SearchX size={32} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">No pros found in this area</h3>
      <p className="text-slate-500 text-sm max-w-xs mb-6">
        We couldn't find anyone matching your filters. Try a nearby estate or a different service.
      </p>
      <button 
        onClick={onClear}
        className="text-brand-600 font-medium text-sm hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );
}