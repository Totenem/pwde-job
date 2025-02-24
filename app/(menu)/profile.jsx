import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../../components/CustomButton'
import InputField from '../../components/InputField'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../lib/supabase'

const Profile = () => {
  const [image, setImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [userData, setUserData] = useState(null)

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
          setImage(data.avatar_url)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        presentationStyle: 0,
        selectionLimit: 1
      })
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0]
        if (asset.type !== 'image') {
          alert('Please select an image file')
          return
        }

        setUploading(true)
        await uploadImage(asset.uri)
      }
    } catch (error) {
      console.error('Error picking image:', error)
      alert('Failed to pick image. Please try again.')
    } finally {
      setUploading(false)
    }
  }
  const uploadImage = async (uri) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No user session')

      // Generate a unique file name with timestamp
      const timestamp = new Date().getTime()
      const fileExt = uri.split('.').pop()
      const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${session.user.id}/${fileName}`

      // Convert image to blob
      const response = await fetch(uri)
      const blob = await response.blob()

      // Delete old profile image if exists
      if (image) {
        const oldImagePath = image.split('/').pop()
        if (oldImagePath) {
          const { error: deleteError } = await supabase.storage
            .from('profile_images')
            .remove([`${session.user.id}/${oldImagePath}`])
          if (deleteError) console.warn('Error deleting old image:', deleteError)
        }
      }

      // Upload new image to profile_images bucket
      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL from profile_images bucket
      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath)

      if (urlError) throw urlError

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id)

      if (updateError) throw updateError

      setImage(publicUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    }
  }

  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{height: '100%'}}>
        <View className="w-full justify-center h-auto px-4 my-4 min-h-[85vh]">
          <Text className="font-lexend-bold text-3xl">Profile</Text>
          
          <TouchableOpacity onPress={pickImage} className="items-center mt-5">
            <Image
              source={image ? { uri: image } : require('../../assets/images/onboarding.png')}
              className="w-32 h-32 rounded-full"
              resizeMode="cover"
            />
            <Text className="font-lexend text-sm mt-2">{uploading ? 'Uploading...' : 'Tap to change profile picture'}</Text>
          </TouchableOpacity>

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
            handlePress={() => console.log('Edit profile')}
            containerStyles="w-full mt-7"
            textStyles="font-lexend-bold"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile