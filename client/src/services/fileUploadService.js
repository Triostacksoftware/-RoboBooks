import { apiClient } from "./apiClient";

// File upload service
export const fileUploadService = {
  // Upload a single file
  uploadFile: async (file, options = {}) => {
    try {
      console.log('📁 FileUploadService: Starting upload for file:', file.name);
      const formData = new FormData();
      formData.append('file', file);
      
      // Add any additional options
      if (options.expenseId) {
        formData.append('expenseId', options.expenseId);
      }
      if (options.category) {
        formData.append('category', options.category);
      }

      console.log('📁 FileUploadService: FormData created, making API call');
      const response = await apiClient.post('/api/expenses/upload', formData, {
        headers: {
          // Don't set Content-Type manually - let the browser set it with proper boundary
        },
        onUploadProgress: (progressEvent) => {
          if (options.onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            options.onProgress(percentCompleted);
          }
        },
      });

      console.log('📁 FileUploadService: Upload successful:', response.data);
      return response.data;
    } catch (error) {
      console.error("❌ FileUploadService: Upload failed:", error);
      throw error;
    }
  },

  // Upload multiple files
  uploadMultipleFiles: async (files, options = {}) => {
    try {
      const uploadPromises = files.map(file => 
        fileUploadService.uploadFile(file, options)
      );
      
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error("Multiple file upload failed:", error);
      throw error;
    }
  },

  // Get file URL for preview
  getFileUrl: (fileId) => {
    return `/api/expenses/files/${fileId}`;
  },

  // Delete uploaded file
  deleteFile: async (fileId) => {
    try {
      const response = await apiClient.delete(`/api/expenses/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error("File deletion failed:", error);
      throw error;
    }
  },

  // Validate file before upload
  validateFile: (file, maxSize = 10 * 1024 * 1024) => { // 10MB default
    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not supported. Please upload images, PDFs, or documents.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file icon based on type
  getFileIcon: (fileType) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return '📝';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return '📊';
    } else {
      return '📎';
    }
  }
};

export default fileUploadService;
