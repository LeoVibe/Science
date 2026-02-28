import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const DEFAULT_MESSAGE = '本題解析說明設計意圖與誘答巧思，幫助孩子理解為何其他選項不適合。';

interface IntentionTooltipProps {
  message?: string;
}

/** 解析旁的設計意圖提示：懸停於圖示時顯示氣泡說明 */
export default function IntentionTooltip({ message = DEFAULT_MESSAGE }: IntentionTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground hover:bg-border cursor-help text-[10px] font-bold ml-1 align-middle"
          aria-label="設計意圖說明"
        >
          ?
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {message}
      </TooltipContent>
    </Tooltip>
  );
}
