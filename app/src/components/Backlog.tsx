import React from 'react';
import { Epic, Priority } from '../types';
import { EpicCard } from './EpicCard';
import { Plus, Archive } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface BacklogProps {
  epics: Epic[];
  onAddEpic: () => void;
  onEditEpic: (epic: Epic) => void;
}

interface SortableEpicProps {
  epic: Epic;
  onEdit: (epic: Epic) => void;
}

const SortableEpic: React.FC<SortableEpicProps> = ({ epic, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: epic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <EpicCard 
        epic={epic} 
        isDragging={isDragging} 
        onEdit={onEdit}
        dragListeners={listeners}
        dragAttributes={attributes}
      />
    </div>
  );
};

export const Backlog: React.FC<BacklogProps> = ({ epics, onAddEpic, onEditEpic }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'backlog',
  });

  const backlogEpics = epics.filter(e => e.status === 'backlog');
  
  const priorityGroups: Record<Priority, Epic[]> = {
    P0: backlogEpics.filter(e => e.priority === 'P0'),
    P1: backlogEpics.filter(e => e.priority === 'P1'),
    P2: backlogEpics.filter(e => e.priority === 'P2'),
    P3: backlogEpics.filter(e => e.priority === 'P3'),
  };

  const priorityLabels: Record<Priority, string> = {
    P0: 'Critical (Must Do)',
    P1: 'High Priority',
    P2: 'Medium Priority',
    P3: 'Low Priority',
  };

  return (
    <div className="backlog" ref={setNodeRef}>
      <div className="backlog-header">
        <h3>
          <Archive className="inline mr-2" size={20} />
          Backlog
        </h3>
        <button onClick={onAddEpic} className="add-epic-button">
          <Plus size={16} />
          Add Epic
        </button>
      </div>
      
      <div className={`backlog-content ${isOver ? 'drag-over' : ''}`}>
        {(Object.keys(priorityGroups) as Priority[]).map(priority => {
          const epicsInPriority = priorityGroups[priority];
          if (epicsInPriority.length === 0) return null;
          
          return (
            <div key={priority} className="priority-group">
              <h4 className="priority-label">
                {priorityLabels[priority]} ({epicsInPriority.length})
              </h4>
              <SortableContext
                items={epicsInPriority.map(e => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="epics-list">
                  {epicsInPriority.map(epic => (
                    <SortableEpic
                      key={epic.id}
                      epic={epic}
                      onEdit={onEditEpic}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          );
        })}
        
        {backlogEpics.length === 0 && (
          <div className="empty-state">
            <p>No epics in backlog</p>
            <button onClick={onAddEpic} className="add-epic-link">
              Add your first epic
            </button>
          </div>
        )}
      </div>
    </div>
  );
};