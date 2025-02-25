import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as DocumentPicker from 'expo-document-picker'
import * as SecureStore from 'expo-secure-store'
import { supabase } from '../lib/supabase'

/**
 * ResumeUpload Component
 * Handles resume file selection, validation, and upload functionality
 * 
 * @param {Object} props
 * @param {Function} props.onFileSelect - Callback function when a file is selected
 * @param {Function} props.onError - Callback function for error handling
 * @param {string} props.initialValue - Initial resume file data (if any)
 * @param {boolean} props.isSubmitting - Flag to indicate if form is being submitted
 */
const ResumeUpload = ({ onFileSelect, onError, initialValue, isSubmitting }) => {
  // State management for resume file and error handling
  const [resumeFile, setResumeFile] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  // Load saved resume data on component mount
  useEffect(() => {
    if (initialValue) {
      setResumeFile(initialValue)
    } else {
      loadResumeData()
    }
  }, [initialValue])

  /**
   * Load previously saved resume data from secure storage
   */
  const loadResumeData = async () => {
    try {
      const savedResume = await SecureStore.getItemAsync('resumeFile')
      if (savedResume) {
        const parsedResume = JSON.parse(savedResume)
        setResumeFile(parsedResume)
        onFileSelect(parsedResume)
      }
    } catch (error) {
      console.error('Error loading resume data:', error)
      onError('Error loading saved resume')
    }
  }

  /**
   * Handle resume file selection and validation
   */
  const handleResumeUpload = async () => {
    try {
      // Open document picker for PDF files
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
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

      // Save file data and notify parent component
      setResumeFile(file)
      await SecureStore.setItemAsync('resumeFile', JSON.stringify(file))
      setUploadError(null)
      onFileSelect(file)
      onError(null)
    } catch (error) {
      console.error('Error picking document:', error)
      const errorMessage = 'Error selecting resume'
      setUploadError(errorMessage)
      onError(errorMessage)
    }
  }

  return (
    <View className="mt-7">
      <Text className="text-base text-tcolor font-lexend-bold mb-2">UPLOAD YOUR RESUME</Text>
      <TouchableOpacity 
        onPress={handleResumeUpload}
        disabled={isSubmitting}
      >
        <View className="border-2 w-full h-16 px-4 bg-inputField rounded-2xl flex-row items-center justify-between">
          <Text className="flex-1 text-tcolor font-lexend-semibold text-base">
            {resumeFile ? resumeFile.name : 'Upload Resume (PDF)'}
          </Text>
        </View>
      </TouchableOpacity>
      {uploadError && (
        <Text className="text-red-500 mt-2">{uploadError}</Text>
      )}
    </View>
  )
}

export default ResumeUpload