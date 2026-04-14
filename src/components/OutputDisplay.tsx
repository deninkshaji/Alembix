import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { STAGES, StageResult } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Download, FileText, LayoutGrid } from 'lucide-react';
import { Button } from './ui/button';

interface OutputDisplayProps {
  results: StageResult[];
}

export function OutputDisplay({ results }: OutputDisplayProps) {
  const completedResults = results.filter(r => r.status === 'completed');

  const exportAsText = () => {
    const timestamp = new Date().toLocaleString();
    const content = `ALEMBIX RESEARCH ANALYSIS\nGenerated: ${timestamp}\n\n${'='.repeat(60)}\n\n` + 
      completedResults
      .map(r => `STAGE ${r.stage}: ${r.name.toUpperCase()}\n${'-'.repeat(r.name.length + 9)}\n\n${r.output}\n\n${'='.repeat(60)}\n\n`)
      .join('');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alembix-full-analysis-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (completedResults.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-40">
        <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center border border-border">
          <LayoutGrid className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-display tracking-wide">Analysis Repository</h3>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Your structured intellectual map will populate here stage-by-stage as the analysis progresses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background/50">
      <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-card/40 backdrop-blur-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-display amber-glow tracking-tight">Intellectual Map</h2>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Consolidated Research Intelligence</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportAsText} 
            className="gap-2 font-mono text-[10px] uppercase tracking-widest bg-primary/5 hover:bg-primary/10 border-primary/20"
          >
            <Download className="w-3.5 h-3.5" />
            Download Full Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue={completedResults[completedResults.length - 1].stage.toString()} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-card/20">
          <ScrollArea className="w-full">
            <TabsList className="bg-transparent h-14 p-0 justify-start px-8 gap-2">
              {completedResults.map((r) => (
                <TabsTrigger
                  key={r.stage}
                  value={r.stage.toString()}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-6 h-full font-mono text-[10px] uppercase tracking-widest transition-all"
                >
                  Stage {r.stage}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </div>

        <div className="flex-1 overflow-hidden">
          {completedResults.map((r) => (
            <TabsContent key={r.stage} value={r.stage.toString()} className="h-full m-0 p-0">
              <ScrollArea className="h-full">
                <div className="p-12 max-w-4xl mx-auto">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary font-mono text-[10px] uppercase tracking-widest rounded border border-primary/20">
                          Phase {r.stage}
                        </span>
                      </div>
                      <h3 className="text-5xl font-display leading-tight">{r.name}</h3>
                    </div>
                    
                    <div className="prose-custom">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{r.output}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
