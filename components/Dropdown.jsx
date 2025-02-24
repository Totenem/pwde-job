import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView, Modal, Pressable } from 'react-native';

const Dropdown = ({ otherStyles, title, options, placeholder = 'Select an option', onSelect, value }) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [isDropdownVisible, setDropdownVisible] = useState(false);
  
    useEffect(() => {
      if (value !== undefined) {
        setInputValue(value);
      }
    }, [value]);

    const filteredOptions = options.filter(option =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
  
    return (
      <View className={`${otherStyles || ''}`}>
        {title && <Text className="text-base text-tcolor font-lexend-bold mb-2">{title}</Text>}
        <View>
          <TextInput
            className="text-tcolor font-lexend-semibold text-base border-2 w-full h-12 px-4 bg-inputField rounded-xl"
            placeholder={placeholder}
            value={inputValue}
            onChangeText={text => {
              setInputValue(text);
              setDropdownVisible(true);
            }}
            onFocus={() => setDropdownVisible(true)}
          />
          
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
                <Pressable>
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
                  </ScrollView>
                </Pressable>
              </View>
            </Pressable>
          </Modal>
        </View>
      </View>
    );
  };

export default Dropdown