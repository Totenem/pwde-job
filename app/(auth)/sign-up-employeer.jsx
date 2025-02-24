// Import required dependencies and components
import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import InputField from '../../components/InputField'
import { useState } from 'react'
import CustomButton from '../../components/CustomButton'
import { Link, router } from 'expo-router'
import { supabase } from '../../lib/supabase'

// SignUpEmployeer component - Handles employer registration and profile creation
const SignUpEmployeer = () => {
  // State management for form data and UI states
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employer'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Handle form submission and employer registration
  const handleSubmit = async () => {
    // Basic validation
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Sign up the user with Supabase authentication
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            user_type: 'employer'
          }
        }
      })

      if (signUpError) throw signUpError

      // Get the session to ensure we're authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      if (session) {
        // Create employer profile in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              full_name: form.fullName,
              email: form.email,
              user_type: 'employer'
            }
          ])
          .select()

        if (profileError) throw profileError

        // Navigate to additional employer information form
        router.push('/additional-info-employer')
      } else {
        // Redirect to sign-in if session isn't immediately available
        router.push('/sign-in')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{height: '100%'}}>
        <View className="w-full justify-center h-auto px-4 my-4 min-h-[85vh]">
          {/* Welcome header */}
          <Text className="font-lexend-bold text-tcolor text-2xl text-center">Welcome Onboard!</Text>
          <Text className="font-lexend text-tcolor text-xl mt-4 text-center">Let's help you find your dream Worker!</Text>

          {/* Error message display */}
          {error && (
            <Text className="text-red-500 text-center font-lexend mt-2">{error}</Text>
          )}

          {/* Registration form fields */}
          <InputField
            title="Full Name"
            value={form.fullName}
            placeholder="Enter Full Name"
            handleChangeText={(e) => setForm({...form, fullName: e})}
            keyboardType="default"
            otherStyles="mt-7"
          />
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
          <InputField
            title="Confirm Password"
            value={form.confirmPassword}
            placeholder="Confirm Your Password"
            handleChangeText={(e) => setForm({...form, confirmPassword: e})}
            keyboardType="default"
            secureTextEntry
            otherStyles="mt-7"
          />

          {/* Submit button */}
          <CustomButton 
            title="Next"
            handlePress={handleSubmit}
            containerStyles="mt-7"
            isLoading={loading}
            textStyles="font-lexend-bold"
          />

          {/* Sign in link */}
          <View className="gap-2 pt-5 justify-center items-center flex-row">
            <Text className="font-lexend">
              Already have an account?{' '}
              <Link href="/sign-in" className="font-lexend-bold">Sign In</Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUpEmployeer