import { View, Text, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../../components/CustomButton'
import InputField from '../../components/InputField'
import ToggleSwitch from '../../components/ToggleSwitch'

const Security = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [profilePublic, setProfilePublic] = useState(true)

  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{height: '100%'}}>
        <View className="w-full justify-center h-auto px-4 my-4 min-h-[85vh]">
          <Text className="font-lexend-bold text-3xl">Security</Text>

          <View className="mt-7">
            <InputField
              title="Current Password"
              placeholder="Enter current password"
              editType={true}
              secureTextEntry={true}
            />
            <InputField
              title="New Password"
              placeholder="Enter new password"
              editType={true}
              secureTextEntry={true}
            />
            <InputField
              title="Confirm New Password"
              placeholder="Confirm new password"
              editType={true}
              secureTextEntry={true}
            />
          </View>

          <CustomButton
            title="CHANGE PASSWORD"
            handlePress={() => console.log('Change password')}
            containerStyles="w-full mt-7"
            textStyles="font-lexend-bold"
          />

          <View className="mt-7">
            <Text className="font-lexend-bold text-xl mb-4">Privacy Settings</Text>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-lexend text-base">Two-Factor Authentication</Text>
              <ToggleSwitch
                isEnabled={twoFactorEnabled}
                onToggle={() => setTwoFactorEnabled(!twoFactorEnabled)}
              />
            </View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-lexend text-base">Profile Visibility</Text>
              <ToggleSwitch
                isEnabled={profilePublic}
                onToggle={() => setProfilePublic(!profilePublic)}
              />
            </View>
          </View>

          <CustomButton
            title="SAVE CHANGES"
            handlePress={() => console.log('Save privacy settings')}
            containerStyles="w-full mt-7"
            textStyles="font-lexend-bold"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Security