import React from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { FileData } from '../types';
import { fileToBase64, createPreviewUrl } from '../services/fileUtils';

interface FileUploaderProps {
  label: string;
  description: string;
  fileData: FileData | null;
  onFileChange: (data: FileData | null) => void;
  color: 'blue' | 'purple' | 'emerald';
}

const FileUploader: React.FC<FileUploaderProps> = ({ label, description, fileData, onFileChange, color }) => {
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        const previewUrl = createPreviewUrl(file);
        onFileChange({ 
          file, 
          base64, 
          previewUrl,
          mimeType: file.type 
        });
      } catch (err) {
        console.error("Error processing file", err);
      }
    }
  };

  const clearFile = () => {
    onFileChange(null);
  };

  const colorClasses = {
    blue: "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100",
    purple: "border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100",
    emerald: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  };

  const iconColors = {
    blue: "text-blue-500",
    purple: "text-purple-500",
    emerald: "text-emerald-500",
  };

  const isPdf = fileData?.mimeType === 'application/pdf';

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      
      {!fileData ? (
        <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${colorClasses[color]} flex flex-col items-center justify-center text-center cursor-pointer group`}>
          <input 
            type="file" 
            accept="image/*,application/pdf" 
            onChange={handleFileSelect} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className={`p-3 rounded-full bg-white shadow-sm mb-3 group-hover:scale-110 transition-transform`}>
            <Upload className={`w-6 h-6 ${iconColors[color]}`} />
          </div>
          <p className="font-semibold text-sm">Click to upload (PDF/Image)</p>
          <p className="text-xs opacity-70 mt-1">{description}</p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white flex items-center p-3">
          <div className="w-12 h-12 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden mr-4 flex items-center justify-center">
             {isPdf ? (
               <FileText className="w-6 h-6 text-red-500" />
             ) : (
               <img src={fileData.previewUrl} alt="Preview" className="w-full h-full object-cover" />
             )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{fileData.file.name}</p>
            <p className="text-xs text-slate-500">{(fileData.file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button 
            onClick={clearFile}
            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;