import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView, TouchableWithoutFeedback } from 'react-native';

const Dropdown = ({ otherStyles, title, options, placeholder = 'Select an option', onSelect }) => {
    const [inputValue, setInputValue] = useState('');
    const [isDropdownVisible, setDropdownVisible] = useState(false);
  
    const filteredOptions = options.filter(option =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
  
    return (
      <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
        <View className={`${otherStyles}`}>
          <Text className="text-base text-tcolor font-lexend-bold">{title}</Text>
          <TextInput
            title={title}
            className=" text-tcolor font-lexend-semibold text-base border-2 w-full h-16 px-4 bg-inputField rounded-2xl flex-row"
            placeholder={placeholder}
            value={inputValue}
            onChangeText={text => {
              setInputValue(text);
              setDropdownVisible(true);
            }}
            onFocus={() => setDropdownVisible(true)}
          />
          
          {isDropdownVisible && (
            <View className="absolute top-12 w-full border border-gray-300 rounded-md bg-white shadow-md">
              <ScrollView
                nestedScrollEnabled
                className="max-h-40"
              >
                {filteredOptions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    className="px-3 py-2 border-b border-gray-200"
                    onPress={() => {
                      setInputValue(item);
                      setDropdownVisible(false);
                      onSelect && onSelect(item);
                    }}
                  >
                    <Text className="text-base">{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  };

export default Dropdown