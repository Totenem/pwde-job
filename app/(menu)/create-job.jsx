import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { router } from 'expo-router'
import CustomButton from '../../components/CustomButton'
import JobTypeDropdown from '../../components/JobTypeDropdown'
import JobModalInputField from '../../components/JobModalInputField'
import JobModalBigInputField from '../../components/JobModalBigInputField'
import Dropdown from '../../components/Dropdown'

// Create Job screen - Allows employers to create new job listings
const CreateJob = () => {
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    job_type: '',
    salary_range: ''
  })
  const [availableSkills, setAvailableSkills] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch available skills when component mounts
  useEffect(() => {
    fetchAvailableSkills()
  }, [])

  // Function to fetch available skills from the database
  const fetchAvailableSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('id, name, category')
        .order('category', { ascending: true })

      if (error) throw error
      if (data) setAvailableSkills(data)
    } catch (error) {
      console.error('Error fetching skills:', error)
      setError(error.message)
    }
  }

  // Handle skill selection for each dropdown
  const handleSkillSelect = (skill, index) => {
    const newSelectedSkills = [...selectedSkills]
    newSelectedSkills[index] = skill
    setSelectedSkills(newSelectedSkills)
  }

  // Job type options for dropdown
  const jobTypeOptions = [
    { label: 'Full-time', value: 'Full-time' },
    { label: 'Part-time', value: 'Part-time' },
    { label: 'Contract', value: 'Contract' },
    { label: 'Freelance', value: 'Freelance' },
    { label: 'Internship', value: 'Internship' }
  ]

  // Function to handle job creation
  const handleCreateJob = async () => {
    // Basic validation
    if (!formData.title || !formData.description || !formData.job_type) {
      setError('Please fill in all required fields (Title, Description, and Job Type)')
      return
    }
    
    // At least one skill should be selected
    if (selectedSkills.filter(Boolean).length === 0) {
      setError('Please select at least one required skill')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.replace('/sign-in')
        return
      }

      // Format selected skills for requirements column
      const filteredSkills = selectedSkills.filter(Boolean)
      const requirementsText = filteredSkills.length > 0 
        ? `Required Skills:\n- ${filteredSkills.join('\n- ')}` 
        : ''

      // Insert new job into the jobs table
      const { data, error } = await supabase
        .from('jobs')
        .insert([
          {
            employer_id: session.user.id,
            title: formData.title,
            description: formData.description,
            location: formData.location,
            job_type: formData.job_type,
            salary_range: formData.salary_range,
            requirements: requirementsText,
            status: 'open'
          }
        ])
        .select()
        
      if (error) throw error
      
      // Insert selected skills into job_skills table
      if (data && data[0]) {
        const jobId = data[0].id
        const skillsToInsert = selectedSkills
          .filter(Boolean)
          .map(skillName => {
            const skill = availableSkills.find(s => s.name === skillName)
            return {
              job_id: jobId,
              skill_id: skill?.id
            }
          })
          .filter(item => item.skill_id) // Filter out any undefined skill IDs
          
        if (skillsToInsert.length > 0) {
          const { error: skillsError } = await supabase
            .from('job_skills')
            .insert(skillsToInsert)
            
          if (skillsError) throw skillsError
        }
      }

      if (error) throw error

      // Navigate back to job listings
      router.back()
    } catch (error) {
      console.error('Error creating job:', error.message)
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        <View className="flex-row justify-between items-center my-4">
          <Text className="font-lexend-bold text-2xl">Create New Job</Text>
          <CustomButton
            title="Cancel"
            handlePress={() => router.back()}
            containerStyles="bg-gray-400 px-4 py-2"
            textStyles="font-lexend"
          />
        </View>

        {error && (
          <Text className="text-red-500 mb-4">{error}</Text>
        )}

        <JobModalInputField
          title="Job Title *"
          value={formData.title}
          placeholder="Enter job title"
          handleChangeText={(text) => setFormData({...formData, title: text})}
          keyboardType="default"
          otherStyles="mb-4"
        />

        <JobModalBigInputField
          title="Job Description *"
          value={formData.description}
          placeholder="Enter job description"
          handleChangeText={(text) => setFormData({...formData, description: text})}
          otherStyles="mb-4"
        />

        <View className="mb-4">
          <Text className="text-base text-tcolor font-lexend-bold mb-2">Required Skills *</Text>
          <Dropdown
            otherStyles="mb-2"
            options={availableSkills.map(skill => skill.name)}
            placeholder="Select a required skill"
            onSelect={(skill) => handleSkillSelect(skill, 0)}
            value={selectedSkills[0]}
          />
          <Dropdown
            otherStyles="mb-2"
            options={availableSkills.map(skill => skill.name)}
            placeholder="Select a required skill"
            onSelect={(skill) => handleSkillSelect(skill, 1)}
            value={selectedSkills[1]}
          />
          <Dropdown
            options={availableSkills.map(skill => skill.name)}
            placeholder="Select a required skill"
            onSelect={(skill) => handleSkillSelect(skill, 2)}
            value={selectedSkills[2]}
          />
        </View>

        <JobModalInputField
          title="Location"
          value={formData.location}
          placeholder="Enter job location or 'Remote'"
          handleChangeText={(text) => setFormData({...formData, location: text})}
          keyboardType="default"
          otherStyles="mb-4"
        />

        <JobTypeDropdown
          title="Job Type *"
          options={jobTypeOptions.map(option => option.value)}
          value={formData.job_type}
          onSelect={(value) => setFormData({...formData, job_type: value})}
          placeholder="Select job type"
          otherStyles="mb-4"
        />

        <JobModalInputField
          title="Salary Range"
          value={formData.salary_range}
          placeholder="e.g. $50,000 - $70,000"
          handleChangeText={(text) => setFormData({...formData, salary_range: text})}
          keyboardType="default"
          otherStyles="mb-4"
        />

        <CustomButton
          title="Create Job"
          handlePress={handleCreateJob}
          containerStyles="mt-4 mb-8"
          isLoading={isSubmitting}
          textStyles="font-lexend-bold"
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default CreateJob