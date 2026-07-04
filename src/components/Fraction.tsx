import React from 'react';

interface FractionProps {
  numerator: number;
  denominator: number;
  className?: string;
}

export function Fraction({ numerator, denominator, className = '' }: FractionProps) {
  return (
    <div className={`inline-flex flex-col items-center justify-center align-middle mx-1 ${className}`}>
      <span className="text-lg font-semibold leading-none">{numerator}</span>
      <div className="h-[2px] w-full bg-current my-0.5" />
      <span className="text-lg font-semibold leading-none">{denominator}</span>
    </div>
  );
}

export function FractionExpression({ fractions }: { fractions: any[] }) {
  return (
    <div className="flex items-center justify-center gap-2 text-2xl">
      {fractions.map((item, index) => {
        if (item.operator) {
          return <span key={index} className="font-bold">{item.operator}</span>;
        }
        return <Fraction key={index} numerator={item.numerator} denominator={item.denominator} />;
      })}
    </div>
  );
}
