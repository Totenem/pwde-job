import { View, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import InputField from '../../components/InputField'
import CustomButton from '../../components/CustomButton'
import Dropdown from '../../components/Dropdown'
import ResumeUpload from '../../components/ResumeUpload'
import ProfilePicture from '../../components/ProfilePicture'
import FrontIdUpload from '../../components/FrontIdUpload'
import BackIdUpload from '../../components/BackIdUpload'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { supabase } from '../../lib/supabase'

/**
 * AdditionalInfoEmployee Component
 * Handles additional information collection for employee profiles
 * including resume upload and skill selection
 */
const AdditionalInfoEmployee = () => {
  // State management
  const [userData, setUserData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableSkills, setAvailableSkills] = useState([])
  const [resumeFile, setResumeFile] = useState(null)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [uploadError, setUploadError] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [frontIdUrl, setFrontIdUrl] = useState(null)
  const [backIdUrl, setBackIdUrl] = useState(null)


  /**
   * Handle skip action
   */
  const skip = () => {
    router.push('/home')
  }

  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="w-full justify-center h-auto px-4 my-4 min-h-[85vh]">
          <InputField 
            title='Name'
            value={'John DoeYEE'}
            placeholder={'John Doe'}
            editType={false}
          />

          <ProfilePicture

          />
  
          <ResumeUpload

          />

          <FrontIdUpload

          />

          <BackIdUpload

          />
  
          <View className="mt-2">
            <Dropdown

            />
            <Dropdown

            />
            <Dropdown

            />
          </View>
          <View className="flex-row justify-center mt-5">
            <CustomButton 
              title="SKIP"
              handlePress={skip}
              containerStyles="w-44 mr-8"
              isLoading={isSubmitting}
              textStyles="font-lexend-bold"
            />
            <CustomButton 
              title="SAVE"
              handlePress={() => router.push('/home')}
              containerStyles="w-44"
              isLoading={isSubmitting}
              textStyles="font-lexend-bold"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default AdditionalInfoEmployee