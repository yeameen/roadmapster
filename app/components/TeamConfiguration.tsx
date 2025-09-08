'use client';

import React, { useState } from 'react';
import { Team, TeamMember } from '../types';
import { X, Plus, Users } from 'lucide-react';

interface TeamConfigurationProps {
  team: Team;
  onTeamUpdate: (team: Team) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const TeamConfiguration: React.FC<TeamConfigurationProps> = ({
  team,
  onTeamUpdate,
  isOpen,
  onClose,
}) => {
  const [editedTeam, setEditedTeam] = useState<Team>(team);
  const [newMemberName, setNewMemberName] = useState('');

  // Reset editedTeam when modal opens with current team data
  React.useEffect(() => {
    if (isOpen) {
      setEditedTeam(team);
    }
  }, [isOpen, team]);

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: newMemberName,
        vacationDays: 0,
        skills: [],
      };
      setEditedTeam({
        ...editedTeam,
        members: [...editedTeam.members, newMember],
      });
      setNewMemberName('');
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setEditedTeam({
      ...editedTeam,
      members: editedTeam.members.filter(m => m.id !== memberId),
    });
  };

  const handleMemberVacationChange = (memberId: string, vacationDays: number) => {
    setEditedTeam({
      ...editedTeam,
      members: editedTeam.members.map(m =>
        m.id === memberId ? { ...m, vacationDays } : m
      ),
    });
  };

  const handleSave = () => {
    onTeamUpdate(editedTeam);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            <Users className="inline mr-2" size={24} />
            Team Configuration
          </h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="config-section">
            <h3>Quarter Settings</h3>
            <div className="form-group">
              <label htmlFor="team-name">Quarter</label>
              <input
                id="team-name"
                data-testid="team-name-input"
                type="text"
                value={editedTeam.name}
                onChange={(e) => setEditedTeam({ ...editedTeam, name: e.target.value })}
                placeholder="Q2 2025"
              />
            </div>
            <div className="form-group">
              <label htmlFor="working-days">Working Days This Quarter</label>
              <input
                id="working-days"
                data-testid="working-days-input"
                type="number"
                value={editedTeam.quarterWorkingDays}
                onChange={(e) =>
                  setEditedTeam({
                    ...editedTeam,
                    quarterWorkingDays: parseInt(e.target.value) || 65,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="buffer-percentage">Buffer Percentage</label>
              <input
                id="buffer-percentage"
                data-testid="buffer-percentage-input"
                type="number"
                value={editedTeam.bufferPercentage * 100}
                onChange={(e) =>
                  setEditedTeam({
                    ...editedTeam,
                    bufferPercentage: (parseInt(e.target.value) || 20) / 100,
                  })
                }
                min="0"
                max="100"
              />
              <span className="input-suffix">%</span>
            </div>
            <div className="form-group">
              <label htmlFor="oncall-per-sprint">Oncall per Sprint</label>
              <input
                id="oncall-per-sprint"
                data-testid="oncall-per-sprint-input"
                type="number"
                value={editedTeam.oncallPerSprint}
                onChange={(e) =>
                  setEditedTeam({
                    ...editedTeam,
                    oncallPerSprint: parseInt(e.target.value) || 1,
                  })
                }
                min="0"
              />
              <span className="input-suffix">person(s)</span>
            </div>
            <div className="form-group">
              <label htmlFor="sprints-in-quarter">Sprints in Quarter</label>
              <input
                id="sprints-in-quarter"
                data-testid="sprints-in-quarter-input"
                type="number"
                value={editedTeam.sprintsInQuarter}
                onChange={(e) =>
                  setEditedTeam({
                    ...editedTeam,
                    sprintsInQuarter: parseInt(e.target.value) || 6,
                  })
                }
                min="1"
              />
            </div>
          </div>

          <div className="config-section">
            <h3>Team Members</h3>
            <div className="members-list">
              {editedTeam.members.map((member) => (
                <div key={member.id} className="member-item">
                  <span className="member-name">{member.name}</span>
                  <div className="member-controls">
                    <label>Vacation Days:</label>
                    <input
                      type="number"
                      value={member.vacationDays}
                      onChange={(e) =>
                        handleMemberVacationChange(
                          member.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      max={editedTeam.quarterWorkingDays}
                      className="vacation-input"
                    />
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="remove-member"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="add-member">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Member name"
                onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
              />
              <button onClick={handleAddMember} className="add-button">
                <Plus size={20} />
                Add Member
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button onClick={handleSave} className="save-button">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};