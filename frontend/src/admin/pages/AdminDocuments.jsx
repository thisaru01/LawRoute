import React, { useEffect, useState } from "react";
import axios from "@/api/axios";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, CheckCircle, ArrowDown } from "lucide-react";

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchDocs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/documents");
        if (!mounted) return;
        setDocuments(res?.data?.documents || []);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Failed to load documents");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDocs();
    return () => {
      mounted = false;
    };
  }, []);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  return (
    <div>
      <h1 className="text-2xl font-semibold">Documents</h1>
      {/* <p className="mt-2 text-sm text-muted-foreground">Library documents (all uploads).</p> */}

      {loading && <p className="mt-4 text-sm text-muted-foreground">Loading...</p>}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {documents.map((d) => {
          const id = d._id || d.id;
          const time = d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
          const uploadedDate = d.createdAt
            ? new Date(d.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
            : '';
          return (
            <div key={id} className="relative rounded-xl p-4 pt-12 bg-white border border-slate-200 h-48 flex flex-col">
              {/* Blue folder top-left */}
              <div className="absolute -top-4 left-4 w-16 h-16 rounded-lg bg-blue-400 shadow-md flex items-center justify-center">
                <FileText className="h-7 w-7 text-white" />
              </div>

              {/* icon controls top-right */}
              <div className="absolute top-3 right-3 flex items-center gap-3">
                <a href={`${API_BASE}/documents/${id}/download`} target="_blank" rel="noreferrer" className="text-slate-700 hover:text-slate-900" aria-label="Download document">
                  <ArrowDown className="h-5 w-5" />
                </a>

                <button
                  className="text-destructive hover:text-destructive/80"
                  onClick={async () => {
                    if (!confirm('Delete this document?')) return;
                    try {
                      await axios.delete(`/documents/${id}`);
                      setDocuments((prev) => prev.filter((x) => (x._id || x.id) !== id));
                    } catch (err) {
                      alert(err?.message || 'Failed to delete document');
                    }
                  }}
                  aria-label="Delete document"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-2">
                <h3 className="text-lg font-semibold text-slate-900 truncate">{d.title}</h3>
                <div className="mt-1 flex items-center gap-3">
                  <p className="text-sm text-slate-600 truncate">{d.description}</p>
                  <div className="text-xs text-slate-500 whitespace-nowrap">{uploadedDate}</div>
                </div>
              </div>

              <div className="mt-auto text-xs text-slate-300">{time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
