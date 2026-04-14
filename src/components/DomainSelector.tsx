import { DomainTemplate } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface DomainSelectorProps {
  domain: DomainTemplate;
  setDomain: (domain: DomainTemplate) => void;
  customDomain: string;
  setCustomDomain: (custom: string) => void;
  disabled: boolean;
}

export function DomainSelector({ domain, setDomain, customDomain, setCustomDomain, disabled }: DomainSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Domain Template</Label>
        <Select value={domain} onValueChange={(v) => setDomain(v as DomainTemplate)} disabled={disabled}>
          <SelectTrigger className="bg-secondary/50 border-border font-mono text-xs uppercase">
            <SelectValue placeholder="Select Domain" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="Materials Science" className="font-mono text-xs uppercase">Materials Science</SelectItem>
            <SelectItem value="Polymer Chemistry" className="font-mono text-xs uppercase">Polymer Chemistry</SelectItem>
            <SelectItem value="Biomedical" className="font-mono text-xs uppercase">Biomedical</SelectItem>
            <SelectItem value="Environmental" className="font-mono text-xs uppercase">Environmental</SelectItem>
            <SelectItem value="Other" className="font-mono text-xs uppercase">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {domain === 'Other' && (
        <div className="space-y-2">
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Specify Domain</Label>
          <Input
            placeholder="e.g. Quantum Computing"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            disabled={disabled}
            className="bg-secondary/50 border-border font-mono text-xs"
          />
        </div>
      )}
    </div>
  );
}
