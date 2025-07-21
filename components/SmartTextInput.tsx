import React, { useRef, useEffect } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import designSystem from '@/styles/designSystem';

interface SmartTextInputProps extends TextInputProps {
  fieldTracker?: {
    registerField: (id: string, ref: any) => void;
    handleFieldFocus: (id: string) => void;
  };
  fieldId?: string;
}

export default function SmartTextInput({
  fieldTracker,
  fieldId,
  style,
  onFocus,
  onBlur,
  ...textInputProps
}: SmartTextInputProps) {
  const inputRef = useRef<TextInput>(null);
  const uniqueId = fieldId || `field_${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (fieldTracker && inputRef.current) {
      fieldTracker.registerField(uniqueId, inputRef.current);
    }
  }, [fieldTracker, uniqueId]);

  const handleFocus = (event: any) => {
    if (fieldTracker) {
      fieldTracker.handleFieldFocus(uniqueId);
    }
    onFocus?.(event);
  };

  const handleBlur = (event: any) => {
    onBlur?.(event);
  };

  return (
    <TextInput
      ref={inputRef}
      style={[styles.textInput, style]}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...textInputProps}
    />
  );
}

const styles = StyleSheet.create({
  textInput: {
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    borderRadius: designSystem.interactive.border.radius,
    padding: 14,
    ...designSystem.componentStyles.textPrimary,
    backgroundColor: designSystem.colors.background.secondary,
    minHeight: 48,
    lineHeight: 20,
    ...designSystem.shadows.low,
  },
});