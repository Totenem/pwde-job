import { View, Text, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../../lib/supabase'
import { router, useLocalSearchParams } from 'expo-router'
import CustomButton from '../../../components/CustomButton'

/**
 * JobApplicants Component
 * Displays a list of applicants for a specific job posting
 * Allows employers to view applicant details and manage applications
 */
const JobApplicants = () => {
  const { id } = useLocalSearchParams() // Get job ID from URL params
  const [job, setJob] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch job details and applicants when component mounts
  useEffect(() => {
    if (id) {
      fetchJobDetails()
      fetchApplicants()
    }
  }, [id])

  /**
   * Fetch job details to display job information
   */
  const fetchJobDetails = async () => {
    try {
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
        setError('You do not have permission to view applicants for this job')
        return
      }
      
      setJob(data)
    } catch (error) {
      console.error('Error fetching job details:', error.message)
      setError(error.message)
    }
  }

  /**
   * Fetch applicants for the current job
   */
  const fetchApplicants = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.replace('/sign-in')
        return
      }

      // First, get the job to verify ownership
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('employer_id')
        .eq('id', id)
        .single()

      if (jobError) throw jobError
      
      // Verify that the job belongs to the current user
      if (jobData.employer_id !== session.user.id) {
        setError('You do not have permission to view applicants for this job')
        return
      }

      // Get applications with applicant profile information
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          status,
          created_at,
          profiles:applicant_id(id, full_name, email, avatar_url, skills)
        `)
        .eq('job_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setApplicants(data || [])
    } catch (error) {
      console.error('Error fetching applicants:', error.message)
      setError(error.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  /**
   * Handle refresh when pulling down the list
   */
  const handleRefresh = () => {
    setRefreshing(true)
    fetchApplicants()
  }

  /**
   * View applicant profile details
   */
  const handleViewProfile = (applicantId) => {
    // Navigate to applicant profile view
    // This would be implemented in a separate screen
    Alert.alert('View Profile', 'Navigate to applicant profile (to be implemented)')
    // router.push(`/applicant-profile/${applicantId}`)
  }

  /**
   * Update application status
   */
  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId)

      if (error) throw error
      
      // Refresh the applicants list
      fetchApplicants()
      Alert.alert('Success', `Application status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating application status:', error.message)
      Alert.alert('Error', error.message)
    }
  }

  /**
   * Render each applicant item
   */
  const renderApplicantItem = ({ item }) => {
    const applicant = item.profiles
    const applicationDate = new Date(item.created_at).toLocaleDateString()
    
    return (
      <View className="bg-[#114640] rounded-xl p-4 mb-4">
        <View className="flex-row justify-between items-center">
          <Text className="font-lexend-bold text-white text-xl">{applicant.full_name}</Text>
          <Text className="font-lexend text-white text-sm">{applicationDate}</Text>
        </View>
        
        <Text className="font-lexend text-white mt-2">{applicant.email}</Text>
        
        {applicant.skills && Array.isArray(applicant.skills) && applicant.skills.length > 0 && (
          <View className="mt-2">
            <Text className="font-lexend text-white opacity-70">Skills:</Text>
            <View className="flex-row flex-wrap mt-1">
              {applicant.skills.map((skill, index) => (
                <View key={index} className="bg-white/20 rounded-full px-3 py-1 mr-2 mb-2">
                  <Text className="font-lexend text-white text-sm">{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        <View className="flex-row justify-between items-center mt-3 pt-2 border-t border-white/20">
          <View className="bg-white/10 px-3 py-1 rounded-lg">
            <Text className="font-lexend text-white">{item.status}</Text>
          </View>
          
          <View className="flex-row">
            <TouchableOpacity
              className="bg-white/20 px-3 py-1 rounded-lg mr-2"
              onPress={() => handleViewProfile(applicant.id)}
            >
              <Text className="font-lexend text-white">View Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="bg-green-600/80 px-3 py-1 rounded-lg"
              onPress={() => {
                Alert.alert(
                  'Update Status',
                  'Choose a new status for this application',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Shortlisted', 
                      onPress: () => handleUpdateStatus(item.id, 'shortlisted')
                    },
                    { 
                      text: 'Rejected', 
                      onPress: () => handleUpdateStatus(item.id, 'rejected'),
                      style: 'destructive'
                    },
                    { 
                      text: 'Hired', 
                      onPress: () => handleUpdateStatus(item.id, 'hired')
                    },
                  ]
                )
              }}
            >
              <Text className="font-lexend text-white">Update Status</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView 
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-6">
          <Text className="font-lexend-bold text-3xl">Job Applicants</Text>
          <CustomButton
            title="Back"
            handlePress={() => router.back()}
            containerStyles="px-4 py-2"
            textStyles="font-lexend"
          />
        </View>
        
        {job && (
          <View className="bg-[#0D3330] rounded-xl p-4 mb-6">
            <Text className="font-lexend-bold text-white text-xl">{job.title}</Text>
            <Text className="font-lexend text-white mt-1">{job.job_type}</Text>
            <Text className="font-lexend text-white mt-1">{job.location || 'Remote'}</Text>
            <View className="flex-row justify-between mt-2">
              <Text className="font-lexend text-white">Status: {job.status}</Text>
              <Text className="font-lexend text-white">
                Created: {new Date(job.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
        
        {loading ? (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#114640" />
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="font-lexend text-lg text-center text-red-500">{error}</Text>
            <CustomButton
              title="Try Again"
              handlePress={fetchApplicants}
              containerStyles="mt-4"
              textStyles="font-lexend"
            />
          </View>
        ) : applicants.length === 0 ? (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="font-lexend text-lg text-center">
              No applications received for this job yet.
            </Text>
          </View>
        ) : (
          <View>
            <Text className="font-lexend-bold text-xl mb-4">
              {applicants.length} {applicants.length === 1 ? 'Applicant' : 'Applicants'}
            </Text>
            
            {applicants.map((item) => renderApplicantItem({ item }))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default JobApplicants