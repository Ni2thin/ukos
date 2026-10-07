import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { 
  Upload, 
  File, 
  Trash2, 
  Download, 
  Eye, 
  ShieldCheck, 
  HardDrive 
} from 'lucide-react';
import { VaultDocument } from '@/lib/mockData';

interface DocumentVaultProps {
  documents: VaultDocument[];
  onUploadDocument: (name: string, category: VaultDocument['category'], size: string, dataUrl?: string) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documents,
  onUploadDocument,
  onDeleteDocument,
}) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docCategory, setDocCategory] = useState<VaultDocument['category']>('Passport');
  
  // File states
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const categories: VaultDocument['category'][] = [
    'Passport', 'Visa', 'CAS', 'Loan Letter', 'Insurance', 'University Documents', 'Other'
  ];

  // Convert bytes to readable string
  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileObject(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileObject) return;

    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(fileObject.type) || fileObject.size > 10 * 1024 * 1024) {
      alert('Choose a PDF, JPG or PNG file no larger than 10MB.');
      return;
    }
    setIsUploading(true);

    // Read file as Base64 Data URL
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      const sizeStr = formatBytes(fileObject.size);
      
      try {
        await onUploadDocument(
          fileObject.name,
          docCategory,
          sizeStr,
          base64Data
        );
        setFileObject(null);
        setIsUploadOpen(false);
      } catch (error) {
        console.error('Document save failed:', error);
        alert('Document could not be saved. Browser storage may be full.');
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = (err) => {
      console.error('File reading failed:', err);
      setIsUploading(false);
    };

    reader.readAsDataURL(fileObject);
  };

  const handleDownload = (doc: VaultDocument) => {
    if (!doc.fileData) {
      alert("This document is seed data. Upload a personal document to enable live download capabilities!");
      return;
    }
    
    // Create a temporary link to download base64 content
    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (doc: VaultDocument) => {
    if (!doc.fileData) {
      alert("This document is seed data. Upload a personal document to view a live preview!");
      return;
    }
    
    // Open Base64 in a new browser tab/window
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(
        `<iframe src="${doc.fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
    }
  };

  const filteredDocs = documents.filter(d => 
    selectedFilter === 'All' || d.category === selectedFilter
  );

  return (
    <Card className="h-full select-none">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Document Vault</CardTitle>
          <p className="text-xs text-zinc-500 mt-1">Documents saved in browser storage; not encrypted</p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/10"
        >
          <Upload className="h-3.5 w-3.5" /> Upload File
        </button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Security badge and stats row */}
        <div className="flex flex-wrap justify-between items-center gap-2 p-3 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4.5 w-4.5" />
            <span className="text-xs font-bold text-zinc-900 dark:text-white">Local Storage Sandboxed</span>
          </div>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1">
            <HardDrive className="h-3 w-3" /> {documents.length} Files Saved
          </span>
        </div>

        {/* Filter categories tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 select-none scrollbar-thin scrollbar-thumb-zinc-850">
          <button
            onClick={() => setSelectedFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors whitespace-nowrap ${
              selectedFilter === 'All'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/10'
            }`}
          >
            All Vault Files
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors whitespace-nowrap ${
                selectedFilter === c
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Documents list */}
        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {filteredDocs.length === 0 ? (
            <div className="text-center text-xs text-zinc-500 py-10">No documents found in this category.</div>
          ) : (
            filteredDocs.map((doc) => (
              <div 
                key={doc.id} 
                className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 group hover:border-indigo-500/20 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-lg text-zinc-500 dark:text-zinc-400">
                    <File className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white block truncate max-w-[140px] sm:max-w-[220px]">
                      {doc.name}{!doc.fileData && ' (sample)'}
                    </span>
                    <div className="flex gap-2 items-center mt-0.5 text-[9px] text-zinc-500 dark:text-zinc-400">
                      <span>{doc.category}</span>
                      <span>•</span>
                      <span>{doc.fileSize}</span>
                      <span>•</span>
                      <span>{doc.uploadDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handlePreview(doc)}
                    className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                    title="View file"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Delete file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* MODAL: Upload File */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Document to Vault">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Document Category</label>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value as any)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl py-2.5 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">File Attachment</label>
            <div className="relative border-2 border-dashed border-zinc-250 dark:border-white/10 rounded-2xl p-6 text-center hover:border-indigo-500/30 transition-colors">
              <input
                type="file"
                required
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <Upload className="h-8 w-8 text-zinc-400 dark:text-zinc-500 mx-auto" />
                <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {fileObject ? fileObject.name : 'Click to select a file'}
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {fileObject ? `File Size: ${formatBytes(fileObject.size)}` : 'Supports PDF, JPG, PNG up to 10MB; browser storage capacity varies'}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!fileObject || isUploading}
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm disabled:opacity-50"
            >
              {isUploading ? 'Saving...' : 'Save to Vault'}
            </button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
