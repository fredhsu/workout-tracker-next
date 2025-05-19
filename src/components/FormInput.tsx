'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onValueChange: (value: string) => void;
}

/**
 * A component that wraps Input to maintain focus during value updates
 * This prevents the character deletion/re-addition effect during typing
 */
export default function FormInput({ 
  value, 
  onValueChange, 
  ...props 
}: FormInputProps) {
  // Local state to track input value
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Update local value when the parent value changes, but only if not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value);
    }
  }, [value, isFocused]);
  
  // Handle change in the local input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onValueChange(newValue);
  };
  
  // Track focus state
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    // Sync with parent value on blur
    setLocalValue(value);
  };
  
  return (
    <Input
      ref={inputRef}
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
}