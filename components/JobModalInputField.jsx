import { View, Text, TextInput } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'

/**
 * JobModalInputField Component
 * A specialized input field component for the CreateJobModal
 * that maintains focus during typing
 * 
 * @param {string} title - The title of the input field
 * @param {string} value - The current value of the input field
 * @param {string} placeholder - Placeholder text for the input field
 * @param {Function} handleChangeText - Callback function when text changes
 * @param {string} keyboardType - Keyboard type for the input field
 * @param {string} otherStyles - Additional styles to apply to the component
 */
const JobModalInputField = ({ 
  title, 
  value, 
  placeholder, 
  handleChangeText, 
  keyboardType = 'default', 
  otherStyles,
  ...props 
}) => {
  const inputRef = useRef(null);
  // Use local state to manage the input value
  const [localValue, setLocalValue] = useState(value || '');
  
  // Update local value when prop value changes (but not during typing)
  // This is important for initial value and programmatic updates
  useRef(() => {
    if (value !== undefined && value !== localValue) {
      setLocalValue(value);
    }
  }).current(value);

  // Memoized change handler to prevent re-renders
  const onChangeText = useCallback((text) => {
    // Update local state immediately for responsive UI
    setLocalValue(text);
    
    // Notify parent component of the change
    if (handleChangeText) {
      handleChangeText(text);
    }
  }, [handleChangeText]);

  return (
    <View className={`space-y-2 ${otherStyles || ''}`}>
      {title && <Text className="text-base text-tcolor font-lexend-bold">{title}</Text>}

      <View className={`border-2 w-full h-16 px-4 bg-inputField rounded-2xl flex-row`}>
        <TextInput 
          ref={inputRef}
          className="flex-1 text-tcolor font-lexend-semibold text-base"
          value={localValue}
          placeholder={placeholder}
          placeholderTextColor="#424242"
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          {...props}
        />
      </View>
    </View>
  )
}

export default JobModalInputField