import { View, Text, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../../components/CustomButton'
import InputField from '../../components/InputField'
import ProfilePicture from '../../components/ProfilePicture'
import { supabase } from '../../lib/supabase'
import { router } from 'expo-router'

const Profile = () => {
  const [userData, setUserData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) throw error
        if (data) {
          setUserData(data)
          // setImage(data.avatar_url)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }


  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{height: '100%'}}>
        <View className="w-full justify-center h-auto px-4 my-4 min-h-[85vh]">
          <Text className="font-lexend-bold text-3xl">Profile</Text>

          <ProfilePicture
            onImageSelect={async (filePath) => {
              try {
                setIsSubmitting(true)
                const { error: updateError } = await supabase
                  .from('profiles')
                  .update({ avatar_url: filePath })
                  .eq('id', userData?.id)
                if (updateError) throw updateError
                // Refresh profile data
                fetchProfile()
              } catch (err) {
                setError(err.message)
              } finally {
                setIsSubmitting(false)
              }
            }}
            onError={setError}
            initialImageUrl={userData?.avatar_url}
            isSubmitting={isSubmitting}
            userId={userData?.id}
          />

          <View className="mt-7">
            <InputField
              title="Full Name"
              placeholder="John Doe"
              value={userData?.full_name}
              editType={false}
            />
            <InputField
              title="Email"
              placeholder="johndoe@example.com"
              value={userData?.email}
              editType={false}
            />
          </View>

          <CustomButton
            title="EDIT PROFILE"
            handlePress={() => router.push('/additional-info-employee')}
            containerStyles="w-full mt-7"
            textStyles="font-lexend-bold"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile