import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../lib/supabase'

/**
 * ProfilePicture Component
 * Handles profile image selection, preview, and upload functionality
 * 
 * @param {Object} props
 * @param {Function} props.onImageSelect - Callback function when an image is selected
 * @param {Function} props.onError - Callback function for error handling
 * @param {string} props.initialImageUrl - Initial profile image URL (if any)
 * @param {boolean} props.isSubmitting - Flag to indicate if form is being submitted
 * @param {string} props.userId - User ID for storage path
 */
const ProfilePicture = ({ onImageSelect, onError, initialImageUrl, isSubmitting, userId }) => {
  const [imageUrl, setImageUrl] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  useEffect(() => {
    if (initialImageUrl) {
      // Ensure we have a valid URL by constructing it properly
      const { data } = supabase.storage
        .from('profile_picture')
        .getPublicUrl(initialImageUrl)
      const publicUrl = data?.publicUrl
    //   console.log('Initial Image URL:', initialImageUrl)
    //   console.log('Constructed Public URL:', publicUrl)
      setImageUrl(publicUrl)
    }
  }, [initialImageUrl])

  /**
   * Handle image selection and validation
   */
  const handleImageSelect = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permissionResult.granted) {
        throw new Error('Permission to access media library was denied')
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (result.canceled) return

      const asset = result.assets[0]
      
      // Validate file size (2MB limit)
      const response = await fetch(asset.uri)
      const blob = await response.blob()
      if (blob.size > 2 * 1024 * 1024) {
        throw new Error('Image size must be less than 2MB')
      }

      // Create file path and upload to Supabase storage
      const fileExt = asset.uri.split('.').pop()
      const filePath = `${userId}/${Date.now()}.${fileExt}`

      const formData = new FormData()
      formData.append('file', {
        uri: asset.uri,
        type: `image/${fileExt}`,
        name: `profile.${fileExt}`
      })

      const { error: uploadError } = await supabase.storage
        .from('profile_picture')
        .upload(filePath, formData)

      if (uploadError) throw uploadError

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('profile_picture')
        .getPublicUrl(filePath)

      console.log('Uploaded Image Public URL:', publicUrl)
      console.log('Storage File Path:', filePath)
      setImageUrl(publicUrl)
      setUploadError(null)
      onImageSelect(filePath)
      onError(null)
    } catch (error) {
      console.error('Error selecting image:', error)
      const errorMessage = error.message || 'Error uploading image'
      setUploadError(errorMessage)
      onError(errorMessage)
    }
  }

  return (
    <View className="mt-7">
      <Text className="text-base text-tcolor font-lexend-bold mb-2">PROFILE PICTURE</Text>
      <TouchableOpacity 
        onPress={handleImageSelect}
        disabled={isSubmitting}
        className="items-center"
      >
        <View className="w-64 h-64 overflow-hidden border-2 border-gray-300 bg-inputField justify-center items-center rounded-full">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-gray-500 font-lexend text-center px-2">
              Tap to upload profile picture
            </Text>
          )}
        </View>
      </TouchableOpacity>
      {uploadError && (
        <Text className="text-red-500 text-center mt-2">{uploadError}</Text>
      )}
    </View>
  )
}

export default ProfilePicture