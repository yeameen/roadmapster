'use client';

import React, { useState } from 'react';
import { Team, TeamMember } from '../types';
import { X, Plus, Users } from 'lucide-react';

interface TeamConfigurationProps {
  team: Team | null;
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
  const defaultTeam: Team = {
    id: 'new',
    name: `Team ${new Date().toLocaleDateString()}`,
    quarterWorkingDays: 65,
    bufferPercentage: 0.2,
    oncallPerSprint: 1,
    sprintsInQuarter: 6,
    members: [],
  };

  const [editedTeam, setEditedTeam] = useState<Team>(team || defaultTeam);
  const [newMemberName, setNewMemberName] = useState('');
  const isCreating = !team;

  // Reset editedTeam when modal opens with current team data
  React.useEffect(() => {
    if (isOpen) {
      setEditedTeam(team || defaultTeam);
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
            {isCreating ? 'Create Your Team' : 'Team Configuration'}
          </h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="config-section">
            <h3>Team Settings</h3>
            <div className="form-group">
              <label htmlFor="team-name">Team Name</label>
              <input
                id="team-name"
                data-testid="team-name-input"
                type="text"
                value={editedTeam.name}
                onChange={(e) => setEditedTeam({ ...editedTeam, name: e.target.value })}
                placeholder="Engineering Team"
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
                    bufferPercentage: (parseInt(e.target.value) || 0) / 100,
                  })
                }
                min="0"
                max="100"
              />
              <span className="input-suffix">%</span>
            </div>
            <div className="form-group">
              <label htmlFor="oncall-overhead">Oncall Overhead</label>
              <input
                id="oncall-overhead"
                data-testid="oncall-overhead-input"
                type="number"
                value={editedTeam.oncallPerSprint}
                onChange={(e) =>
                  setEditedTeam({
                    ...editedTeam,
                    oncallPerSprint: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
                max="10"
              />
              <span className="input-suffix">person(s)</span>
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
            {isCreating ? 'Create Team' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};