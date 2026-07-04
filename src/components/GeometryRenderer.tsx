import React from 'react';

interface GeometryProps {
  shape: string;
  width?: number;
  height?: number;
  side?: number;
  base?: number;
  base1?: number;
  base2?: number;
  radius?: number;
  unit: string;
}

export function GeometryRenderer({ geom }: { geom: GeometryProps }) {
  const { shape, unit } = geom;

  // Base SVG viewBox and sizing
  const svgSize = 200;
  const strokeWidth = 2;
  const strokeColor = "#3b82f6"; // blue-500
  const fillColor = "#eff6ff"; // blue-50

  const renderShape = () => {
    switch (shape) {
      case 'rectangle':
        return (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className="max-w-[250px]">
            <rect x="20" y="50" width="160" height="100" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} rx="4" />
            <text x="100" y="40" textAnchor="middle" className="text-sm font-semibold fill-gray-700">{geom.width ?? 'x'} {geom.width ? unit : ''}</text>
            <text x="10" y="100" textAnchor="middle" transform="rotate(-90 10,100)" className="text-sm font-semibold fill-gray-700">{geom.height ?? 'x'} {geom.height ? unit : ''}</text>
          </svg>
        );
      case 'square':
        return (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className="max-w-[200px]">
            <rect x="40" y="40" width="120" height="120" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} rx="4" />
            <text x="100" y="30" textAnchor="middle" className="text-sm font-semibold fill-gray-700">{geom.side ?? 'x'} {geom.side ? unit : ''}</text>
            <text x="25" y="100" textAnchor="middle" transform="rotate(-90 25,100)" className="text-sm font-semibold fill-gray-700">{geom.side ?? 'x'} {geom.side ? unit : ''}</text>
          </svg>
        );
      case 'triangle':
        return (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className="max-w-[200px]">
            <polygon points="100,30 30,150 170,150" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
            <line x1="100" y1="30" x2="100" y2="150" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4" />
            {/* Base */}
            <text x="100" y="165" textAnchor="middle" className="text-sm font-semibold fill-gray-700">{geom.base ?? 'x'} {geom.base ? unit : ''}</text>
            {/* Height */}
            <text x="110" y="100" textAnchor="start" className="text-sm font-semibold fill-gray-700">h = {geom.height ?? 'x'}</text>
          </svg>
        );
      case 'trapezoid':
        return (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className="max-w-[250px]">
            <polygon points="60,50 140,50 180,150 20,150" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
            <line x1="60" y1="50" x2="60" y2="150" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4" />
            <text x="100" y="40" textAnchor="middle" className="text-sm font-semibold fill-gray-700">{geom.base1 ?? 'x'} {geom.base1 ? unit : ''}</text>
            <text x="100" y="165" textAnchor="middle" className="text-sm font-semibold fill-gray-700">{geom.base2 ?? 'x'} {geom.base2 ? unit : ''}</text>
            <text x="65" y="100" textAnchor="start" className="text-sm font-semibold fill-gray-700">h={geom.height ?? 'x'}</text>
          </svg>
        );
      case 'circle':
        return (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className="max-w-[200px]">
            <circle cx="100" cy="100" r="70" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="100" cy="100" r="3" fill="#334155" />
            <line x1="100" y1="100" x2="170" y2="100" stroke="#334155" strokeWidth="2" />
            <text x="135" y="90" textAnchor="middle" className="text-sm font-semibold fill-gray-700">r={geom.radius}</text>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      {renderShape()}
    </div>
  );
}
