import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as DocumentPicker from 'expo-document-picker'
import * as SecureStore from 'expo-secure-store'
import { supabase } from '../lib/supabase'

/**
 * EmployerIdUpload Component
 * Handles employer ID image upload functionality
 * 
 * @param {Object} props
 * @param {Function} props.onFileSelect - Callback function when a file is selected
 * @param {Function} props.onError - Callback function for error handling
 * @param {string} props.initialValue - Initial employer ID image data (if any)
 * @param {boolean} props.isSubmitting - Flag to indicate if form is being submitted
 * @param {string} props.userId - User ID for storage path
 */
const EmployerIdUpload = ({ onFileSelect, onError, initialValue, isSubmitting, userId }) => {
  const [employerIdFile, setEmployerIdFile] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  // Load saved employer ID data on component mount
  useEffect(() => {
    if (initialValue) {
      setEmployerIdFile(initialValue)
    } else {
      loadEmployerIdData()
    }
  }, [initialValue])

  /**
   * Load previously saved employer ID data from secure storage
   */
  const loadEmployerIdData = async () => {
    try {
      const savedEmployerId = await SecureStore.getItemAsync('employerIdFile')
      if (savedEmployerId) {
        const parsedEmployerId = JSON.parse(savedEmployerId)
        setEmployerIdFile(parsedEmployerId)
        onFileSelect(parsedEmployerId)
      }
    } catch (error) {
      console.error('Error loading employer ID data:', error)
      onError('Error loading saved employer ID')
    }
  }

  /**
   * Handle employer ID image selection and validation
   */
  const handleEmployerIdUpload = async () => {
    try {
      // Open document picker for image files
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true
      })

      if (result.canceled) return

      const file = result.assets[0]
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        const error = 'File size must be less than 5MB'
        setUploadError(error)
        onError(error)
        return
      }

      // Create file path and upload to Supabase storage
      const fileExt = file.uri.split('.').pop()
      const filePath = `${userId}/${Date.now()}.${fileExt}`

      const formData = new FormData()
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType,
        name: file.name
      })

      const { error: uploadError } = await supabase.storage
        .from('employer_id')
        .upload(filePath, formData)

      if (uploadError) throw uploadError

      // Save file data and notify parent component
      setEmployerIdFile(file)
      await SecureStore.setItemAsync('employerIdFile', JSON.stringify(file))
      setUploadError(null)
      onFileSelect(filePath)
      onError(null)
    } catch (error) {
      console.error('Error picking document:', error)
      const errorMessage = 'Error selecting employer ID'
      setUploadError(errorMessage)
      onError(errorMessage)
    }
  }

  return (
    <View className="mt-7">
      <Text className="text-base text-tcolor font-lexend-bold mb-2">UPLOAD EMPLOYER ID</Text>
      <TouchableOpacity 
        onPress={handleEmployerIdUpload}
        disabled={isSubmitting}
      >
        <View className="border-2 w-full h-16 px-4 bg-inputField rounded-2xl flex-row items-center justify-between">
          <Text className="flex-1 text-tcolor font-lexend-semibold text-base">
            {employerIdFile ? employerIdFile.name : 'Upload Employer ID (Image)'}
          </Text>
        </View>
      </TouchableOpacity>
      {uploadError && (
        <Text className="text-red-500 mt-2">{uploadError}</Text>
      )}
    </View>
  )
}

export default EmployerIdUpload