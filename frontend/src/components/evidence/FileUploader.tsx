import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';

export interface FileUploaderProps {
  onFileSelect?: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
  acceptedFormats?: string;
  maxSizeMB?: number;
  multiple?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  onFilesSelect,
  acceptedFormats = '.png, .jpg, .jpeg, .pdf, .txt, .csv, .json',
  maxSizeMB = 25,
  multiple = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incomingFiles: FileList | File[]) => {
    const valid = Array.from(incomingFiles).filter(f => f.size <= maxSizeMB * 1024 * 1024);
    if (!valid.length) return;

    if (multiple) {
      setSelectedFiles(prev => {
        // Deduplicate by name and size
        const combined = [...prev];
        for (const file of valid) {
          if (!combined.some(c => c.name === file.name && c.size === file.size)) {
            combined.push(file);
          }
        }
        if (onFilesSelect) {
          onFilesSelect(combined);
        } else if (onFileSelect && combined[0]) {
          onFileSelect(combined[0]);
        }
        return combined;
      });
    } else {
      setSelectedFiles([valid[0]]);
      if (onFileSelect) onFileSelect(valid[0]);
      if (onFilesSelect) onFilesSelect([valid[0]]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleRemoveFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    if (onFilesSelect) onFilesSelect(updated);
    if (onFileSelect) onFileSelect(updated[0] || null as any);
    if (fileInputRef.current && updated.length === 0) fileInputRef.current.value = '';
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFiles([]);
    if (onFilesSelect) onFilesSelect([]);
    if (onFileSelect) onFileSelect(null as any);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const totalSizeMB = (selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2);

  return (
    <div className="w-full flex flex-col gap-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full p-6 rounded-[4px] border-2 border-dashed transition-all duration-150 cursor-pointer flex flex-col items-center justify-center text-center ${
          isDragging
            ? 'bg-[var(--info-bg)] border-[var(--primary)]'
            : selectedFiles.length > 0
              ? 'bg-[var(--surface-secondary)] border-[var(--primary)]/60'
              : 'bg-[var(--surface-secondary)] border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--primary)]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-[6px] bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[28px]">
              {selectedFiles.length > 0 ? 'collections' : 'upload_file'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[14px] font-bold text-[var(--text-primary)]">
              {multiple ? 'Upload Single or Multiple Evidence Files' : 'Upload Evidence File'}
            </span>
            <span className="text-[12px] text-[var(--text-secondary)] mt-0.5">
              Drag & drop multiple images/files here, or click to browse
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">
            PNG, JPG, JPEG, PDF, TXT (Up to {maxSizeMB}MB each)
          </span>
          <Button variant="secondary" size="sm" className="mt-1 pointer-events-none">
            Choose Files
          </Button>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-col gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] p-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[var(--text-primary)]">
                Selected Evidence ({selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} • {totalSizeMB} MB)
              </span>
              <span className="text-[11px] bg-[var(--info-bg)] text-[var(--info)] border border-[var(--info-border)] px-1.5 py-0.2 rounded font-semibold">
                Multi-Evidence Correlated
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="text-[11px] font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">add</span> Add More
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-bold text-[var(--danger)] hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-[var(--border)] space-y-1">
            {selectedFiles.map((file, idx) => (
              <div key={`${file.name}-${idx}`} className="pt-1.5 pb-1 flex items-center justify-between text-left">
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                  <span className="material-symbols-outlined text-[18px] text-[var(--primary)] shrink-0">
                    {file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'picture_as_pdf' : 'description'}
                  </span>
                  <div className="truncate">
                    <p className="text-[12px] font-semibold text-[var(--text-primary)] truncate">{file.name}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                      {(file.size / 1024).toFixed(1)} KB • {file.type || 'Document'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleRemoveFile(idx, e)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--surface-hover)] rounded-[4px] transition-colors cursor-pointer"
                  title="Remove file"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cryptographic Assurance */}
      <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] bg-[var(--surface-secondary)] border border-[var(--border)] p-2.5 rounded-[4px] transition-colors">
        <span className="material-symbols-outlined text-[16px] text-[var(--primary)]">lock</span>
        <span>Original file integrity is sealed with SHA-256 cryptographic hashing immediately upon upload.</span>
      </div>
    </div>
  );
};
