import React, { useState, useEffect } from 'react';
import './App.css';
import { Team, Epic, Quarter, TSHIRT_SIZE_DAYS } from './types';
import { calculateTeamCapacity } from './utils/capacityCalculations';
import { TeamConfiguration } from './components/TeamConfiguration';
import { Backlog } from './components/Backlog';
import { QuartersPanel } from './components/QuartersPanel';
import { QuarterForm } from './components/QuarterForm';
import { EpicForm } from './components/EpicForm';
import { Settings, Download, Upload } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { EpicCard } from './components/EpicCard';

const DEFAULT_TEAM: Team = {
  id: '1',
  name: 'Engineering Team',
  quarterWorkingDays: 65,
  bufferPercentage: 0.2,
  oncallPerSprint: 1,
  sprintsInQuarter: 6,
  members: [
    { id: '1', name: 'Alice', vacationDays: 5, skills: [] },
    { id: '2', name: 'Bob', vacationDays: 10, skills: [] },
    { id: '3', name: 'Carol', vacationDays: 3, skills: [] },
    { id: '4', name: 'Dan', vacationDays: 8, skills: [] },
  ],
};

const SAMPLE_EPICS: Epic[] = [
  {
    id: '1',
    title: 'User Authentication System',
    size: 'L',
    priority: 'P0',
    status: 'backlog',
    description: 'Implement OAuth 2.0 authentication',
    requiredSkills: ['React', 'Node.js', 'OAuth'],
  },
  {
    id: '2',
    title: 'Dashboard Analytics',
    size: 'M',
    priority: 'P1',
    status: 'backlog',
    description: 'Create analytics dashboard for metrics',
    requiredSkills: ['React', 'D3.js'],
  },
  {
    id: '3',
    title: 'API Rate Limiting',
    size: 'S',
    priority: 'P1',
    status: 'backlog',
    description: 'Add rate limiting to API endpoints',
    requiredSkills: ['Node.js', 'Redis'],
  },
  {
    id: '4',
    title: 'Mobile Responsive Design',
    size: 'M',
    priority: 'P2',
    status: 'backlog',
    description: 'Make app responsive for mobile devices',
    requiredSkills: ['CSS', 'React'],
  },
  {
    id: '5',
    title: 'Performance Optimization',
    size: 'XS',
    priority: 'P2',
    status: 'backlog',
    description: 'Optimize bundle size and load times',
    requiredSkills: ['Webpack', 'React'],
  },
];

const DEFAULT_QUARTERS: Quarter[] = [
  {
    id: '1',
    name: 'Q2 2025',
    status: 'planning',
    workingDays: 65,
    teamId: '1',
    isCollapsed: false,
  },
];

function App() {
  const [team, setTeam] = useState<Team>(() => {
    const savedTeam = localStorage.getItem('worktetris-team');
    return savedTeam ? JSON.parse(savedTeam) : DEFAULT_TEAM;
  });
  
  const [epics, setEpics] = useState<Epic[]>(() => {
    const savedEpics = localStorage.getItem('worktetris-epics');
    return savedEpics ? JSON.parse(savedEpics) : SAMPLE_EPICS;
  });
  
  const [quarters, setQuarters] = useState<Quarter[]>(() => {
    const savedQuarters = localStorage.getItem('worktetris-quarters');
    return savedQuarters ? JSON.parse(savedQuarters) : DEFAULT_QUARTERS;
  });
  
  const [isTeamConfigOpen, setIsTeamConfigOpen] = useState(false);
  const [isEpicFormOpen, setIsEpicFormOpen] = useState(false);
  const [isQuarterFormOpen, setIsQuarterFormOpen] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Epic | undefined>(undefined);
  const [editingQuarter, setEditingQuarter] = useState<Quarter | undefined>(undefined);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    localStorage.setItem('worktetris-team', JSON.stringify(team));
    localStorage.setItem('worktetris-epics', JSON.stringify(epics));
    localStorage.setItem('worktetris-quarters', JSON.stringify(quarters));
  }, [team, epics, quarters]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const draggedEpic = epics.find(e => e.id === active.id);
    if (!draggedEpic) return;

    // Check if dropping on a quarter
    if (over.id.toString().startsWith('quarter-')) {
      const quarterId = over.id.toString().replace('quarter-', '');
      const quarter = quarters.find(q => q.id === quarterId);
      
      if (quarter) {
        // Check capacity before adding
        const quarterEpics = epics.filter(e => e.quarterId === quarterId);
        const capacity = calculateTeamCapacity(team, quarterEpics);
        const epicSize = TSHIRT_SIZE_DAYS[draggedEpic.size];
        
        if (capacity.remainingCapacity >= epicSize) {
          // Update epic with new quarter assignment
          const maxPosition = Math.max(...quarterEpics.map(e => e.position || 0), 0);
          setEpics(epics.map(e => 
            e.id === draggedEpic.id 
              ? { ...e, status: 'planned', quarterId: quarterId, position: maxPosition + 1 }
              : e
          ));
        } else {
          alert('Not enough capacity in this quarter');
        }
      }
    } else if (over.id === 'backlog') {
      // Moving back to backlog
      setEpics(epics.map(e => 
        e.id === draggedEpic.id 
          ? { ...e, status: 'backlog', quarterId: undefined, position: undefined }
          : e
      ));
    }
    
    setActiveId(null);
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleAddEpic = () => {
    setEditingEpic(undefined);
    setIsEpicFormOpen(true);
  };

  const handleEditEpic = (epic: Epic) => {
    setEditingEpic(epic);
    setIsEpicFormOpen(true);
  };

  const handleSaveEpic = (epic: Epic) => {
    if (editingEpic) {
      setEpics(epics.map(e => e.id === epic.id ? epic : e));
    } else {
      setEpics([...epics, epic]);
    }
    setIsEpicFormOpen(false);
    setEditingEpic(undefined);
  };

  const handleAddQuarter = () => {
    setEditingQuarter(undefined);
    setIsQuarterFormOpen(true);
  };

  const handleSaveQuarter = (quarter: Quarter) => {
    if (editingQuarter) {
      setQuarters(quarters.map(q => q.id === quarter.id ? quarter : q));
    } else {
      setQuarters([...quarters, quarter]);
    }
    setIsQuarterFormOpen(false);
    setEditingQuarter(undefined);
  };

  const handleToggleCollapse = (quarterId: string) => {
    setQuarters(quarters.map(q => 
      q.id === quarterId 
        ? { ...q, isCollapsed: !q.isCollapsed }
        : q
    ));
  };

  const handleQuarterAction = (quarterId: string, action: string) => {
    switch (action) {
      case 'edit':
        const quarter = quarters.find(q => q.id === quarterId);
        if (quarter) {
          setEditingQuarter(quarter);
          setIsQuarterFormOpen(true);
        }
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this quarter? All epics will be moved back to backlog.')) {
          // Move all epics back to backlog
          setEpics(epics.map(e => 
            e.quarterId === quarterId 
              ? { ...e, status: 'backlog', quarterId: undefined, position: undefined }
              : e
          ));
          // Delete the quarter
          setQuarters(quarters.filter(q => q.id !== quarterId));
        }
        break;
    }
  };

  const handleExport = () => {
    const data = {
      team,
      epics,
      quarters,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worktetris-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.team) setTeam(data.team);
          if (data.epics) setEpics(data.epics);
          if (data.quarters) setQuarters(data.quarters);
        } catch (error) {
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const activeEpic = epics.find(e => e.id === activeId);

  return (
    <div className="app">
      <div className="app-header">
        <h2 className="app-title">WorkTetris</h2>
        <div className="app-toolbar">
          <button onClick={() => setIsTeamConfigOpen(true)} className="toolbar-button">
            <Settings size={16} />
            Team Settings
          </button>
          <button onClick={handleExport} className="toolbar-button">
            <Download size={16} />
            Export
          </button>
          <label className="toolbar-button">
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="main-content">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <Backlog
            epics={epics}
            onAddEpic={handleAddEpic}
            onEditEpic={handleEditEpic}
          />
          
          <QuartersPanel
            quarters={quarters}
            epics={epics}
            team={team}
            onEditEpic={handleEditEpic}
            onToggleCollapse={handleToggleCollapse}
            onQuarterAction={handleQuarterAction}
            onAddQuarter={handleAddQuarter}
          />
          
          <DragOverlay>
            {activeEpic ? <EpicCard epic={activeEpic} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TeamConfiguration
        team={team}
        onTeamUpdate={setTeam}
        isOpen={isTeamConfigOpen}
        onClose={() => setIsTeamConfigOpen(false)}
      />

      <EpicForm
        epic={editingEpic}
        onSave={handleSaveEpic}
        onCancel={() => setIsEpicFormOpen(false)}
        isOpen={isEpicFormOpen}
      />

      <QuarterForm
        quarter={editingQuarter}
        onSave={handleSaveQuarter}
        onCancel={() => setIsQuarterFormOpen(false)}
        isOpen={isQuarterFormOpen}
        teamId={team.id}
      />
    </div>
  );
}

export default App;