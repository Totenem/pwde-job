import { View, Text, TextInput } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'

/**
 * JobModalBigInputField Component
 * A specialized multi-line input field component for the CreateJobModal
 * that maintains focus during typing
 * 
 * @param {string} title - The title of the input field
 * @param {string} value - The current value of the input field
 * @param {string} placeholder - Placeholder text for the input field
 * @param {Function} handleChangeText - Callback function when text changes
 * @param {string} otherStyles - Additional styles to apply to the component
 * @param {string} inputViewSize - Custom size for the input field
 */
const JobModalBigInputField = ({ 
  title, 
  value, 
  placeholder, 
  handleChangeText, 
  otherStyles,
  inputViewSize = 'h-32 p-4',
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

      <View className={`border-2 w-full bg-inputField rounded-2xl flex-row ${inputViewSize}`}>
        <TextInput
          ref={inputRef}
          multiline={true}
          textAlignVertical='top'
          className={`flex-1 text-tcolor font-lexend-semibold text-base`}
          value={localValue}
          placeholder={placeholder}
          placeholderTextColor="#424242"
          onChangeText={onChangeText}
          {...props}
        />
      </View>
    </View>
  )
}

export default JobModalBigInputField