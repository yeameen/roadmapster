'use client';

import React from 'react';
import { Quarter, Epic, Team } from '../types';
import { QuarterView } from './QuarterView';
import { Plus, Calendar } from 'lucide-react';

interface QuartersPanelProps {
  quarters: Quarter[];
  epics: Epic[];
  team: Team;
  onEditEpic: (epic: Epic) => void;
  onToggleCollapse: (quarterId: string) => void;
  onQuarterAction: (quarterId: string, action: string) => void;
  onAddQuarter: () => void;
}

export const QuartersPanel: React.FC<QuartersPanelProps> = ({
  quarters,
  epics,
  team,
  onEditEpic,
  onToggleCollapse,
  onQuarterAction,
  onAddQuarter,
}) => {
  return (
    <div className="quarters-panel">
      <div className="quarters-panel-header">
        <h3>
          <Calendar className="inline mr-2" size={20} />
          Quarters
        </h3>
      </div>
      
      <div className="quarters-list">
        {quarters.length > 0 ? (
          quarters.map(quarter => (
            <QuarterView
              key={quarter.id}
              quarter={quarter}
              epics={epics}
              team={team}
              onEditEpic={onEditEpic}
              onToggleCollapse={onToggleCollapse}
              onQuarterAction={onQuarterAction}
            />
          ))
        ) : (
          <div className="no-quarters">
            <p>No quarters created yet</p>
            <p className="text-muted">Create your first quarter to start planning</p>
          </div>
        )}
        
        <button onClick={onAddQuarter} className="add-quarter-button">
          <Plus size={20} />
          Create Quarter
        </button>
      </div>
    </div>
  );
};