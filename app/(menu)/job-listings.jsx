import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { router } from 'expo-router'
import icons from '../../constants/icons'

// Job Listings component - Displays all jobs created by the employer
const JobListings = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Fetch jobs when component mounts
  useEffect(() => {
    fetchJobs()
  }, [])

  // Function to fetch jobs created by the employer
  const fetchJobs = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.replace('/sign-in')
        return
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error.message)
      setError(error.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true)
    await fetchJobs()
  }

  // Function to render each job item
  const renderJobItem = ({ item }) => (
    <TouchableOpacity 
      className="bg-[#114640] rounded-xl p-4 mb-4"
      activeOpacity={0.7}
      onPress={() => router.push(`/job/${item.id}`)}
    >
      <Text className="font-lexend-bold text-white text-xl">{item.title}</Text>
      <Text className="font-lexend text-white mt-2">{item.job_type}</Text>
      <Text className="font-lexend text-white mt-1">{item.location || 'Remote'}</Text>
      <Text className="font-lexend text-white mt-1">{item.salary_range || 'Salary not specified'}</Text>
      <Text className="font-lexend text-white mt-2 opacity-70">
        {item.description?.length > 100 
          ? `${item.description.substring(0, 100)}...` 
          : item.description}
      </Text>
      <View className="flex-row justify-between mt-3">
        <Text className="font-lexend text-white opacity-70">Status: {item.status}</Text>
        <Text className="font-lexend text-white opacity-70">
          Created: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="h-full bg-primary">
      <View className="w-full h-auto px-4 my-4 flex-1">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="font-lexend-bold text-3xl">Job Listings</Text>
          <View className="flex-row">
            <TouchableOpacity 
              className="bg-[#114640] w-12 h-12 rounded-full justify-center items-center mr-2"
              onPress={fetchJobs}
            >
              <Image 
                source={icons.refresh || require('../../assets/icons/refresh.png')} 
                className="w-6 h-6" 
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-[#114640] w-12 h-12 rounded-full justify-center items-center"
              onPress={() => router.push('/create-job')}
            >
              <Image 
                source={icons.plus} 
                className="w-6 h-6" 
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#114640" />
          </View>
        ) : jobs.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="font-lexend text-lg text-center">
              You haven't created any job listings yet.
            </Text>
            <Text className="font-lexend text-center mt-2">
              Tap the + button to create your first job listing.
            </Text>
          </View>
        ) : (
          <FlatList
            data={jobs}
            renderItem={renderJobItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#114640"]}
                tintColor="#114640"
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  )
}

export default JobListings