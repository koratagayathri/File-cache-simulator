import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  FastForward,
} from 'lucide-react';

interface PlaybackControlsProps {
  playing: boolean;
  step: number;
  totalSteps: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRestart: () => void;
  onRunFull: () => void;
}

export default function PlaybackControls({
  playing,
  step,
  totalSteps,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onRestart,
  onRunFull,
}: PlaybackControlsProps) {
  const atStart = step <= 0;
  const atEnd = step >= totalSteps;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <CtrlButton onClick={onRestart} disabled={totalSteps === 0} title="Restart">
          <RotateCcw className="w-4 h-4" />
        </CtrlButton>
        <CtrlButton onClick={onPrev} disabled={atStart || totalSteps === 0} title="Previous Step">
          <SkipBack className="w-4 h-4" />
        </CtrlButton>
        {playing ? (
          <button
            onClick={onPause}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <Pause className="w-4 h-4" /> Pause
          </button>
        ) : (
          <button
            onClick={onPlay}
            disabled={atEnd || totalSteps === 0}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-sm font-semibold shadow-sm transition-colors disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" /> Play
          </button>
        )}
        <CtrlButton onClick={onNext} disabled={atEnd || totalSteps === 0} title="Next Step">
          <SkipForward className="w-4 h-4" />
        </CtrlButton>
        <CtrlButton onClick={onRunFull} disabled={totalSteps === 0} title="Run Full Simulation">
          <FastForward className="w-4 h-4" />
        </CtrlButton>
      </div>
    </div>
  );
}

function CtrlButton({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 transition-colors disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
