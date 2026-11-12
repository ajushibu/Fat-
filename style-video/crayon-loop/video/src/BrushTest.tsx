import React from 'react';
import {CrayonDefs, hatch, P, ribbon, rng, sample} from './brush';

// Calibration sheet for the crayon brush: lines at several widths/pressures and a hatched fill.
export const BrushTest: React.FC<{frame: number}> = ({frame}) => {
  const r = rng(frame, 1);
  const rows: React.ReactNode[] = [];
  const widths = [4.4, 4.4, 4.4, 6.4, 10, 13];
  const press = [1, 0.6, 0.38, 1, 1, 1];
  widths.forEach((w, i) => {
    const y = 40 + i * 34;
    const pts: P[] = [[30, y + 8], [90, y - 6], [160, y + 6], [240, y - 4], [300, y + 4]];
    rows.push(<path key={i} d={ribbon(sample(pts), w, r)} fill="#000" fillOpacity={press[i]} />);
  });
  const zig: P[] = [];
  for (let i = 0; i < 12; i++) zig.push([40 + i * 20 + r(-5, 5), i % 2 ? 250 + r(-8, 8) : 300 + r(-8, 8)]);
  rows.push(<path key="z" d={ribbon(sample(zig), 11, r)} fill="#000" />);
  const blob: P[] = sample([[350, 60], [600, 40], [640, 200], [560, 320], [360, 300], [330, 180]], true, 12);
  return (
    <svg width={1000} height={1000} viewBox="0 0 1000 1000">
      <CrayonDefs seed={frame} />
      <g filter={`url(#ink-${frame})`}>
        {rows}
        <path d={hatch(blob, 72, 12.5, rng(frame, 2))} stroke="#000" strokeWidth={14} strokeOpacity={0.95} strokeLinecap="round" fill="none" />
        <path d={hatch(blob, 108, 15, rng(frame, 3), 2, 6)} stroke="#000" strokeWidth={14} strokeOpacity={0.6} strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
};
