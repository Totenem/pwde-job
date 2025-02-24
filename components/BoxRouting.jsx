// Import required components and libraries
import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import icons from '../constants/icons'

// BoxRouting component - A reusable navigation button with icon and text
// Props:
// - title: Text to display in the button
// - handlePress: Function to execute when button is pressed
// - containerStyles: Additional styles for the button container
// - textStyles: Additional styles for the button text
// - isLoading: Boolean to indicate loading state
// - icon: Icon to display next to the text
const BoxRouting = ({title, handlePress, containerStyles, textStyles, isLoading, icon}) => {
  return (
    <TouchableOpacity 
     onPress={handlePress}
     activeOpacity={0.7}
     className = {`bg-[#114640] rounded-xl min-h-[62px] px-4 justify-center ${containerStyles} ${isLoading ? 'opacity-50': ''}`}>
      <View className="flex-row items-center">
        <Image 
          source={icon}
          className="w-6 h-6 mr-3"
          resizeMode="contain"
        />
        <Text className={`font-lexend-bold text-2xl text-white ${textStyles}`}>{title}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default BoxRouting