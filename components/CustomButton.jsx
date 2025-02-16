import { TouchableOpacity, Text } from 'react-native'
import React from 'react'

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading}) => {
  return (
    <TouchableOpacity 
     onPress={handlePress}
     activeOpacity={0.7}
     className = {`bg-button rounded-xl min-h-[62px] px-4 justify-center items-center ${containerStyles} ${isLoading ? 'opacity-50': ''}`}>
      <Text className={`text-white text-2xl style ${textStyles}`}>{title}</Text>
    </TouchableOpacity>
  )
}

export default CustomButton