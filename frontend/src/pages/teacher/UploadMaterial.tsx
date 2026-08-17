import React, { useState, useEffect } from 'react';
import { docApi } from '../../services/api';
import { Document } from '../../types';
import { Upload, FileText, Trash2, Lock } from 'lucide-react';

export const UploadMaterial: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('lecture_notes');
  const [course, setCourse] = useState('CS501');
  const [semester, setSemester] = useState(5);
  const [visibility, setVisibility] = useState('course_students');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchMyDocs = async () => {
    try {
      const res = await docApi.listDocuments();
      setDocuments(res.documents || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyDocs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select a PDF file.');
    setLoading(true);
    setMsg('Extracting PyMuPDF pages -> Attaching RBAC metadata -> Indexing into ChromaDB...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('doc_type', docType);
      formData.append('course', course);
      formData.append('semester', semester.toString());
      formData.append('visibility', visibility);

      const res = await docApi.uploadDocument(formData);
      setMsg(res.message);
      setFile(null);
      setTitle('');
      await fetchMyDocs();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Purge document and vector chunks from ChromaDB?')) return;
    try {
      await docApi.deleteDocument(id);
      await fetchMyDocs();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Upload className="w-6 h-6 text-indigo-400" />
          <span>Upload Course Material</span>
        </h1>
        <p className="text-xs text-[#8b949e]">Upload lecture notes, assignments, or question banks with granular access visibility settings.</p>
      </div>

      <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#8b949e] font-semibold mb-1">Select PDF File</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-[#8b949e] font-semibold mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="DBMS Normalization Chapter 3"
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
                <option value="lecture_notes">Lecture Notes</option>
                <option value="assignment">Assignment</option>
                <option value="pyq">Question Bank</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#8b949e] font-semibold mb-1">Course Code</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-white"
              >
                <option value="CS501">CS501</option>
                <option value="CS502">CS502</option>
              </select>
            </div>
            <div>
              <label className="block text-[#8b949e] font-semibold mb-1">Semester</label>
              <input
                type="number"
                min={1}
                max={8}
                value={semester}
                onChange={(e) => setSemester(parseInt(e.target.value) || 5)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-[#8b949e] font-semibold mb-1">Access Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-white"
              >
                <option value="course_students">Course Students (Shared)</option>
                <option value="owner_only">Owner Only (Private Notes)</option>
                <option value="department">Department Wide</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{loading ? 'Indexing...' : 'Index Course Material'}</span>
          </button>
        </form>
        {msg && <p className="text-xs text-emerald-400">{msg}</p>}
      </div>

      {/* Document List */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">My Course Documents</h2>
        <div className="space-y-3">
          {documents.map((d) => (
            <div key={d.id} className="p-4 bg-[#0d1117] border border-[#30363d] rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white text-sm">{d.title}</p>
                <p className="text-[#8b949e]">
                  Course: {d.course} | Visibility: <span className="text-amber-400 font-semibold uppercase">{d.visibility}</span>
                </p>
              </div>
              <button
                onClick={() => handleDelete(d.id)}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg"
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
