"use client";

import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { Fraction } from './Fraction';

function DraggableItem({ id, item }: { id: string, item: any }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 9999, // Ensure it is on top of everything
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white border-2 border-b-4 border-slate-200 rounded-xl p-3 shadow-md cursor-grab active:cursor-grabbing active:scale-95 hover:border-blue-400 hover:bg-blue-50 hover:-translate-y-1 hover:shadow-lg transition-all touch-none flex items-center justify-center min-w-[3.5rem] min-h-[3.5rem] relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      {item.type === 'fraction' ? (
        <Fraction numerator={item.value.numerator} denominator={item.value.denominator} />
      ) : (
        <span className="text-3xl font-black text-slate-700">{item.value}</span>
      )}
    </div>
  );
}

function DroppableZone({ id, label, droppedItem, itemData, sizeClass = "w-32 h-32" }: { id: string, label: string, droppedItem: string | null, itemData: any, sizeClass?: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 ${sizeClass}
        ${isOver ? 'bg-blue-50 border-blue-400 ring-4 ring-blue-100 scale-105 shadow-inner' : 'bg-slate-50 border-slate-300'}
        ${droppedItem ? 'border-solid border-green-400 border-b-4 bg-green-50 shadow-md scale-100' : ''}
      `}
    >
      {!droppedItem && <span className="absolute text-sm text-slate-400 font-medium px-2 text-center">{label}</span>}
      {droppedItem && itemData && (
        <div className="scale-110 flex items-center justify-center w-full h-full">
          {itemData.type === 'fraction' ? (
            <Fraction numerator={itemData.value.numerator} denominator={itemData.value.denominator} />
          ) : (
            <span className="text-3xl font-black text-slate-700">{itemData.value}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function DragDropQuestion({ question, onComplete }: { question: any, onComplete: (isCorrect: boolean) => void }) {
  const [placements, setPlacements] = useState<Record<string, string | null>>({});

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    
    if (over) {
      const zoneId = over.id as string;
      const itemId = active.id as string;
      
      const newPlacements = { ...placements, [zoneId]: itemId };
      setPlacements(newPlacements);

      // Check if all zones are filled
      if (Object.keys(newPlacements).length === question.dropZones.length) {
        let isAllCorrect = true;
        question.dropZones.forEach((zone: any) => {
          if (newPlacements[zone.id] !== zone.expectedItemId) {
            isAllCorrect = false;
          }
        });
        
        // Slight delay to show the dropped item before resolving
        setTimeout(() => {
          onComplete(isAllCorrect);
        }, 500);
      }
    }
  };

  // Filter out dragged items from the available list
  const availableItems = question.dragItems.filter(
    (item: any) => !Object.values(placements).includes(item.id)
  );

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4 sm:gap-6 items-center justify-center py-2 w-full h-full">
        
        {/* Drop Zones (Inline Equation Layout or Standard Layout) */}
        {question.equationLayout ? (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm">
            {question.equationLayout.map((el: any, index: number) => {
              if (el.type === 'fraction') {
                return (
                  <div key={index} className="flex items-center justify-center px-2">
                    <Fraction numerator={el.value.numerator} denominator={el.value.denominator} />
                  </div>
                );
              }
              if (el.type === 'text') {
                return (
                  <div key={index} className="flex items-center justify-center px-2">
                    <span className="text-3xl font-black text-slate-700">{el.value}</span>
                  </div>
                );
              }
              if (el.type === 'dropzone') {
                const zone = question.dropZones.find((z: any) => z.id === el.id);
                if (!zone) return null;
                const droppedItemId = placements[zone.id];
                const itemData = question.dragItems.find((i: any) => i.id === droppedItemId);
                
                // If the drag items are operators (text), make the drop zone smaller
                const isOperatorZone = question.dragItems[0]?.type === 'operator';
                const sizeClass = isOperatorZone ? "w-16 h-16" : "w-24 h-24";
                
                return (
                  <DroppableZone 
                    key={zone.id} 
                    id={zone.id} 
                    label={zone.label} 
                    droppedItem={droppedItemId}
                    itemData={itemData}
                    sizeClass={sizeClass}
                  />
                );
              }
              return null;
            })}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {question.dropZones.map((zone: any) => {
              const droppedItemId = placements[zone.id];
              const itemData = question.dragItems.find((i: any) => i.id === droppedItemId);
              return (
                <DroppableZone 
                  key={zone.id} 
                  id={zone.id} 
                  label={zone.label} 
                  droppedItem={droppedItemId}
                  itemData={itemData} 
                  sizeClass="w-32 h-32"
                />
              );
            })}
          </div>
        )}

        {/* Draggable Items */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-5 min-h-[80px] p-4 bg-slate-100/50 backdrop-blur-sm rounded-3xl w-full border-2 border-slate-200 border-dashed shadow-inner relative">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-30 rounded-3xl overflow-hidden pointer-events-none"></div>
          {availableItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-400 relative z-10">
              <span className="font-bold text-lg">Hoàn hảo!</span>
              <span className="text-sm">Bạn đã ghép xong.</span>
            </div>
          ) : (
            availableItems.map((item: any) => (
              <div key={item.id} className="relative z-10">
                <DraggableItem id={item.id} item={item} />
              </div>
            ))
          )}
        </div>
        
      </div>
    </DndContext>
  );
}
