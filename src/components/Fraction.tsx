import React from 'react';

interface FractionProps {
  numerator: number;
  denominator: number;
  className?: string;
}

export function Fraction({ numerator, denominator, className = '' }: FractionProps) {
  return (
    <div className={`inline-flex flex-col items-center justify-center align-middle mx-1 ${className}`}>
      <span className="text-[1.1em] font-bold leading-none">{numerator}</span>
      <div className="h-[2px] w-[120%] bg-current my-[0.15em]" />
      <span className="text-[1.1em] font-bold leading-none">{denominator}</span>
    </div>
  );
}

export function FractionExpression({ fractions }: { fractions: any[] }) {
  return (
    <div className="flex items-center justify-center gap-3 md:gap-4 text-3xl md:text-5xl text-slate-700">
      {fractions.map((item, index) => {
        if (item.operator) {
          return <span key={index} className="font-black text-[1.2em]">{item.operator}</span>;
        }
        return <Fraction key={index} numerator={item.numerator} denominator={item.denominator} />;
      })}
    </div>
  );
}
