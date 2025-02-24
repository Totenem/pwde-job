import { View, Text, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../../components/CustomButton'
import ToggleSwitch from '../../components/ToggleSwitch'
import Dropdown from '../../components/Dropdown'

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkThemeEnabled, setDarkThemeEnabled] = useState(false)
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false)
  const [language, setLanguage] = useState('English')
  const [fontSize, setFontSize] = useState('Medium')

  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese']
  const fontSizes = ['Small', 'Medium', 'Large', 'Extra Large']

  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{height: '100%'}}>
        <View className="w-full justify-center h-auto px-4 my-4 min-h-[85vh]">
          <Text className="font-lexend-bold text-3xl">Settings</Text>

          <View className="mt-7">
            <Text className="font-lexend-bold text-xl mb-4">App Preferences</Text>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-lexend text-base">Notifications</Text>
              <ToggleSwitch
                isEnabled={notificationsEnabled}
                onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
              />
            </View>
            <Dropdown
              title="Language"
              options={languages}
              placeholder="Select Language"
              value={language}
              onSelect={setLanguage}
              otherStyles="mb-4"
            />
            <View className="flex-row justify-between items-center mb-4 mt-4">
              <Text className="font-lexend text-base">Dark Theme</Text>
              <ToggleSwitch
                isEnabled={darkThemeEnabled}
                onToggle={() => setDarkThemeEnabled(!darkThemeEnabled)}
              />
            </View>
          </View>

          <View className="mt-7">
            <Text className="font-lexend-bold text-xl mb-4">Accessibility</Text>
            <Dropdown
              title="Font Size"
              options={fontSizes}
              placeholder="Select Font Size"
              value={fontSize}
              onSelect={setFontSize}
              otherStyles="mb-4"
            />
            <View className="flex-row justify-between items-center mb-4 mt-4">
              <Text className="font-lexend text-base">Screen Reader</Text>
              <ToggleSwitch
                isEnabled={screenReaderEnabled}
                onToggle={() => setScreenReaderEnabled(!screenReaderEnabled)}
              />
            </View>
          </View>

          <CustomButton
            title="SAVE PREFERENCES"
            handlePress={() => console.log('Save preferences', { language, fontSize })}
            containerStyles="w-full mt-7"
            textStyles="font-lexend-bold"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Settings