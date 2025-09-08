'use client';

import React, { useState, useEffect } from 'react';
import { Team, Epic, Quarter, TSHIRT_SIZE_DAYS } from './types';
import { calculateTeamCapacity } from './utils/capacityCalculations';
import { TeamConfiguration } from './components/TeamConfiguration';
import { Backlog } from './components/Backlog';
import { QuartersPanel } from './components/QuartersPanel';
import { QuarterForm } from './components/QuarterForm';
import { EpicForm } from './components/EpicForm';
import { Settings, Download, Upload, LogOut, User } from 'lucide-react';
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
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { useTeams } from './hooks/useTeams';
import { useEpics } from './hooks/useEpics';
import { useQuarters } from './hooks/useQuarters';

const DEFAULT_TEAM: Team = {
  id: '1',
  name: 'Engineering Team',
  quarterWorkingDays: 65,
  bufferPercentage: 0.2,
  oncallPerSprint: 1, // 1 person on oncall
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
    id: 'epic-1',
    title: 'User Authentication System',
    size: 'L',
    priority: 'P0',
    status: 'backlog',
    description: 'Implement OAuth 2.0 authentication',
    requiredSkills: ['React', 'Node.js', 'OAuth'],
  },
  {
    id: 'epic-2',
    title: 'Dashboard Analytics',
    size: 'M',
    priority: 'P1',
    status: 'backlog',
    description: 'Create analytics dashboard for metrics',
    requiredSkills: ['React', 'D3.js'],
  },
  {
    id: 'epic-3',
    title: 'API Rate Limiting',
    size: 'S',
    priority: 'P1',
    status: 'backlog',
    description: 'Add rate limiting to API endpoints',
    requiredSkills: ['Node.js', 'Redis'],
  },
  {
    id: 'epic-4',
    title: 'Mobile Responsive Design',
    size: 'M',
    priority: 'P2',
    status: 'backlog',
    description: 'Make app responsive for mobile devices',
    requiredSkills: ['CSS', 'React'],
  },
  {
    id: 'epic-5',
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

export default function Home() {
  const { user, signOut } = useSupabaseAuth();
  
  // Use Supabase hooks for data persistence
  const { selectedTeam: team, loading: teamLoading, error: teamError, createTeam, updateTeam } = useTeams();
  const { epics, loading: epicsLoading, error: epicsError, createEpic, updateEpic, deleteEpic } = useEpics(team?.id || null);
  const { quarters, loading: quartersLoading, error: quartersError, createQuarter, updateQuarter, deleteQuarter } = useQuarters(team?.id || null);
  
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Set hydrated state when all data is loaded
  useEffect(() => {
    if (!teamLoading && !epicsLoading && !quartersLoading) {
      setIsHydrated(true);
    }
  }, [teamLoading, epicsLoading, quartersLoading]);
  
  const [isTeamConfigOpen, setIsTeamConfigOpen] = useState(false);
  const [isEpicFormOpen, setIsEpicFormOpen] = useState(false);
  const [isQuarterFormOpen, setIsQuarterFormOpen] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Epic | undefined>(undefined);
  const [editingQuarter, setEditingQuarter] = useState<Quarter | undefined>(undefined);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Note: Data is now automatically persisted to Supabase through the hooks

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('Drag ended:', { 
      activeId: active.id, 
      overId: over?.id,
      overIdType: typeof over?.id,
      overIdString: over?.id?.toString()
    });
    console.log('Available quarters:', quarters.map(q => ({ id: q.id, name: q.name })));
    
    if (!over) {
      console.log('No drop target detected');
      return;
    }
    
    const draggedEpic = (epics || []).find(e => e.id === active.id);
    if (!draggedEpic) {
      console.log('Dragged epic not found:', active.id);
      return;
    }

    console.log('Processing drop on:', over.id);
    
    // Check if dropping on backlog first
    if (over.id === 'backlog') {
      // Moving back to backlog
      updateEpic(draggedEpic.id, { 
        status: 'backlog', 
        quarterId: undefined, 
        position: undefined 
      });
      setActiveId(null);
      return;
    }
    
    // Check if dropping on a quarter
    const overIdStr = over.id.toString();
    let quarter = null;
    let quarterId: string | null = null;
    
    // First check if it's explicitly a quarter droppable (prefixed with 'quarter-')
    if (overIdStr.startsWith('quarter-')) {
      quarterId = overIdStr.replace('quarter-', '');
      quarter = (quarters || []).find(q => q.id === quarterId);
      console.log('Found quarter droppable, ID:', quarterId);
    } 
    // Otherwise, check if the ID matches a quarter ID (but not an epic ID)
    else {
      // Make sure it's not an epic ID
      const isEpicId = (epics || []).some(e => e.id === overIdStr);
      if (!isEpicId) {
        quarter = (quarters || []).find(q => q.id === overIdStr);
        if (quarter) {
          quarterId = quarter.id;
          console.log('Found quarter by direct ID match:', quarterId);
        }
      } else {
        console.log('Dropped on epic with ID:', overIdStr);
      }
    }
    
    if (quarter) {
      console.log('Found quarter:', quarter.name);
      // Check capacity before adding
      const quarterEpics = (epics || []).filter(e => e.quarterId === quarterId);
      const capacity = calculateTeamCapacity(team!, quarterEpics);
      const epicSize = TSHIRT_SIZE_DAYS[draggedEpic.size];
      
      if (capacity.remainingCapacity >= epicSize) {
        // Update epic with new quarter assignment
        const maxPosition = Math.max(...quarterEpics.map(e => e.position || 0), 0);
        updateEpic(draggedEpic.id, { 
          status: 'planned', 
          quarterId: quarterId || undefined, 
          position: maxPosition + 1 
        });
      } else {
        alert('Not enough capacity in this quarter');
      }
    } else {
      console.log('No valid drop target found for ID:', over.id);
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

  const handleSaveEpic = async (epic: Epic) => {
    if (editingEpic) {
      await updateEpic(epic.id, epic);
    } else {
      await createEpic(epic);
    }
    setIsEpicFormOpen(false);
    setEditingEpic(undefined);
  };

  const handleAddQuarter = () => {
    setEditingQuarter(undefined);
    setIsQuarterFormOpen(true);
  };

  const handleSaveQuarter = async (quarter: Quarter) => {
    if (editingQuarter) {
      await updateQuarter(quarter.id, quarter);
    } else {
      await createQuarter(quarter);
    }
    setIsQuarterFormOpen(false);
    setEditingQuarter(undefined);
  };

  const handleToggleCollapse = async (quarterId: string) => {
    const quarter = (quarters || []).find(q => q.id === quarterId);
    if (quarter) {
      await updateQuarter(quarterId, { 
        isCollapsed: !quarter.isCollapsed 
      });
    }
  };

  const handleQuarterAction = async (quarterId: string, action: string) => {
    switch (action) {
      case 'edit':
        const quarter = (quarters || []).find(q => q.id === quarterId);
        if (quarter) {
          setEditingQuarter(quarter);
          setIsQuarterFormOpen(true);
        }
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this quarter? All epics will be moved back to backlog.')) {
          // Move all epics back to backlog
          const quarterEpics = (epics || []).filter(e => e.quarterId === quarterId);
          for (const epic of quarterEpics) {
            await updateEpic(epic.id, { 
              status: 'backlog', 
              quarterId: undefined, 
              position: undefined 
            });
          }
          // Delete the quarter
          await deleteQuarter(quarterId);
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
    a.download = `roadmapster-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implement import functionality with Supabase
    alert('Import functionality will be available soon!');
  };

  const activeEpic = epics?.find(e => e.id === activeId);

  // Show loading state while data is being fetched
  if (!isHydrated || teamLoading || epicsLoading || quartersLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  // Show team creation screen if no team exists
  if (!team) {
    return (
      <div className="app">
        <div className="no-team-container">
          <h2>Welcome to Roadmapster!</h2>
          <p>Let's set up your team to get started.</p>
          <button onClick={() => setIsTeamConfigOpen(true)} className="primary-button">
            Create Your Team
          </button>
        </div>
        
        <TeamConfiguration
          team={null}
          onTeamUpdate={async (newTeam) => {
            try {
              await createTeam(newTeam);
              setIsTeamConfigOpen(false);
            } catch (err: any) {
              alert(err.message || 'Failed to create team. Please try again.');
            }
          }}
          isOpen={isTeamConfigOpen}
          onClose={() => setIsTeamConfigOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-header">
        <h2 className="app-title">Roadmapster</h2>
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
          {user && (
            <>
              <div className="toolbar-divider" />
              <div className="user-menu">
                <span className="user-email">
                  <User size={16} />
                  {user.email}
                </span>
                <button onClick={signOut} className="toolbar-button">
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
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
            epics={epics || []}
            onAddEpic={handleAddEpic}
            onEditEpic={handleEditEpic}
          />
          
          <QuartersPanel
            quarters={quarters || []}
            epics={epics || []}
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
        onTeamUpdate={async (updatedTeam) => {
          if (team) {
            await updateTeam(team.id, updatedTeam);
          } else {
            await createTeam(updatedTeam);
          }
        }}
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
        existingQuarters={quarters}
        onSave={handleSaveQuarter}
        onCancel={() => setIsQuarterFormOpen(false)}
        isOpen={isQuarterFormOpen}
        teamId={team.id}
      />
    </div>
  );
}