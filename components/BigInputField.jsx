import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useState } from 'react'
import icons  from '../constants/icons'

const BigInputField = ({inputViewSize, editType, title, value, placeholder, handleChangeText, otherStyles, ...props}) => {
    const [showPassword, setShowPassword] = useState(false)
    return (
      <View className= {`space-y-2 ${otherStyles}`}>
        <Text className="text-base text-tcolor font-lexend-bold">{title}</Text>
  
        <View className = {`border-2 w-full bg-inputField rounded-2xl flex-row ${inputViewSize}`}>
          <TextInput
            multiline ={true}
            textAlignVertical='top'
            className={`flex-1 text-tcolor font-lexend-semibold text-base ${inputViewSize}`}
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#424242"
            editable={editType}
            onChangeText={handleChangeText}
            secureTextEntry={(title === 'Password' || title === 'Confirm Password') && !showPassword}
          />
  
          {/* Password hiding icon and fucntionality
          {(title === 'Password' || title === 'Confirm Password') && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Image 
              source={!showPassword ? icons.eye : icons.eyeHide} 
              className = "w-12 h-12 mt-1"
              />
            </TouchableOpacity>
          )}
          Showing Icon for Title equals to Name
          {(title === 'Name') && (
              <Image 
              source={icons.podlock} 
              className = "w-12 h-12 mt-1"
              />
          )}
          {(placeholder === 'Upload Here' || placeholder === 'Front' || placeholder === 'Back') && (
              <Image 
              source={icons.plus} 
              className = "w-12 h-12 mt-1"
              />
          )} */}
        </View>
      </View>
    )
}

export default BigInputField