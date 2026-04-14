import React, { useState, useEffect } from 'react';
import { DomainTemplate, ResearchPaper, StageResult, STAGES } from '@/types';
import { UploadZone } from '@/components/UploadZone';
import { StageTracker } from '@/components/StageTracker';
import { OutputDisplay } from '@/components/OutputDisplay';
import { DomainSelector } from '@/components/DomainSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { runAlembixStage } from '@/lib/gemini';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Beaker, Play, RotateCcw, Sparkles } from 'lucide-react';

export default function App() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [domain, setDomain] = useState<DomainTemplate>('Materials Science');
  const [customDomain, setCustomDomain] = useState('');
  const [topic, setTopic] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(-1);
  const [results, setResults] = useState<StageResult[]>([]);

  const startAnalysis = async () => {
    if (papers.length === 0) {
      toast.error('Please upload at least one paper');
      return;
    }
    if (!topic) {
      toast.error('Please specify the research topic');
      return;
    }
    
    if (!process.env.GEMINI_API_KEY) {
      toast.error('Gemini API key is missing. Please check your environment secrets.');
      return;
    }

    setIsProcessing(true);
    setResults([]);
    
    let context = "";

    for (let i = 0; i < STAGES.length; i++) {
      setCurrentStage(i);
      const stageInfo = STAGES[i];
      
      setResults(prev => [...prev, {
        stage: i,
        name: stageInfo.name,
        output: "",
        status: 'running'
      }]);

      try {
        const output = await runAlembixStage(i, domain, topic, papers, context, customDomain);
        
        setResults(prev => prev.map(r => 
          r.stage === i ? { ...r, output, status: 'completed' } : r
        ));
        
        context += `\n\n--- STAGE ${i}: ${stageInfo.name} ---\n${output}`;
      } catch (error) {
        console.error(`Error in stage ${i}:`, error);
        setResults(prev => prev.map(r => 
          r.stage === i ? { ...r, status: 'error', output: "Error occurred during analysis." } : r
        ));
        toast.error(`Analysis failed at stage ${i}`);
        break;
      }
    }

    setIsProcessing(false);
    setCurrentStage(-1);
    toast.success('Analysis complete');
  };

  const reset = () => {
    setPapers([]);
    setResults([]);
    setCurrentStage(-1);
    setIsProcessing(false);
    setTopic('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <Toaster position="top-right" theme="dark" />
      
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center px-6 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(232,168,56,0.2)]">
            <Beaker className="text-primary-foreground w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-display tracking-tight amber-glow">Alembix</h1>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground leading-none">Structured Literature Map</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={reset} 
            disabled={isProcessing}
            className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3 h-3 mr-2" />
            Reset Session
          </Button>
          <Button 
            onClick={startAnalysis} 
            disabled={isProcessing || papers.length === 0 || !topic}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs uppercase tracking-widest px-6 h-9 shadow-[0_0_15px_rgba(232,168,56,0.1)]"
          >
            {isProcessing ? (
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
            ) : (
              <Play className="w-4 h-4 mr-2 fill-current" />
            )}
            {isProcessing ? 'Analyzing...' : 'Run Chain'}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Upload & Config */}
        <aside className="w-[340px] border-r border-border bg-card/30 overflow-y-auto p-8 space-y-10 shrink-0">
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Configuration</h2>
            </div>
            
            <div className="space-y-3">
              <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground opacity-70">Research Topic</Label>
              <Input 
                placeholder="e.g. Graphene-based supercapacitors"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isProcessing}
                className="bg-secondary/30 border-border font-mono text-xs h-10 focus:bg-secondary/50 transition-all"
              />
            </div>

            <DomainSelector 
              domain={domain} 
              setDomain={setDomain} 
              customDomain={customDomain} 
              setCustomDomain={setCustomDomain}
              disabled={isProcessing}
            />
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Paper Repository</h2>
            </div>
            <UploadZone papers={papers} setPapers={setPapers} isProcessing={isProcessing} />
          </section>
        </aside>

        {/* Center Panel: Progress Tracker */}
        <aside className="w-[300px] border-r border-border bg-card/10 overflow-y-auto p-8 shrink-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Stage Progress</h2>
          </div>
          <StageTracker results={results} currentStage={currentStage} />
        </aside>

        {/* Right Panel: Output */}
        <section className="flex-1 bg-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #e8a838 1px, transparent 0)', backgroundSize: '48px 48px' }} 
          />
          <OutputDisplay results={results} />
        </section>
      </main>
    </div>
  );
}
