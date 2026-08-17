import React, { useEffect, useState } from 'react';
import { docApi } from '../../services/api';
import { Document } from '../../types';
import { BookOpen, FileText, Download, Eye, Layers } from 'lucide-react';

export const StudyMaterials: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const res = await docApi.listDocuments();
        setDocuments(res.documents || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          <span>Course Study Materials & Lecture Notes</span>
        </h1>
        <p className="text-xs text-[#8b949e]">
          Browse, read, and download official study materials uploaded by course faculty.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-[#8b949e]">Loading study materials...</div>
      ) : documents.length === 0 ? (
        <div className="p-8 bg-[#161b22] border border-[#30363d] rounded-2xl text-center text-xs text-[#8b949e]">
          No study materials uploaded for your course yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((d) => (
            <div
              key={d.id}
              className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl hover:border-indigo-500/50 transition-all space-y-3 text-xs"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase font-semibold text-[10px]">
                    {d.document_type || 'Lecture Notes'}
                  </span>
                  <h3 className="font-bold text-white text-sm">{d.title}</h3>
                </div>
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>

              <p className="text-[#8b949e] text-[11px]">
                Uploaded by: <strong className="text-white">{d.uploaded_by || 'Faculty'}</strong> | Course: <strong className="text-white">{d.course}</strong>
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#30363d] text-[10px] text-[#8b949e]">
                <span className="flex items-center space-x-1">
                  <Layers className="w-3 h-3 text-blue-400" />
                  <span>Sem {d.semester || 5}</span>
                </span>

                <button
                  onClick={() => alert(`Opening '${d.title}' in viewer mode.`)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center space-x-1 transition-colors text-[11px]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Material</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
