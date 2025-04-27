'use client'
// Import required dependencies and components
import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import InputField from '../../components/InputField'
import { useState } from 'react'
import CustomButton from '../../components/CustomButton'
import { Link, router } from 'expo-router'
import { supabase } from '../../lib/supabase'

// SignUpEmployee component - Handles employee registration and profile creation
const SignUpEmployee = () => {
  // State management for form data and UI states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Handle form submission and user registration


  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{height: '100%'}}>
        <View className="w-full justify-center h-auto px-4 my-4 min-h-[85vh]">
          {/* Welcome header */}
          <Text className="font-lexend-bold text-tcolor text-2xl text-center">Welcome Onboard!</Text>
          <Text className="font-lexend text-tcolor text-xl mt-4 text-center">Let's help you find your dream Job!</Text>

          {/* Error message display */}
          {error && (
            <Text className="text-red-500 text-center mt-2">{error}</Text>
          )}

          {/* Registration form fields */}
          <InputField
            title="Full Name"
            value={formData.fullName}
            placeholder="Enter Full Name"
            // handleChangeText={(text) => setFormData({...formData, fullName: text})}
            keyboardType="default"
            otherStyles="mt-7"
          />
          <InputField
            title="Email"
            value={formData.email}
            placeholder="Enter Email"
            // handleChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            otherStyles="mt-7"
          />
          <InputField
            title="Password"
            value={formData.password}
            placeholder="Enter Password"
            // handleChangeText={(text) => setFormData({...formData, password: text})}
            keyboardType="default"
            secureTextEntry
            otherStyles="mt-7"
          />
          <InputField
            title="Confirm Password"
            value={formData.confirmPassword}
            placeholder="Confirm Your Password"
            // handleChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            keyboardType="default"
            secureTextEntry
            otherStyles="mt-7"
          />

          {/* Submit button */}
          <CustomButton 
            title="Next"
            handlePress={() => router.push('/additional-info-employee')}
            containerStyles="mt-7"
            isLoading={loading}
            textStyles="font-lexend-bold"
          />

          {/* Sign in link */}
          <View className="gap-2 pt-5 justify-center items-center flex-row">
            <Text className="font-lexend">
              Already have an account? <Link href="/sign-in" className="font-lexend-bold">Sign In</Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUpEmployee