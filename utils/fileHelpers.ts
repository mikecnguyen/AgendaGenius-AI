import { FileData } from '../types';

export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

export const processFiles = async (files: File[]): Promise<FileData[]> => {
  const processedFiles: FileData[] = [];
  
  for (const file of files) {
    try {
      const base64Content = await readFileAsBase64(file);
      processedFiles.push({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: file.type,
        content: base64Content
      });
    } catch (error) {
      console.error(`Error reading file ${file.name}:`, error);
    }
  }
  
  return processedFiles;
};
