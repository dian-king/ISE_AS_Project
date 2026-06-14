'use client';

import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { API_BASE_URL } from '../lib/api';

interface ScheduleModalProps {
  applicationId: string;
  applicantName: string;
  onClose: () => void;
  onScheduled: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ applicationId, applicantName, onClose, onScheduled }) => {
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          applicationId,
          interviewDate: new Date(date).toISOString(),
          location,
          notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to schedule');
      
      alert('Interview Scheduled!');
      onScheduled();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Schedule Interview for {applicantName}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Date & Time" 
            type="datetime-local" 
            required 
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input 
            label="Location / Link" 
            placeholder="Room 101 or Zoom Link" 
            required 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Notes</label>
            <textarea 
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Schedule</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
