import { cn } from "./ui/utils";

interface AllocationSegment {
  id: string;
  label: string;
  value: number; // percentage 0-100
  color: string;
}

interface AllocationBarProps {
  segments: AllocationSegment[];
  className?: string;
  showLegend?: boolean;
}

export function AllocationBar({ segments, className, showLegend = true }: AllocationBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  
  // Normalize values if they don't add up to 100 perfectly, purely for visual stacking
  // preventing overflow
  const normalizedSegments = segments.map(s => ({
    ...s,
    width: total > 0 ? (s.value / total) * 100 : 0
  }));

  return (
    <div className={cn("space-y-3", className)}>
      <div className="h-2 w-full flex rounded-full overflow-hidden bg-neutral-800">
        {normalizedSegments.map((segment) => (
          <div
            key={segment.id}
            style={{ width: `${segment.width}%`, backgroundColor: segment.color }}
            className="h-full transition-all duration-500"
            title={`${segment.label}: ${segment.value}%`}
          />
        ))}
      </div>
      
      {showLegend && (
        <div className="flex flex-wrap gap-4 text-xs text-neutral-400">
          {segments.map((segment) => (
            <div key={segment.id} className="flex items-center gap-1.5">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: segment.color }}
              />
              <span>{segment.label}</span>
              <span className="text-neutral-500">{segment.value}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
