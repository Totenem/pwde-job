import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../lib/supabase'

/**
 * BackIdUpload Component
 * Handles back ID image selection and upload functionality
 * 
 * @param {Object} props
 * @param {Function} props.onFileSelect - Callback function when a file is selected
 * @param {Function} props.onError - Callback function for error handling
 * @param {string} props.initialValue - Initial back ID file data (if any)
 * @param {boolean} props.isSubmitting - Flag to indicate if form is being submitted
 * @param {string} props.userId - User ID for storage path
 */
const BackIdUpload = ({ onFileSelect, onError, initialValue, isSubmitting, userId }) => {
  const [backIdFile, setBackIdFile] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  useEffect(() => {
    if (initialValue) {
      setBackIdFile(initialValue)
    }
  }, [initialValue])

  /**
   * Handle back ID image selection and validation
   */
  const handleBackIdUpload = async () => {
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
        name: `back_id.${fileExt}`
      })

      const { error: uploadError } = await supabase.storage
        .from('back_valid_Id')
        .upload(filePath, formData)

      if (uploadError) throw uploadError

      setBackIdFile({
        name: `back_id.${fileExt}`,
        uri: asset.uri
      })
      setUploadError(null)
      onFileSelect(filePath)
      onError(null)
    } catch (error) {
      console.error('Error selecting back ID:', error)
      const errorMessage = error.message || 'Error uploading back ID'
      setUploadError(errorMessage)
      onError(errorMessage)
    }
  }

  return (
    <View className="mt-7">
      <Text className="text-base text-tcolor font-lexend-bold mb-2">UPLOAD YOUR PWD ID HERE BACK</Text>
      <TouchableOpacity 
        onPress={handleBackIdUpload}
        disabled={isSubmitting}
      >
        <View className="border-2 w-full h-16 px-4 bg-inputField rounded-2xl flex-row items-center justify-between">
          <Text className="flex-1 text-tcolor font-lexend-semibold text-base">
            {backIdFile ? backIdFile.name : 'Upload Back ID'}
          </Text>
        </View>
      </TouchableOpacity>
      {uploadError && (
        <Text className="text-red-500 mt-2">{uploadError}</Text>
      )}
    </View>
  )
}

export default BackIdUpload