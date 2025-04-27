// Import necessary components and libraries
import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useEffect } from 'react'
import BoxRouting from '../../components/BoxRouting'
import { router } from 'expo-router'
import icons from '../../constants/icons'
import { supabase } from '../../lib/supabase'

// Menu component - Displays the main menu options for navigation and user actions
const Menu = () => {
  const [userData, setUserData] = useState(null)

  // Fetch user profile data when component mounts
  useEffect(() => {
    fetchUserProfile()
  }, [])

  // Function to fetch user profile data from Supabase
  const fetchUserProfile = async () => {
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
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message)
    }
  }

  // Function to handle user sign out
  // Uses Supabase authentication and redirects to sign-in page
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.replace('/sign-in')
    } catch (error) {
      console.error('Error signing out:', error.message)
    }
  }

  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{height: '100%'}}>
        {/* Main container for menu items */}
        <View className="w-full justify-center h-auto px-4 my-4 min-h-[75vh]">
          <Text className="font-lexend-bold text-center text-3xl">MENU</Text>
          {/* Navigation buttons for different sections */}
          <BoxRouting 
            title="Profile"
            icon={icons.profile}
            handlePress={() => router.push('/profile')}
            containerStyles="mt-7"
            isLoading={false}
            textStyles="font-lexend-bold"
          />
          <BoxRouting 
            title="Security"
            icon={icons.security}
            handlePress={() => router.push('/security')}
            containerStyles="mt-7"
            isLoading={false}
            textStyles="font-lexend-bold"
          />
          <BoxRouting
            title="Settings"
            icon={icons.settings}
            handlePress={() => router.push('/settings')}
            containerStyles="mt-7"
            isLoading={false}
            textStyles="font-lexend-bold"
          />
          {/* Job Listings button - Only visible for employer accounts */}
          {/* Sign out button with logout functionality */}
          <BoxRouting
            title="Sign Out"
            icon={icons.logout}
            handlePress={handleSignOut}
            containerStyles="mt-7"
            isLoading={false}
            textStyles="font-lexend-bold"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Menu