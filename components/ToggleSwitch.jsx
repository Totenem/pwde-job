import { View, TouchableOpacity, Animated } from 'react-native'
import React, { useState, useEffect } from 'react'

const ToggleSwitch = ({ isEnabled, onToggle, activeColor = '#4CAF50', inactiveColor = '#767577' }) => {
  const [toggleAnim] = useState(new Animated.Value(isEnabled ? 1 : 0))

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: isEnabled ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [isEnabled])

  const translateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 24],
  })

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
    >
      <View
        className="w-12 h-6 rounded-full justify-center"
        style={{
          backgroundColor: isEnabled ? activeColor : inactiveColor,
        }}
      >
        <Animated.View
          className="w-5 h-5 rounded-full bg-white"
          style={{
            transform: [{ translateX }],
          }}
        />
      </View>
    </TouchableOpacity>
  )
}

export default ToggleSwitch