import { View, Text, ScrollView,} from 'react-native'
import React, { useState, useEffect } from 'react'
import InputField from '../../components/InputField'
import CustomButton from '../../components/CustomButton'
import Dropdown from '../../components/Dropdown'
import ProfilePicture from '../../components/ProfilePicture'
import EmployerIdUpload from '../../components/EmployerIdUpload'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { supabase } from '../../lib/supabase'

const AdditionalInfoEmployer = () => {
  const [userData, setUserData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableSkills, setAvailableSkills] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [uploadError, setUploadError] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [employerIdUrl, setEmployerIdUrl] = useState(null)
  // Fetch necessary data on component mount
  useEffect(() => {
    fetchUserProfile()
    fetchAvailableSkills()
  }, [])
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
  const handleSkillSelect = (skill, index) => {
    const newSelectedSkills = [...selectedSkills]
    newSelectedSkills[index] = skill
    setSelectedSkills(newSelectedSkills)
  }
  const handleSubmit = async () => {
    if (!employerIdUrl) {
      setUploadError('Please upload your employer ID')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw new Error('Error getting session: ' + sessionError.message)
      if (!session?.user?.id) throw new Error('No active session. Please sign in again.')

      const userId = session.user.id

      // Update profile with employer ID URL, avatar URL, and selected skills
      const updateData = {
        employer_id: employerIdUrl,
        skills: selectedSkills.filter(Boolean)
      }

      if (avatarUrl) {
        updateData.avatar_url = avatarUrl
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)

      if (updateError) throw updateError

      await SecureStore.deleteItemAsync('employerIdFile')
      router.push('/home')
    } catch (error) {
      console.error('Error during submission:', error)
      setUploadError(error.message || 'Error updating profile')
    } finally {
      setIsSubmitting(false)
    }
  }
  const skip = () => {
    router.push('/home')
  }
  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{ flexGrow: 1}}>
        <View className="w-full justify-center h-auto px-4 my-4 min-h-[90vh]">
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

          <EmployerIdUpload
            onFileSelect={setEmployerIdUrl}
            onError={setUploadError}
            initialValue={userData?.employer_id}
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

          {uploadError && (
            <Text className="text-red-500 text-center mt-2">{uploadError}</Text>
          )}

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

export default AdditionalInfoEmployer