import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  File, 
  FileText, 
  Image, 
  Video, 
  AudioLines, 
  X, 
  AlertCircle,
  FileAudio,
  FileVideo,
  FileImage
} from "lucide-react";
import { toast } from 'react-toastify';

export default function FilePreview({ files = [], onRemove, maxFiles = 5, maxSize = 25 }) {
  // Format file size to human-readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get appropriate icon based on file type
  const getFileIcon = (file) => {
    const type = file.type || '';
    const name = file.name || '';
    
    if (type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
      return <FileImage className="w-6 h-6 text-indigo-600" />;
    }
    if (type.startsWith('video/') || name.match(/\.(mp4|avi|mov|wmv|flv|mkv)$/i)) {
      return <FileVideo className="w-6 h-6 text-rose-600" />;
    }
    if (type.startsWith('audio/') || name.match(/\.(mp3|wav|ogg|flac|aac)$/i)) {
      return <FileAudio className="w-6 h-6 text-amber-600" />;
    }
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      return <FileText className="w-6 h-6 text-red-600" />;
    }
    if (type.startsWith('application/') || name.match(/\.(doc|docx|xls|xlsx|ppt|pptx|zip|rar)$/i)) {
      return <FileText className="w-6 h-6 text-blue-600" />;
    }
    return <File className="w-6 h-6 text-gray-500" />;
  };

  // Check if file exceeds size limit
  const isFileSizeExceeded = (file) => {
    return file.size > maxSize * 1024 * 1024;
  };

  // Handle file removal with confirmation for large files
  const handleRemove = (index) => {
    const file = files[index];
    
    // Confirm before removing large files
    if (file.size > 10 * 1024 * 1024 && !window.confirm(`Remove "${file.name}"? This is a large file (${formatFileSize(file.size)}).`)) {
      return;
    }
    
    onRemove?.(index);
    toast.info(`Removed: ${file.name}`, {
      position: "top-center",
      autoClose: 2000,
      theme: "colored"
    });
  };

  if (!files?.length) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            <File className="w-4 h-4 text-indigo-700" />
          </div>
          <h3 className="font-semibold text-gray-800">Selected Files</h3>
        </div>
        <span className="text-xs text-gray-500">
          {files.length} of {maxFiles} files
        </span>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {files.map((file, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                isFileSizeExceeded(file)
                  ? 'border-rose-200 bg-rose-50/50'
                  : 'border-gray-100 bg-gray-50/50 hover:bg-indigo-50/30'
              } transition-all group`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                  {getFileIcon(file)}
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-gray-800 truncate" title={file.name}>
                      {file.name}
                    </p>
                    {isFileSizeExceeded(file) && (
                      <div className="flex-shrink-0 ml-2">
                        <div 
                          className="flex items-center gap-1 text-rose-600 text-xs bg-rose-100 px-1.5 py-0.5 rounded-full"
                          title={`File exceeds ${maxSize}MB limit`}
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>{maxSize}MB limit</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className={`font-medium ${
                      isFileSizeExceeded(file) ? 'text-rose-600' : 'text-indigo-600'
                    }`}>
                      {formatFileSize(file.size)}
                    </span>
                    <span className="text-gray-500">
                      {file.type.split('/')[0] || 'Unknown type'}
                    </span>
                  </div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRemove(index)}
                className="ml-3 p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* File limit warning */}
      {files.length >= maxFiles && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Maximum {maxFiles} files allowed. Remove some files to add more.</span>
        </div>
      )}
      
      {/* Size limit notice */}
      <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800">
        <div className="flex items-center gap-1.5">
          <span>ⓘ</span>
          <span>Maximum file size: {maxSize}MB per file</span>
        </div>
      </div>
    </motion.div>
  );
}