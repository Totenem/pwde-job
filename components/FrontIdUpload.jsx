import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../lib/supabase'

/**
 * FrontIdUpload Component
 * Handles front ID image selection and upload functionality
 * 
 * @param {Object} props
 * @param {Function} props.onFileSelect - Callback function when a file is selected
 * @param {Function} props.onError - Callback function for error handling
 * @param {string} props.initialValue - Initial front ID file data (if any)
 * @param {boolean} props.isSubmitting - Flag to indicate if form is being submitted
 * @param {string} props.userId - User ID for storage path
 */
const FrontIdUpload = ({ onFileSelect, onError, initialValue, isSubmitting, userId }) => {
  const [frontIdFile, setFrontIdFile] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  useEffect(() => {
    if (initialValue) {
      setFrontIdFile(initialValue)
    }
  }, [initialValue])

  /**
   * Handle front ID image selection and validation
   */
  const handleFrontIdUpload = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permissionResult.granted) {
        throw new Error('Permission to access media library was denied')
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
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
        name: `front_id.${fileExt}`
      })

      const { error: uploadError } = await supabase.storage
        .from('front_valid_id')
        .upload(filePath, formData)

      if (uploadError) throw uploadError

      setFrontIdFile({
        name: `front_id.${fileExt}`,
        uri: asset.uri
      })
      setUploadError(null)
      onFileSelect(filePath)
      onError(null)
    } catch (error) {
      console.error('Error selecting front ID:', error)
      const errorMessage = error.message || 'Error uploading front ID'
      setUploadError(errorMessage)
      onError(errorMessage)
    }
  }

  return (
    <View className="mt-7">
      <Text className="text-base text-tcolor font-lexend-bold mb-2">UPLOAD YOUR PWD ID HERE FRONT</Text>
      <TouchableOpacity 
        onPress={handleFrontIdUpload}
        disabled={isSubmitting}
      >
        <View className="border-2 w-full h-16 px-4 bg-inputField rounded-2xl flex-row items-center justify-between">
          <Text className="flex-1 text-tcolor font-lexend-semibold text-base">
            {frontIdFile ? frontIdFile.name : 'Upload Front ID'}
          </Text>
        </View>
      </TouchableOpacity>
      {uploadError && (
        <Text className="text-red-500 mt-2">{uploadError}</Text>
      )}
    </View>
  )
}

export default FrontIdUpload