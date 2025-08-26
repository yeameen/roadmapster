'use client';

import React from 'react';
import { Epic, TSHIRT_SIZE_COLORS, TSHIRT_SIZE_DAYS } from '../types';
import { GripVertical, AlertCircle } from 'lucide-react';

interface EpicCardProps {
  epic: Epic;
  isDragging?: boolean;
  onEdit?: (epic: Epic) => void;
  dragListeners?: any;
  dragAttributes?: any;
}

export const EpicCard: React.FC<EpicCardProps> = ({ epic, isDragging, onEdit, dragListeners, dragAttributes }) => {
  const backgroundColor = TSHIRT_SIZE_COLORS[epic.size];
  const days = TSHIRT_SIZE_DAYS[epic.size];

  const handleClick = (e: React.MouseEvent) => {
    if (!e.defaultPrevented && onEdit) {
      onEdit(epic);
    }
  };

  const handleDragHandleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`epic-card ${isDragging ? 'dragging' : ''}`}
      style={{ backgroundColor }}
      onClick={handleClick}
      {...(dragAttributes || {})}
      {...(dragListeners || {})}
      suppressHydrationWarning={true}
    >
      <div className="epic-card-header">
        <div 
          className="drag-handle" 
          onClick={handleDragHandleClick}
        >
          <GripVertical size={16} />
        </div>
        <span className="epic-priority">{epic.priority}</span>
        <span className="epic-size">{epic.size}</span>
      </div>
      <div className="epic-card-body">
        <h4 className="epic-title">{epic.title}</h4>
        <div className="epic-meta">
          <span className="epic-days">{days} days</span>
          {epic.requiredSkills && epic.requiredSkills.length > 0 && (
            <span className="epic-skills">
              {epic.requiredSkills.length} skill{epic.requiredSkills.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {epic.dependencies && epic.dependencies.length > 0 && (
          <div className="epic-dependencies">
            <AlertCircle size={12} />
            <span>{epic.dependencies.length} dep(s)</span>
          </div>
        )}
      </div>
    </div>
  );
};