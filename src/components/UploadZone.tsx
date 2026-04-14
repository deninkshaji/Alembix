import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { ResearchPaper } from '@/types';
import { extractTextFromPdf } from '@/lib/pdf';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import { toast } from 'sonner';

interface UploadZoneProps {
  papers: ResearchPaper[];
  setPapers: React.Dispatch<React.SetStateAction<ResearchPaper[]>>;
  isProcessing: boolean;
}

export function UploadZone({ papers, setPapers, isProcessing }: UploadZoneProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (papers.length + acceptedFiles.length > 6) {
      toast.error('Maximum 6 papers allowed');
      return;
    }

    for (const file of acceptedFiles) {
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF`);
        continue;
      }

      try {
        const text = await extractTextFromPdf(file);
        const newPaper: ResearchPaper = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          text,
          size: file.size,
        };
        setPapers(prev => [...prev, newPaper]);
      } catch (error) {
        console.error('Error processing PDF:', error);
        toast.error(`Failed to process ${file.name}`);
      }
    }
  }, [papers, setPapers]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    disabled: isProcessing || papers.length >= 6,
  });

  const removePaper = (id: string) => {
    setPapers(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer
          flex flex-col items-center justify-center text-center gap-4
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          ${(isProcessing || papers.length >= 6) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="p-4 rounded-full bg-primary/10">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-lg font-medium">Drag & drop research papers</p>
          <p className="text-sm text-muted-foreground">Max 6 PDFs. Each paper builds the map.</p>
        </div>
      </div>

      <div className="grid gap-2">
        {papers.map((paper) => (
          <Card key={paper.id} className="p-3 flex items-center justify-between bg-secondary/50 border-border">
            <div className="flex items-center gap-3 overflow-hidden">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm truncate font-mono">{paper.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => removePaper(paper.id)}
              disabled={isProcessing}
            >
              <X className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
