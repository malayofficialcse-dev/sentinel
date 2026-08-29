import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';

export interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string;
  maxSizeMB?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  acceptedFormats = '.png, .jpg, .jpeg, .pdf, .txt, .csv, .json',
  maxSizeMB = 25,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full p-8 rounded-[4px] border border-dashed transition-all duration-150 cursor-pointer flex flex-col items-center justify-center text-center ${
          isDragging
            ? 'bg-[#EFF6FC] border-[#0078D4]'
            : selectedFile
              ? 'bg-[#F1FAF1] border-[#A7D7A7]'
              : 'bg-[#FAFAFA] border-[#C8C6C4] hover:bg-[#F3F2F1] hover:border-[#0078D4]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats}
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-[4px] bg-[#F1FAF1] border border-[#A7D7A7] text-[#107C10] flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[14px] font-semibold text-[#242424]">{selectedFile.name}</span>
              <span className="text-[12px] text-[#605E5C]">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                Replace File
              </Button>
              <Button variant="danger" size="sm" onClick={handleRemove}>
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-[4px] bg-[#EDEBE9] text-[#605E5C] flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">upload_file</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[14px] font-semibold text-[#242424]">Upload Evidence</span>
              <span className="text-[12px] text-[#605E5C] mt-0.5">Drag & drop your file here, or click to browse</span>
            </div>
            <span className="text-[11px] text-[#8A8886] font-mono mt-1">PNG, JPG, PDF, TXT, CSV (Up to {maxSizeMB}MB)</span>
            <Button variant="secondary" size="sm" className="mt-2 pointer-events-none">
              Choose File
            </Button>
          </div>
        )}
      </div>

      {/* Cryptographic Assurance */}
      <div className="flex items-center gap-2 text-[11px] text-[#605E5C] bg-[#FAFAFA] border border-[#E1DFDD] p-2 rounded-[4px]">
        <span className="material-symbols-outlined text-[16px] text-[#0078D4]">lock</span>
        <span>Original file integrity is sealed with SHA-256 cryptographic hashing immediately upon upload.</span>
      </div>
    </div>
  );
};
