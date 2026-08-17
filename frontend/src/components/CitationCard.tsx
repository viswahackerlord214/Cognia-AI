import React from 'react';
import { Citation } from '../types';
import { FileText, Layers, Eye } from 'lucide-react';

interface CitationCardProps {
  citations: Citation[];
}

export const CitationCard: React.FC<CitationCardProps> = ({ citations }) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-[#0d1117] border border-[#30363d] rounded-xl space-y-3">
      <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
        <FileText className="w-4 h-4" />
        <span>Verified Source Citations ({citations.length})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {citations.map((c, idx) => (
          <div key={idx} className="p-3 bg-[#161b22] border border-[#30363d] rounded-lg text-xs space-y-1.5 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-white font-medium">
              <span className="truncate max-w-[200px]" title={c.document_name}>📄 {c.document_name}</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px]">
                Page {c.page_number}
              </span>
            </div>
            <p className="text-[#8b949e] italic line-clamp-2">"{c.chunk_text}"</p>
            <div className="flex items-center space-x-3 text-[10px] text-[#8b949e]">
              <span className="flex items-center space-x-1">
                <Layers className="w-3 h-3 text-blue-400" />
                <span className="capitalize">{c.document_type}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="w-3 h-3 text-purple-400" />
                <span className="capitalize">{c.visibility}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
