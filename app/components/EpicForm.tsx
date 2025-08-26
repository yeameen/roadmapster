'use client';

import React, { useState, useEffect } from 'react';
import { Epic, TShirtSize, Priority } from '../types';
import { X, Save } from 'lucide-react';

interface EpicFormProps {
  epic?: Epic;
  onSave: (epic: Epic) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const EpicForm: React.FC<EpicFormProps> = ({ epic, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState<Partial<Epic>>({
    title: '',
    size: 'M',
    priority: 'P1',
    description: '',
    requiredSkills: [],
    dependencies: [],
    status: 'backlog',
  });

  useEffect(() => {
    if (epic) {
      setFormData(epic);
    } else {
      setFormData({
        title: '',
        size: 'M',
        priority: 'P1',
        description: '',
        requiredSkills: [],
        dependencies: [],
        status: 'backlog',
      });
    }
  }, [epic]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title?.trim()) {
      const epicToSave: Epic = {
        id: epic?.id || Date.now().toString(),
        title: formData.title!,
        size: formData.size as TShirtSize,
        priority: formData.priority as Priority,
        description: formData.description,
        requiredSkills: formData.requiredSkills,
        dependencies: formData.dependencies,
        status: formData.status || 'backlog',
      };
      onSave(epicToSave);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content epic-form">
        <div className="modal-header">
          <h2>{epic ? 'Edit Epic' : 'New Epic'}</h2>
          <button onClick={onCancel} className="close-button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Epic title"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="size">T-Shirt Size *</label>
                <select
                  id="size"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value as TShirtSize })}
                >
                  <option value="XS">XS (5 days)</option>
                  <option value="S">S (10 days)</option>
                  <option value="M">M (20 days)</option>
                  <option value="L">L (40 days)</option>
                  <option value="XL">XL (60+ days)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority *</label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                >
                  <option value="P0">P0 - Critical</option>
                  <option value="P1">P1 - High</option>
                  <option value="P2">P2 - Medium</option>
                  <option value="P3">P3 - Low</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Epic description"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="owner">Owner/Lead</label>
              <input
                id="owner"
                type="text"
                value={formData.owner || ''}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="Epic owner"
              />
            </div>

            <div className="form-group">
              <label htmlFor="skills">Required Skills (comma-separated)</label>
              <input
                id="skills"
                type="text"
                value={formData.requiredSkills?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requiredSkills: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter((s) => s),
                  })
                }
                placeholder="e.g., React, Node.js, PostgreSQL"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onCancel} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              <Save size={16} />
              {epic ? 'Update Epic' : 'Create Epic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};