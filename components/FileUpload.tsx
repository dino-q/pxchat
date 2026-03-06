
import React, { useRef } from 'react';

interface FileUploadProps {
  onFileLoad: (content: string, name: string) => void;
  fileName: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad, fileName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileLoad(content, file.name);
      };
      reader.readAsText(file, 'UTF-8');
    }
  };
  
  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-brand-surface rounded-lg shadow-lg p-6">
       <h2 className="text-xl font-semibold text-white mb-4">1. Upload File</h2>
      <div 
        className="border-2 border-dashed border-brand-primary hover:border-brand-secondary rounded-lg p-8 text-center cursor-pointer transition-colors duration-300"
        onClick={handleAreaClick}
      >
        <input
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-brand-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="mt-2 text-brand-text">
          {fileName ? `Loaded: ${fileName}` : 'Click to upload or drag & drop a .txt file'}
        </p>
        <p className="text-xs text-brand-text-secondary mt-1">UTF-8 encoded text files only</p>
      </div>
    </div>
  );
};

export default FileUpload;
   