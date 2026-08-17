import React, { useState, useEffect } from 'react';
import { docApi } from '../../services/api';
import { Document } from '../../types';
import { FileText, Upload, Trash2, CheckCircle, RefreshCw } from 'lucide-react';

export const DocumentManagement: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('circular');
  const [department, setDepartment] = useState('ALL');
  const [course, setCourse] = useState('ALL');
  const [semester, setSemester] = useState(0);
  const [visibility, setVisibility] = useState('everyone');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchDocs = async () => {
    try {
      const res = await docApi.listDocuments();
      setDocuments(res.documents || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Select a PDF file to upload.');

    setLoading(true);
    setMsg('Extracting text via PyMuPDF -> Embedding -> Indexing ChromaDB...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('doc_type', docType);
      formData.append('department', department);
      formData.append('course', course);
      formData.append('semester', semester.toString());
      formData.append('visibility', visibility);

      const res = await docApi.uploadDocument(formData);
      setMsg(res.message);
      setFile(null);
      setTitle('');
      await fetchDocs();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document and purge vector chunks from ChromaDB?')) return;
    try {
      await docApi.deleteDocument(docId);
      await fetchDocs();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FileText className="w-6 h-6 text-blue-400" />
          <span>Official Document Ingestion & Versioning</span>
        </h1>
        <p className="text-xs text-[#8b949e]">Upload PDFs, attach metadata, and manage vector collection persistence.</p>
      </div>

      {/* Upload Form */}
      <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Upload New Document</h2>
        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#8b949e] font-semibold mb-1">PDF File</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-[#8b949e] font-semibold mb-1">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mid-Sem Schedule 2026"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-[#8b949e] font-semibold mb-1">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-white"
              >
                <option value="circular">Circular</option>
                <option value="curriculum">Curriculum</option>
                <option value="pyq">PYQ Paper</option>
                <option value="academic_calendar">Academic Calendar</option>
                <option value="regulation">Regulation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#8b949e] font-semibold mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-white"
              >
                <option value="ALL">ALL Departments</option>
                <option value="CS">CS</option>
                <option value="EC">EC</option>
              </select>
            </div>
            <div>
              <label className="block text-[#8b949e] font-semibold mb-1">Course Code</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-white"
              >
                <option value="ALL">ALL Courses</option>
                <option value="CS501">CS501</option>
                <option value="CS502">CS502</option>
              </select>
            </div>
            <div>
              <label className="block text-[#8b949e] font-semibold mb-1">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-white"
              >
                <option value="everyone">Everyone (Public)</option>
                <option value="students">Students & Faculty</option>
                <option value="teachers">Faculty Only</option>
                <option value="department">Department Wide</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{loading ? 'Indexing into ChromaDB...' : 'Process & Index PDF'}</span>
          </button>
        </form>
        {msg && <p className="text-xs text-emerald-400 font-medium">{msg}</p>}
      </div>

      {/* Document List */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Indexed Document Registry</h2>
        <div className="space-y-3">
          {documents.map((d) => (
            <div key={d.id} className="p-4 bg-[#0d1117] border border-[#30363d] rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white text-sm">{d.title} (v{d.version})</p>
                <p className="text-[#8b949e]">
                  File: <code className="text-blue-400">{d.filename}</code> | Type: <span className="capitalize">{d.document_type}</span> | Visibility: <span className="text-amber-400 uppercase font-semibold">{d.visibility}</span>
                </p>
              </div>
              <button
                onClick={() => handleDelete(d.id)}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg"
                title="Delete & Purge Vector Chunks"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
