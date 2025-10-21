'use client';

import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import FileUpload from '@/components/FileUpload';
import { generateImportTemplate } from '@/lib/validators';
import { User } from '@/lib/types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  user: User | null;
  currentWeek: number;
}

export default function ImportModal({ 
  isOpen, 
  onClose, 
  onImportComplete,
  user,
  currentWeek
}: ImportModalProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    errors?: string[];
  } | null>(null);
  
  const handleFileUpload = (content: string) => {
    setFileContent(content);
    setImportResult(null);
  };
  
  const handleImport = async () => {
    if (!fileContent || !user) return;
    
    try {
      setIsImporting(true);
      setImportResult(null);
      
      const parsedContent = JSON.parse(fileContent);
      
      const response = await fetch('/api/workouts/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          data: parsedContent,
          // Don't pass targetWeek - let the API determine the next available week number
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setImportResult({
          success: false,
          message: result.error || 'Import failed',
          errors: result.details || [],
        });
        return;
      }
      
      setImportResult({
        success: true,
        message: 'Workouts imported successfully!',
      });
      
      // Store important information from the result
      const _importedWeekNumber = result.weekNumber;
      
      // After successful import, wait a moment then close modal and update
      setTimeout(() => {
        onClose();
        // Tell parent component to reload workouts and switch to the imported week
        onImportComplete();
        
        // Force a page refresh to ensure we get fresh data
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: 'Failed to process import data',
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  const downloadTemplate = () => {
    const template = generateImportTemplate();
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'workout-template.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Import Workouts</ModalHeader>
      
      <ModalBody>
        <div className="space-y-4">
          <div>
            <Label>Upload Workout JSON File</Label>
            <p className="text-sm text-gray-500 mb-2">
              Upload a JSON file containing your workout data.
            </p>
            <FileUpload
              onFileUpload={handleFileUpload}
              buttonText="Select Workout JSON File"
              accept=".json"
            />
          </div>
          
          {importResult && (
            <div className={`p-3 rounded text-sm ${
              importResult.success 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              <p className="font-medium">{importResult.message}</p>
              {importResult.errors && importResult.errors.length > 0 && (
                <ul className="list-disc list-inside mt-2">
                  {importResult.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          <div className="border-t pt-3">
            <p className="text-sm text-gray-500 mb-2">
              Need help with the format? Download a template to get started.
            </p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={downloadTemplate}
            >
              Download Template
            </Button>
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button 
          variant="outline" 
          onClick={onClose}
          disabled={isImporting}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleImport}
          disabled={!fileContent || isImporting}
        >
          {isImporting ? 'Importing...' : 'Import Workouts'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}