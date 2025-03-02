import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView, Modal, Pressable } from 'react-native';

/**
 * JobTypeDropdown Component
 * A specialized dropdown component for job type selection that fixes typing issues
 * 
 * @param {string} otherStyles - Additional styles to apply to the component
 * @param {string} title - The title of the dropdown
 * @param {Array} options - Array of options to display in the dropdown
 * @param {string} placeholder - Placeholder text for the input field
 * @param {Function} onSelect - Callback function when an option is selected
 * @param {string} value - The currently selected value
 */
const JobTypeDropdown = ({ otherStyles, title, options, placeholder = 'Select job type', onSelect, value }) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [isDropdownVisible, setDropdownVisible] = useState(false);
  
    // Update input value when the value prop changes
    useEffect(() => {
      if (value !== undefined) {
        setInputValue(value);
      }
    }, [value]);

    // Filter options based on input text
    const filteredOptions = options.filter(option =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
  
    return (
      <View className={`${otherStyles || ''}`}>
        {title && <Text className="text-base text-tcolor font-lexend-bold mb-2">{title}</Text>}
        <View>
          {/* Input field that shows the selected value or allows typing */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setDropdownVisible(true)}
          >
            <View className="text-tcolor font-lexend-semibold text-base border-2 w-full h-12 px-4 bg-inputField rounded-xl flex-row items-center justify-between">
              <Text className="font-lexend-semibold text-base">
                {inputValue || placeholder}
              </Text>
              <Text>▼</Text>
            </View>
          </TouchableOpacity>
          
          {/* Dropdown modal */}
          <Modal
            visible={isDropdownVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setDropdownVisible(false)}
          >
            <Pressable 
              className="flex-1 bg-black/50 justify-center items-center"
              onPress={() => setDropdownVisible(false)}
            >
              <View className="w-[80%] mx-4 bg-white rounded-2xl overflow-hidden">
                <View className="px-4 py-3 border-b border-gray-200">
                  <TextInput
                    className="text-base font-lexend px-2 py-1 border border-gray-300 rounded"
                    placeholder="Search..."
                    value={inputValue}
                    onChangeText={setInputValue}
                    autoFocus
                  />
                </View>
                <ScrollView
                  nestedScrollEnabled
                  className="max-h-80"
                >
                  {filteredOptions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      className="px-6 py-4 border-b border-gray-100 active:bg-gray-100"
                      onPress={() => {
                        setInputValue(item);
                        setDropdownVisible(false);
                        onSelect && onSelect(item);
                      }}
                    >
                      <Text className="text-base font-lexend text-center">{item}</Text>
                    </TouchableOpacity>
                  ))}
                  {filteredOptions.length === 0 && (
                    <Text className="text-center py-4 font-lexend text-gray-500">No options found</Text>
                  )}
                </ScrollView>
              </View>
            </Pressable>
          </Modal>
        </View>
      </View>
    );
  };

export default JobTypeDropdown;