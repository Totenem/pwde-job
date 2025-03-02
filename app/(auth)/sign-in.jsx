// Import required dependencies and components
import { View, Text, ScrollView, Image } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import InputField from '../../components/InputField'
import CustomButton from '../../components/CustomButton'
import { useState } from 'react'
import { Link, router } from 'expo-router'
import { supabase } from '../../lib/supabase'

// SignIn component - Handles user authentication and login functionality
const SignIn = () => {
  // State management for form data and UI states
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Check for existing session when component mounts
  useEffect(() => {
    checkUser();
  }, []);
  
  // Function to verify if user is already authenticated
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Redirect authenticated users to home screen
      router.replace('/home');
    }
  };
  
  // Handle user sign in process
  const handleSignIn = async () => {
    // Form validation
    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }
  
    setIsLoading(true)
    setError(null)
  
    try {
      // Attempt to authenticate user with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
  
      if (signInError) throw signInError
  
      // Fetch user profile to determine user type
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single()
  
      if (profileError) throw profileError
  
      // Route user based on their profile type
      if (profile.user_type === 'employee') {
        router.replace('/home')
      } else {
        // Default route for other user types
        router.replace('/home')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{height: '100%'}}>
        {/* Main container for sign in form */}
        <View className="w-full justify-center h-auto px-4 my-4 min-h-[85vh]">
          {/* Welcome header and logo */}
          <Text className="text-center text-tcolor text-3xl font-lexend-bold">
            Welcome To PWDe Job!
          </Text>
          <Image 
            source={require('../../assets/images/onboarding.png')}
            className="w-full h-[250px]"
            resizeMode="contain"
          />

          {/* Error message display */}
          {error && (
            <Text className="text-red-500 text-center mt-2">{error}</Text>
          )}

          {/* Login form fields */}
          <InputField
            title="Email"
            value={form.email}
            placeholder="Enter Email"
            handleChangeText={(e) => setForm({...form, email: e})}
            keyboardType="email-address"
            otherStyles="mt-7"
          />
          <InputField
            title="Password"
            value={form.password}
            placeholder="Enter Password"
            handleChangeText={(e) => setForm({...form, password: e})}
            keyboardType="default"
            secureTextEntry
            otherStyles="mt-7"
          />

          {/* Password recovery link */}
          <View className="gap-2 pt-2 justify-center items-center flex-row">
            <Link href="/password-recovery" className="text-lg font-lexend-bold">
              Forgot Password
            </Link>
          </View>

          {/* Sign in button */}
          <CustomButton 
            title="Sign In"
            handlePress={handleSignIn}
            containerStyles="mt-7"
            isLoading={isLoading}
            textStyles="font-lexend-bold"
          />

          {/* Sign up navigation */}
          <View className="gap-2 pt-5 justify-center items-center flex-row">
            <Text className="font-lexend">
              Don't have an account?{' '}
              <Link href="/onboarding" className="font-lexend-bold">
                Sign Up
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn