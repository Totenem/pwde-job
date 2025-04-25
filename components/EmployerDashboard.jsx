import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

/**
 * EmployerDashboard Component
 * Displays job statistics for employers including created jobs and application counts
 */
const EmployerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch jobs and application counts when component mounts
  useEffect(() => {
    fetchJobsWithApplications();
  }, []);

  /**
   * Fetch all jobs created by the employer along with application counts
   */
  const fetchJobsWithApplications = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace('/sign-in');
        return;
      }

      // Fetch all jobs created by the employer
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', session.user.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;
      
      // For each job, fetch the application count
      const jobsWithApplications = await Promise.all(
        jobsData.map(async (job) => {
          const { count, error: countError } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id);

          if (countError) {
            console.error('Error fetching application count:', countError);
            return { ...job, applicationCount: 0 };
          }

          return { ...job, applicationCount: count || 0 };
        })
      );

      setJobs(jobsWithApplications);
    } catch (error) {
      console.error('Error fetching jobs with applications:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate to job details page
   */
  const handleViewJob = (jobId) => {
    router.push(`/job/${jobId}`);
  };

  /**
   * Navigate to job applicants page
   * This would be implemented in a separate screen
   */
  const handleViewApplicants = (jobId) => {
    router.push(`/job-applicants/${jobId}`);
  };

  /**
   * Navigate to create job page
   */
  const handleCreateJob = () => {
    router.push('/create-job');
  };

  /**
   * Render each job item with application statistics
   */
  const renderJobItem = ({ item }) => (
    <View className="bg-[#114640] rounded-xl p-4 mb-4">
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => handleViewJob(item.id)}
      >
        <Text className="font-lexend-bold text-white text-xl">{item.title}</Text>
        <Text className="font-lexend text-white mt-2">{item.job_type}</Text>
        <Text className="font-lexend text-white mt-1">{item.location || 'Remote'}</Text>
        
        <View className="flex-row justify-between mt-3">
          <Text className="font-lexend text-white">Status: {item.status}</Text>
          <Text className="font-lexend text-white">
            Created: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        <View className="flex-row justify-between items-center mt-3 pt-2 border-t border-white/20">
          <Text className="font-lexend-bold text-white">
            {item.applicationCount} {item.applicationCount === 1 ? 'Applicant' : 'Applicants'}
          </Text>
          
          <TouchableOpacity
            className="bg-white/20 px-3 py-1 rounded-lg"
            onPress={() => handleViewApplicants(item.id)}
          >
            <Text className="font-lexend text-white">View Applicants</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  /**
   * Render the most popular job with the highest number of applications
   */
  const renderMostPopularJob = () => {
    if (jobs.length === 0) return null;
    
    const mostPopularJob = [...jobs].sort((a, b) => b.applicationCount - a.applicationCount)[0];
    
    if (mostPopularJob.applicationCount === 0) return null;
    
    return (
      <View className="mb-6">
        <Text className="font-lexend-bold text-xl mb-2">Most Popular Job</Text>
        <View className="bg-[#0D3330] rounded-xl p-4">
          <Text className="font-lexend-bold text-white text-lg">{mostPopularJob.title}</Text>
          <Text className="font-lexend text-white mt-1">{mostPopularJob.job_type}</Text>
          <View className="flex-row justify-between items-center mt-2">
            <Text className="font-lexend-bold text-white">
              {mostPopularJob.applicationCount} {mostPopularJob.applicationCount === 1 ? 'Applicant' : 'Applicants'}
            </Text>
            <TouchableOpacity
              className="bg-white/20 px-3 py-1 rounded-lg"
              onPress={() => handleViewApplicants(mostPopularJob.id)}
            >
              <Text className="font-lexend text-white">View Applicants</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render application statistics summary
   */
  const renderStatistics = () => {
    if (jobs.length === 0) return null;
    
    const totalApplications = jobs.reduce((sum, job) => sum + job.applicationCount, 0);
    const openJobs = jobs.filter(job => job.status === 'open').length;
    
    return (
      <View className="mb-6">
        <View className="flex-row justify-end mb-2">
          <TouchableOpacity 
            className="bg-[#114640] w-10 h-10 rounded-full justify-center items-center"
            onPress={fetchJobsWithApplications}
          >
            <Image 
              source={require('../assets/icons/refresh.png')} 
              className="w-5 h-5" 
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-between">
          <View className="bg-[#114640] rounded-xl p-4 w-[48%]"> 
            <Text className="font-lexend text-white">Total Jobs</Text>
            <Text className="font-lexend-bold text-white text-2xl">{jobs.length}</Text>
            <Text className="font-lexend text-white text-sm">{openJobs} Active</Text>
          </View>
          <View className="bg-[#114640] rounded-xl p-4 w-[48%]">
            <Text className="font-lexend text-white">Applications</Text>
            <Text className="font-lexend-bold text-white text-2xl">{totalApplications}</Text>
            <Text className="font-lexend text-white text-sm">Across all jobs</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#114640" />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="font-lexend text-lg text-center text-red-500">{error}</Text>
          <TouchableOpacity 
            className="mt-4 bg-[#114640] px-4 py-2 rounded-lg"
            onPress={fetchJobsWithApplications}
          >
            <Text className="font-lexend text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : jobs.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="font-lexend text-lg text-center">
            You haven't created any job listings yet.
          </Text>
          <TouchableOpacity 
            className="mt-4 bg-[#114640] px-4 py-2 rounded-lg"
            onPress={handleCreateJob}
          >
            <Text className="font-lexend text-white">Create Your First Job</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {renderStatistics()}
          {renderMostPopularJob()}
          
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-lexend-bold text-xl">Your Job Listings</Text>
            <TouchableOpacity 
              className="bg-[#114640] px-4 py-2 rounded-lg"
              onPress={handleCreateJob}
            >
              <Text className="font-lexend text-white">Create New Job</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={jobs}
            renderItem={renderJobItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </>
      )}
    </View>
  );
};

export default EmployerDashboard;