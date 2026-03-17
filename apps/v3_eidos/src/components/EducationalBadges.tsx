import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface BadgeProps {
  cqiScore?: number;
  qualityLevel?: string;
  explanationLength?: number;
}

export function DiagnosticBadge({ explanationLength = 0 }: { explanationLength?: number }) {
  if (explanationLength < 30) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 cursor-help transition-colors hover:bg-indigo-200 dark:hover:bg-indigo-800/60 w-max shrink-0">
          <span className="text-sm leading-none">✨</span>
          深度診斷解析
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[250px] text-xs">
        <p>本題附有詳盡的解析，能有效幫助釐清錯誤觀念與底層邏輯。</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function PsychologyBadge({ cqiScore = 0, qualityLevel = '' }: { cqiScore?: number, qualityLevel?: string }) {
  if (cqiScore <= 8.0 && qualityLevel !== 'L4' && qualityLevel !== 'L5') return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200 border border-rose-200 dark:border-rose-800 cursor-help transition-colors hover:bg-rose-200 dark:hover:bg-rose-800/60 w-max shrink-0">
          <span className="text-sm leading-none">🧠</span>
          診斷性邏輯題
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[280px] text-xs space-y-1.5">
        <p className="font-semibold text-rose-900 dark:text-rose-100 italic">💡 為什麼這題很重要？</p>
        <p className="text-rose-950 dark:text-rose-50 opacity-90 leading-relaxed">
          這不是一般的記憶題。我們特別設計了**「心路陷阱」**，將孩子平時最容易搞混的直覺盲點寫進選項中。
          藉由本題，您可以觀察孩子是「真懂」還是「靠直覺猜測」，是精準抓出觀念漏洞的利器。
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export function EducationalBadges({ cqiScore, qualityLevel, explanationLength }: BadgeProps) {
  const showDiagnostic = explanationLength !== undefined && explanationLength >= 30;
  const showPsychology = (cqiScore !== undefined && cqiScore > 8.0) || qualityLevel === 'L4' || qualityLevel === 'L5';

  if (!showDiagnostic && !showPsychology) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2 mb-1">
      <PsychologyBadge cqiScore={cqiScore} qualityLevel={qualityLevel} />
      <DiagnosticBadge explanationLength={explanationLength} />
    </div>
  );
}
