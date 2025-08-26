'use client';

import React, { useState, useEffect } from 'react';
import { Quarter, QuarterStatus } from '../types';
import { X, Save } from 'lucide-react';

interface QuarterFormProps {
  quarter?: Quarter;
  existingQuarters?: Quarter[];
  onSave: (quarter: Quarter) => void;
  onCancel: () => void;
  isOpen: boolean;
  teamId: string;
}

export const QuarterForm: React.FC<QuarterFormProps> = ({
  quarter,
  existingQuarters = [],
  onSave,
  onCancel,
  isOpen,
  teamId,
}) => {
  const [formData, setFormData] = useState<Partial<Quarter>>({
    name: '',
    status: 'planning',
    workingDays: 65,
    teamId: teamId,
  });

  useEffect(() => {
    if (quarter) {
      setFormData(quarter);
    } else {
      // Generate default quarter name based on current date
      const now = new Date();
      const currentQuarter = Math.floor((now.getMonth() / 3)) + 1;
      const year = now.getFullYear();
      setFormData({
        name: `Q${currentQuarter} ${year}`,
        status: 'planning',
        workingDays: 65,
        teamId: teamId,
      });
    }
  }, [quarter, teamId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a sequential ID based on existing quarters
    const generateQuarterId = () => {
      // Find the highest numeric ID and increment it
      const numericIds = existingQuarters
        .map(q => parseInt(q.id))
        .filter(id => !isNaN(id));
      
      const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
      return (maxId + 1).toString();
    };
    
    const quarterData: Quarter = {
      id: quarter?.id || generateQuarterId(),
      name: formData.name || '',
      status: formData.status || 'planning',
      workingDays: formData.workingDays || 65,
      teamId: teamId,
      isCollapsed: false,
    };
    
    onSave(quarterData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{quarter ? 'Edit Quarter' : 'Create Quarter'}</h2>
          <button onClick={onCancel} className="close-button">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="quarter-form">
          <div className="form-group">
            <label htmlFor="name">
              Quarter Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Q2 2025"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="workingDays">
                Working Days per Person *
              </label>
              <input
                id="workingDays"
                type="number"
                value={formData.workingDays}
                onChange={(e) => setFormData({ ...formData, workingDays: parseInt(e.target.value) })}
                min="1"
                max="100"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="status">
                Status *
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as QuarterStatus })}
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">
                Start Date (Optional)
              </label>
              <input
                id="startDate"
                type="date"
                value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value ? new Date(e.target.value) : undefined })}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">
                End Date (Optional)
              </label>
              <input
                id="endDate"
                type="date"
                value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value ? new Date(e.target.value) : undefined })}
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              <Save size={16} />
              {quarter ? 'Update Quarter' : 'Create Quarter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};