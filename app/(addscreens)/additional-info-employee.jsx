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

  // Fetch necessary data on component mount
  useEffect(() => {
    fetchUserProfile()
    fetchAvailableSkills()
  }, [])

  /**
   * Fetch user profile data from Supabase
   */
  const fetchUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) throw error
        if (data) setUserData(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  /**
   * Fetch available skills from Supabase
   */
  const fetchAvailableSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('id, name, category')
        .order('category', { ascending: true })

      if (error) throw error
      if (data) setAvailableSkills(data)
    } catch (error) {
      console.error('Error fetching skills:', error)
    }
  }

  /**
   * Handle skill selection for each dropdown
   */
  const handleSkillSelect = (skill, index) => {
    const newSelectedSkills = [...selectedSkills]
    newSelectedSkills[index] = skill
    setSelectedSkills(newSelectedSkills)
  }

  /**
   * Handle form submission
   * Uploads resume and updates profile with skills
   */
  const handleSubmit = async () => {
    if (!resumeFile) {
      setUploadError('Please upload your resume')
      return
    }

    setIsSubmitting(true)
    try {
      // Get current session and check if valid
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw new Error('Error getting session: ' + sessionError.message)
      if (!session?.user?.id) throw new Error('No active session. Please sign in again.')

      const userId = session.user.id
      const filePath = `${userId}/${resumeFile.name}`

      const formData = new FormData()
      formData.append('file', {
        uri: resumeFile.uri,
        type: resumeFile.mimeType,
        name: resumeFile.name
      })

      // Upload resume to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, formData)

      if (uploadError) throw uploadError

      // Update profile with resume URL and selected skills
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          resume_url: filePath,
          skills: selectedSkills.filter(Boolean)
        })
        .eq('id', userId)

      if (updateError) throw updateError

      // Update profile with avatar URL if available
      if (avatarUrl) {
        const { error: avatarError } = await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', userId)

        if (avatarError) throw avatarError
      }

      // Update profile with front ID URL if available
      if (frontIdUrl) {
        const { error: frontIdError } = await supabase
          .from('profiles')
          .update({ front_id_url: frontIdUrl })
          .eq('id', userId)

        if (frontIdError) throw frontIdError
      }

      // Update profile with back ID URL if available
      if (backIdUrl) {
        const { error: backIdError } = await supabase
          .from('profiles')
          .update({ back_id_url: backIdUrl })
          .eq('id', userId)

        if (backIdError) throw backIdError
      }

      await SecureStore.deleteItemAsync('resumeFile')
      router.push('/home')
    } catch (error) {
      console.error('Error during submission:', error)
      setUploadError(error.message || 'Error uploading resume')
    } finally {
      setIsSubmitting(false)
    }
  }

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
            value={userData?.full_name}
            placeholder={'John Doe'}
            editType={false}
          />

          <ProfilePicture
            onImageSelect={setAvatarUrl}
            onError={setUploadError}
            initialImageUrl={userData?.avatar_url}
            isSubmitting={isSubmitting}
            userId={userData?.id}
          />
  
          <ResumeUpload
            onFileSelect={setResumeFile}
            onError={setUploadError}
            initialValue={resumeFile}
            isSubmitting={isSubmitting}
          />

          <FrontIdUpload
            onFileSelect={setFrontIdUrl}
            onError={setUploadError}
            initialValue={userData?.front_id_url}
            isSubmitting={isSubmitting}
            userId={userData?.id}
          />

          <BackIdUpload
            onFileSelect={setBackIdUrl}
            onError={setUploadError}
            initialValue={userData?.back_id_url}
            isSubmitting={isSubmitting}
            userId={userData?.id}
          />
  
          <View className="mt-2">
            <Dropdown
              otherStyles='mt-5'
              title='SELECT SKILLS'
              options={availableSkills.map(skill => skill.name)}
              placeholder="Select a Skill"
              onSelect={(skill) => handleSkillSelect(skill, 0)}
              value={selectedSkills[0]}
            />
            <Dropdown
              options={availableSkills.map(skill => skill.name)}
              placeholder="Select a Skill"
              onSelect={(skill) => handleSkillSelect(skill, 1)}
              value={selectedSkills[1]}
            />
            <Dropdown
              options={availableSkills.map(skill => skill.name)}
              placeholder="Select a Skill"
              onSelect={(skill) => handleSkillSelect(skill, 2)}
              value={selectedSkills[2]}
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
              handlePress={handleSubmit}
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