'use client';

import React, { useRef, useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon, DocumentIcon, EyeIcon, ChevronDownIcon, ComputerDesktopIcon, FolderIcon, CloudIcon } from '@heroicons/react/24/outline';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: Date;
}

interface UploadFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadedFiles: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
  onUploadFiles: (files: File[]) => void;
}

export default function UploadFilesModal({ 
  isOpen, 
  onClose, 
  uploadedFiles, 
  onRemoveFile, 
  onUploadFiles 
}: UploadFilesModalProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && fileInputRef.current) {
      console.log('Modal opened, file input found in DOM');
      console.log('File input element:', fileInputRef.current);
      console.log('File input type:', fileInputRef.current.type);
      console.log('File input accept:', fileInputRef.current.accept);
    } else if (isOpen) {
      console.log('Modal opened but file input not found in DOM');
    }
  }, [isOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      console.log('handleFileSelect called');
      console.log('Event target:', event.target);
      console.log('Event target files:', event.target.files);
      console.log('onUploadFiles prop:', onUploadFiles);
      
      const files = event.target.files;
      if (files) {
        console.log('Files selected:', Array.from(files));
        
        if (typeof onUploadFiles === 'function') {
          onUploadFiles(Array.from(files));
          console.log('onUploadFiles called successfully');
        } else {
          console.error('onUploadFiles is not a function:', onUploadFiles);
        }
        
        // Reset the input value so the same file can be selected again
        event.target.value = '';
        console.log('File input value reset');
      } else {
        console.log('No files selected');
      }
    } catch (error) {
      console.error('Error in handleFileSelect:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    try {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      console.log('Files dropped:', files);
      
      if (typeof onUploadFiles === 'function') {
        onUploadFiles(files);
        console.log('onUploadFiles called from drag and drop');
      } else {
        console.error('onUploadFiles is not a function in drag and drop');
      }
    } catch (error) {
      console.error('Error in handleDrop:', error);
    }
  };

  const openFileInput = () => {
    try {
      console.log('openFileInput called');
      console.log('fileInputRef.current:', fileInputRef.current);
      if (fileInputRef.current) {
        console.log('Attempting to click file input');
        fileInputRef.current.click();
        console.log('File input clicked successfully');
        
        // Add a fallback: if the click doesn't work, create a temporary visible input
        setTimeout(() => {
          if (!fileInputRef.current?.files?.length) {
            console.log('File input click may not have worked, creating temporary input');
            const tempInput = document.createElement('input');
            tempInput.type = 'file';
            tempInput.multiple = true;
            tempInput.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif';
            tempInput.style.position = 'fixed';
            tempInput.style.top = '50%';
            tempInput.style.left = '50%';
            tempInput.style.transform = 'translate(-50%, -50%)';
            tempInput.style.zIndex = '9999';
            
            tempInput.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              if (target.files) {
                handleFileSelect({ target } as React.ChangeEvent<HTMLInputElement>);
              }
              document.body.removeChild(tempInput);
            };
            
            document.body.appendChild(tempInput);
            tempInput.click();
          }
        }, 100);
      } else {
        console.error('fileInputRef.current is null or undefined');
      }
    } catch (error) {
      console.error('Error in openFileInput:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-gray-900">File Management</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">ss2 Features</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
            onChange={handleFileSelect}
            className="absolute -left-[9999px] -top-[9999px] opacity-0 pointer-events-none"
            style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
          />

          {/* Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              {/* Blue arrow icon */}
              <svg
                className="w-8 h-8 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>

              <span className="text-lg font-medium text-gray-700">Upload your Files</span>

              {/* Chevron down icon */}
              <button
                onClick={() => setShowUploadOptions(!showUploadOptions)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${showUploadOptions ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* ss2 text below the blue arrow */}
            <div className="text-sm text-blue-600 font-medium mb-4">ss2 Advanced File Management</div>
            
            <p className="text-sm text-gray-600 mb-4">Drag and drop files here or click to browse</p>
            
            {/* Main Choose Files button */}
            <button 
              onClick={() => {
                console.log('Choose Files button clicked');
                alert('Button clicked! Testing functionality...');
                openFileInput();
              }}
              className="px-6 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              type="button"
            >
              Choose Files
            </button>

            {/* Debug button */}
            <button 
              onClick={() => {
                console.log('Debug button clicked');
                console.log('fileInputRef.current:', fileInputRef.current);
                if (fileInputRef.current) {
                  console.log('File input properties:', {
                    type: fileInputRef.current.type,
                    accept: fileInputRef.current.accept,
                    multiple: fileInputRef.current.multiple,
                    disabled: fileInputRef.current.disabled
                  });
                }
              }}
              className="ml-2 px-4 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
              type="button"
            >
              Debug
            </button>

            {/* Upload Options Dropdown */}
            {showUploadOptions && (
              <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                <div className="space-y-3">
                  {/* Attach From Desktop */}
                  <button
                    onClick={openFileInput}
                    className="w-full text-left px-4 py-3 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center space-x-3"
                  >
                    <ComputerDesktopIcon className="w-5 h-5" />
                    <span>Attach From Desktop</span>
                  </button>

                  {/* Attach From Documents */}
                  <button
                    onClick={openFileInput}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center space-x-3"
                  >
                    <FolderIcon className="w-5 h-5" />
                    <span>Attach From Documents</span>
                  </button>

                  {/* Attach From Cloud */}
                  <button
                    onClick={openFileInput}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center space-x-3"
                  >
                    <CloudIcon className="w-5 h-5" />
                    <span>Attach From Cloud</span>
                  </button>

                  {/* Cloud Service Icons */}
                  <div className="flex items-center justify-center space-x-4 pt-2 border-t border-gray-200">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">G</div>
                    <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">E</div>
                    <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold">D</div>
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">B</div>
                    <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center text-white text-xs font-bold">D</div>
                    <div className="w-8 h-8 bg-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">O</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upload Limits */}
          <div className="text-center mt-4 mb-6">
            <p className="text-sm text-gray-500">
              You can upload a maximum of 5 files, 10MB each
            </p>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files ({uploadedFiles.length}/5)</h3>
              <div className="grid gap-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <DocumentIcon className="w-8 h-8 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{file.name}</h4>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.type || 'Unknown type'}</span>
                          <span>•</span>
                          <span>Uploaded {formatDate(file.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View file"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveFile(file.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        title="Remove file"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Files Message */}
          {uploadedFiles.length === 0 && (
            <div className="text-center py-8">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No files uploaded</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by uploading your first file.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
