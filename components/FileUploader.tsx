import React, { useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { FileData } from '../types';

interface FileUploaderProps {
  files: FileData[];
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  files, 
  onFilesSelected, 
  onRemoveFile,
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      // Reset input so same file can be selected again if needed
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getIconForType = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200 w-80 flex-shrink-0">
      <div className="p-6 border-b border-zinc-100">
        <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Docs
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          Upload PDFs, text files, or images to generate your agenda.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed border-zinc-200' : 'border-zinc-300 hover:border-zinc-900 hover:bg-zinc-50 cursor-pointer'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={inputRef} 
            onChange={handleInputChange} 
            className="hidden" 
            multiple 
            accept=".pdf,.txt,.md,.png,.jpg,.jpeg,.webp"
          />
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3">
             <Upload className="w-6 h-6 text-zinc-600" />
          </div>
          <p className="text-sm font-medium text-zinc-900">Click to upload</p>
          <p className="text-xs text-zinc-500 mt-1">or drag and drop</p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Uploaded Files</h3>
            {files.map((file) => (
              <div key={file.id} className="group flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center border border-zinc-200 text-zinc-500">
                    {getIconForType(file.type)}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-zinc-700 truncate">{file.name}</p>
                    <p className="text-xs text-zinc-400">Ready</p>
                  </div>
                </div>
                {!disabled && (
                  <button 
                    onClick={() => onRemoveFile(file.id)}
                    className="text-zinc-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
