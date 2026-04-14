import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { STAGES, StageResult } from '../types';
import { Progress } from './ui/progress';

interface StageTrackerProps {
  results: StageResult[];
  currentStage: number;
}

export function StageTracker({ results, currentStage }: StageTrackerProps) {
  const progress = results.length > 0 
    ? (results.filter(r => r.status === 'completed').length / STAGES.length) * 100
    : 0;

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4 opacity-30">
        <Loader2 className="w-8 h-8" />
        <p className="text-[10px] font-mono uppercase tracking-widest">Waiting for analysis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-muted-foreground uppercase tracking-wider">
          <span>Analysis Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1 bg-secondary" />
      </div>

      <div className="space-y-3">
        {STAGES.map((stage) => {
          const result = results.find(r => r.stage === stage.id);
          const status = result?.status || 'pending';
          const isActive = currentStage === stage.id;

          return (
            <div
              key={stage.id}
              className={`
                flex items-center gap-3 p-2 rounded transition-colors
                ${isActive ? 'bg-primary/5 border border-primary/20' : ''}
              `}
            >
              <div className="shrink-0">
                {status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : status === 'running' ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-mono uppercase tracking-tight ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  Stage {stage.id}
                </span>
                <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                  {stage.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
