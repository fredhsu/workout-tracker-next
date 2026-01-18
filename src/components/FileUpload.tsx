'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FileUploadProps {
  onFileUpload: (fileContent: string) => void;
  accept?: string;
  buttonText?: string;
  maxSize?: number; // in MB
}

export default function FileUpload({
  onFileUpload,
  accept = '.json',
  buttonText = 'Upload JSON',
  maxSize = 2 // 2MB default
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    setFileName(file.name);
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }
    
    // Check file type
    if (accept && !file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }
    
    // Read file
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        // Check if valid JSON
        JSON.parse(content);
        onFileUpload(content);
      } catch (_error) {
        setError('Invalid JSON file');
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2">
        <Label htmlFor="file-upload" className="sr-only">
          Upload File
        </Label>
        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button 
          type="button"
          onClick={handleClick}
          variant="outline"
          className="w-full"
        >
          {buttonText}
        </Button>
        
        {fileName && (
          <div className="text-sm text-gray-500 mt-1">
            Selected: {fileName}
          </div>
        )}
        
        {error && (
          <div className="text-sm text-destructive mt-1">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}