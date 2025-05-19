'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { ExerciseEntry } from '@/lib/types';
import FormInput from '@/components/FormInput';

interface ExerciseFormProps {
  isOpen: boolean;
  onClose: () => void;
  exercise?: ExerciseEntry;
  onSave: (exercise: ExerciseEntry) => void;
  isEditing: boolean;
}

export default function ExerciseForm({
  isOpen,
  onClose,
  exercise,
  onSave,
  isEditing
}: ExerciseFormProps) {
  const defaultExercise: ExerciseEntry = {
    name: '',
    sets: 3,
    reps: '8-10',
    weight: '',
    note: ''
  };

  const [formData, setFormData] = useState<ExerciseEntry>(
    exercise ? { ...exercise } : defaultExercise
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'sets') {
      // Convert to number for sets field
      setFormData({
        ...formData,
        [name]: parseInt(value) || 1 // Default to 1 if invalid input
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          {isEditing ? 'Edit Exercise' : 'Add New Exercise'}
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Exercise Name</Label>
              <FormInput
                id="name"
                name="name"
                value={formData.name}
                onValueChange={(value) => 
                  setFormData({
                    ...formData,
                    name: value
                  })
                }
                placeholder="e.g., Bench Press"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sets">Sets</Label>
                <Input
                  id="sets"
                  name="sets"
                  type="number"
                  min="1"
                  value={formData.sets}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setFormData({
                      ...formData,
                      sets: value
                    });
                  }}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="reps">Reps</Label>
                <FormInput
                  id="reps"
                  name="reps"
                  value={formData.reps}
                  onValueChange={(value) => 
                    setFormData({
                      ...formData,
                      reps: value
                    })
                  }
                  placeholder="e.g., 8-10 or AMRAP"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="weight">Weight / Time</Label>
              <FormInput
                id="weight"
                name="weight"
                value={formData.weight || ''}
                onValueChange={(value) => 
                  setFormData({
                    ...formData,
                    weight: value
                  })
                }
                placeholder="e.g., 100 lbs or 30 min"
              />
            </div>
            
            <div>
              <Label htmlFor="note">Notes</Label>
              <FormInput
                id="note"
                name="note"
                value={formData.note}
                onValueChange={(value) => 
                  setFormData({
                    ...formData,
                    note: value
                  })
                }
                placeholder="RIR / form cues"
              />
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          
          <Button type="submit">
            Save
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}