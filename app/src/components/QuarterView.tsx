import React, { useState } from 'react';
import { Quarter, Epic, Team, TSHIRT_SIZE_DAYS } from '../types';
import { calculateTeamCapacity } from '../utils/capacityCalculations';
import { EpicCard } from './EpicCard';
import { ChevronDown, ChevronRight, Play, Check, MoreVertical } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface QuarterViewProps {
  quarter: Quarter;
  epics: Epic[];
  team: Team;
  onEditEpic: (epic: Epic) => void;
  onToggleCollapse: (quarterId: string) => void;
  onQuarterAction: (quarterId: string, action: string) => void;
}

interface SortableQuarterEpicProps {
  epic: Epic;
  onEdit: (epic: Epic) => void;
}

const SortableQuarterEpic: React.FC<SortableQuarterEpicProps> = ({ epic, onEdit }) => {
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

  const dragHandleProps = { ...attributes, ...listeners };

  return (
    <div ref={setNodeRef} style={style}>
      <EpicCard 
        epic={epic} 
        isDragging={isDragging} 
        onEdit={onEdit}
        dragHandleProps={dragHandleProps}
      />
    </div>
  );
};

export const QuarterView: React.FC<QuarterViewProps> = ({
  quarter,
  epics,
  team,
  onEditEpic,
  onToggleCollapse,
  onQuarterAction,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const { setNodeRef, isOver } = useDroppable({
    id: `quarter-${quarter.id}`,
  });

  const quarterEpics = epics.filter(e => e.quarterId === quarter.id);
  const usedCapacity = quarterEpics.reduce(
    (sum, epic) => sum + TSHIRT_SIZE_DAYS[epic.size],
    0
  );
  
  const capacity = calculateTeamCapacity(team, quarterEpics);
  const utilizationPercentage = Math.round((usedCapacity / capacity.finalCapacity) * 100);
  
  const getStatusColor = () => {
    switch (quarter.status) {
      case 'active': return '#10b981';
      case 'completed': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const getCapacityBarColor = () => {
    if (utilizationPercentage > 90) return '#ef4444';
    if (utilizationPercentage > 75) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="quarter-container">
      <div 
        className="quarter-header"
        style={{ borderLeft: `4px solid ${getStatusColor()}` }}
      >
        <div className="quarter-header-left">
          <button
            onClick={() => onToggleCollapse(quarter.id)}
            className="collapse-button"
          >
            {quarter.isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
          </button>
          <h3 className="quarter-title">{quarter.name}</h3>
          <span className="quarter-epic-count">({quarterEpics.length} epics)</span>
          
          {quarter.status === 'planning' && (
            <button
              onClick={() => onQuarterAction(quarter.id, 'start')}
              className="quarter-action-button start"
              title="Start Quarter"
            >
              <Play size={14} />
              Start
            </button>
          )}
          
          {quarter.status === 'active' && (
            <button
              onClick={() => onQuarterAction(quarter.id, 'complete')}
              className="quarter-action-button complete"
              title="Complete Quarter"
            >
              <Check size={14} />
              Complete
            </button>
          )}
          
          {quarter.status === 'completed' && (
            <span className="quarter-status-badge">Completed</span>
          )}
        </div>
        
        <div className="quarter-header-right">
          <div className="quarter-capacity-info">
            <span className="capacity-text">
              {usedCapacity}/{capacity.finalCapacity} days ({utilizationPercentage}%)
            </span>
            <div className="capacity-bar-mini">
              <div
                className="capacity-bar-fill"
                style={{
                  width: `${Math.min(utilizationPercentage, 100)}%`,
                  backgroundColor: getCapacityBarColor(),
                }}
              />
            </div>
          </div>
          
          <div className="quarter-menu">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="menu-button"
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                <button onClick={() => {
                  onQuarterAction(quarter.id, 'edit');
                  setShowMenu(false);
                }}>Edit Quarter</button>
                <button onClick={() => {
                  onQuarterAction(quarter.id, 'delete');
                  setShowMenu(false);
                }}>Delete Quarter</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {!quarter.isCollapsed && (
        <div
          ref={setNodeRef}
          className={`quarter-content ${isOver ? 'drag-over' : ''}`}
        >
          {quarterEpics.length > 0 ? (
            <SortableContext
              items={quarterEpics.map(e => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="quarter-epics">
                {quarterEpics
                  .sort((a, b) => (a.position || 0) - (b.position || 0))
                  .map(epic => (
                    <SortableQuarterEpic
                      key={epic.id}
                      epic={epic}
                      onEdit={onEditEpic}
                    />
                  ))}
              </div>
            </SortableContext>
          ) : (
            <div className="quarter-empty">
              <p>Drop epics here to plan this quarter</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};