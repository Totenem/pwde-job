import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../../lib/supabase'
import { router, useLocalSearchParams } from 'expo-router'
import CustomButton from '../../../components/CustomButton'

// Job Detail component - Displays detailed information about a specific job
const JobDetail = () => {
  const { id } = useLocalSearchParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch job details when component mounts
  useEffect(() => {
    if (id) {
      fetchJobDetails()
    }
  }, [id])

  // Function to fetch job details
  const fetchJobDetails = async () => {
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
        .eq('id', id)
        .single()

      if (error) throw error
      
      // Verify that the job belongs to the current user
      if (data.employer_id !== session.user.id) {
        setError('You do not have permission to view this job')
        return
      }
      
      setJob(data)
    } catch (error) {
      console.error('Error fetching job details:', error.message)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Function to handle job status update
  const updateJobStatus = async (newStatus) => {
    try {
      setIsSubmitting(true)
      
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      
      // Refresh job details
      fetchJobDetails()
      Alert.alert('Success', `Job status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating job status:', error.message)
      Alert.alert('Error', error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to handle job deletion
  const handleDeleteJob = async () => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSubmitting(true)
              
              const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', id)

              if (error) throw error
              
              Alert.alert('Success', 'Job deleted successfully')
              router.back()
            } catch (error) {
              console.error('Error deleting job:', error.message)
              Alert.alert('Error', error.message)
              setIsSubmitting(false)
            }
          }
        }
      ]
    )
  }

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <View className="flex-1 justify-center items-center h-[80vh]">
            <ActivityIndicator size="large" color="#114640" />
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center h-[80vh]">
            <Text className="font-lexend text-lg text-center text-red-500">{error}</Text>
            <CustomButton
              title="Go Back"
              handlePress={() => router.back()}
              containerStyles="mt-4"
              textStyles="font-lexend-bold"
            />
          </View>
        ) : job ? (
          <View>
            <Text className="font-lexend-bold text-3xl">{job.title}</Text>
            
            <View className="bg-[#114640] rounded-xl p-4 mt-4">
              <View className="flex-row justify-between items-center">
                <Text className="font-lexend-bold text-white text-lg">Status</Text>
                <Text className="font-lexend text-white">{job.status}</Text>
              </View>
              
              <View className="flex-row justify-between items-center mt-2">
                <Text className="font-lexend-bold text-white text-lg">Job Type</Text>
                <Text className="font-lexend text-white">{job.job_type}</Text>
              </View>
              
              <View className="flex-row justify-between items-center mt-2">
                <Text className="font-lexend-bold text-white text-lg">Location</Text>
                <Text className="font-lexend text-white">{job.location || 'Remote'}</Text>
              </View>
              
              <View className="flex-row justify-between items-center mt-2">
                <Text className="font-lexend-bold text-white text-lg">Salary Range</Text>
                <Text className="font-lexend text-white">{job.salary_range || 'Not specified'}</Text>
              </View>
              
              <View className="flex-row justify-between items-center mt-2">
                <Text className="font-lexend-bold text-white text-lg">Created</Text>
                <Text className="font-lexend text-white">{formatDate(job.created_at)}</Text>
              </View>
            </View>
            
            <View className="mt-6">
              <Text className="font-lexend-bold text-xl">Description</Text>
              <Text className="font-lexend mt-2">{job.description}</Text>
            </View>
            
            {job.requirements && (
              <View className="mt-6">
                <Text className="font-lexend-bold text-xl">Requirements</Text>
                <Text className="font-lexend mt-2">{job.requirements}</Text>
              </View>
            )}
            
            <View className="mt-8">
              <Text className="font-lexend-bold text-xl mb-4">Manage Job</Text>
              
              {job.status === 'open' ? (
                <CustomButton
                  title="Close Job"
                  handlePress={() => updateJobStatus('closed')}
                  containerStyles="mb-4"
                  isLoading={isSubmitting}
                  textStyles="font-lexend-bold"
                />
              ) : (
                <CustomButton
                  title="Reopen Job"
                  handlePress={() => updateJobStatus('open')}
                  containerStyles="mb-4"
                  isLoading={isSubmitting}
                  textStyles="font-lexend-bold"
                />
              )}
              
              <CustomButton
                title="Delete Job"
                handlePress={handleDeleteJob}
                containerStyles="bg-red-600"
                isLoading={isSubmitting}
                textStyles="font-lexend-bold"
              />
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center h-[80vh]">
            <Text className="font-lexend text-lg text-center">Job not found</Text>
            <CustomButton
              title="Go Back"
              handlePress={() => router.back()}
              containerStyles="mt-4"
              textStyles="font-lexend-bold"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default JobDetail