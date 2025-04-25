import { View, Text, ScrollView, Image, BackHandler, Alert, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import JobCard from '../../components/JobCard'
import EmployerDashboard from '../../components/EmployerDashboard'

const Home = () => {
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchUserProfile()
    
    // Set up back button handler
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress)
    
    // Clean up the event listener when component unmounts
    return () => backHandler.remove()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .single()

        if (error) throw error
        if (data) {
          setUserType(data.user_type)
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleSwipeLeft = (job) => {
    console.log('Ignored job:', job.title)
  }

  const handleSwipeRight = (job) => {
    console.log('Applied to job:', job.title)
  }
  
  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true)
    await fetchUserProfile()
  }
  
  // Handle hardware back button press
  const handleBackPress = () => {
    // If user is authenticated, prevent going back to sign-in
    if (userType) {
      // Show confirmation dialog to exit app
      Alert.alert(
        'Exit App',
        'Do you want to exit the app?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
          { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() }
        ]
      )
      // Return true to prevent default back behavior
      return true
    }
    // Return false to allow default back behavior if not authenticated
    return false
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 px-4 py-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-lexend-bold text-3xl text-tcolor">Home</Text>
          {/* <TouchableOpacity 
            className="bg-[#114640] w-10 h-10 rounded-full justify-center items-center"
            onPress={fetchUserProfile}
          >
            <Image 
              source={require('../../assets/icons/refresh.png')} 
              className="w-5 h-5" 
              resizeMode="contain"
            />
          </TouchableOpacity> */}
        </View>
        
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="font-lexend text-xl text-tcolor">Loading...</Text>
          </View>
        ) : userType === 'employee' ? (
          <View 
            className="flex-1"
          >
            <JobCard 
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          </View>
        ) : userType === 'employer' ? (
          <View className="flex-1">
            <EmployerDashboard />
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="font-lexend text-xl text-tcolor text-center">
              Please sign in to access job features.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}
export default Home