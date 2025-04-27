import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

const JobCard = ({ onSwipeLeft, onSwipeRight }) => {
  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Store jobs in a ref to access current value in panResponder
  const jobsRef = useRef([]);
  
  // Update ref whenever jobs state changes
  useEffect(() => {
    jobsRef.current = jobs;
    console.log('Jobs state updated - Current jobs count:', jobs.length);
    console.log('Jobs data:', JSON.stringify(jobs.map(job => job.title)));
  }, [jobs]);
  
  const position = useRef(new Animated.ValueXY()).current;
  // Create panResponder as a ref but don't initialize it yet
  const panResponder = useRef(null);
  
  // Initialize panResponder based on both currentIndex and loading state
  useEffect(() => {
    // Only create the panResponder when not loading and jobs are available
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        // Access jobs through ref to get current value
        const currentJobs = jobsRef.current;
        // Only allow movement if there are jobs available
        if (currentJobs.length > 0 && currentIndex < currentJobs.length) {
          position.setValue({ x: gesture.dx, y: 0 });
        }
      },
      onPanResponderRelease: (event, gesture) => {
        console.log('Swipe detected - dx:', gesture.dx);
        
        // Access jobs through ref to get current value
        const currentJobs = jobsRef.current;
        console.log('Current jobs in panResponder:', currentJobs.length);
        
        // Only process swipes if there are jobs available
        if (currentJobs.length === 0 || currentIndex >= currentJobs.length) {
          console.log('No jobs available to swipe on');
          return;
        }
        
        if (gesture.dx > SWIPE_THRESHOLD) {
          console.log('Swipe RIGHT detected - threshold passed');
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          console.log('Swipe LEFT detected - threshold passed');
          swipeLeft();
        } else {
          console.log('Swipe threshold not met, resetting position');
          resetPosition();
        }
      },
    });
  }, [currentIndex, loading, jobs.length]); // Depend on loading state and jobs.length as well

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('Fetching jobs...');
      
      // Get current user session
      const session = await SecureStore.getItemAsync('user_profile');
      // console.log('Session:', session);
      
      if (!session) {
        console.log('No active session found');
        setError('Please sign in to view jobs');
        setLoading(false);
        return;
      }

      let sessionParse;
      let userId;

      try {
        sessionParse = JSON.parse(session);
        // console.log('Parsed session:', sessionParse);
        
        userId = sessionParse;
        
        
        console.log('Extracted user ID:', userId);
      } catch (err) {
        console.log('Failed to parse session:', err);
        setError('Corrupted session data. Please sign in again.');
        setLoading(false);
        return;
      }

      if (!userId) {
        console.log('Could not find user ID in session data:', session);
        setError('Invalid session. Please sign in again.');
        setLoading(false);
        return;
      }

      // console.log('User authenticated:', userId);
      
      // Fetch jobs from Supabase that are open
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open');

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        throw jobsError;
      }
      
      console.log('Total open jobs found:', jobsData ? jobsData.length : 0);
      
      if (!jobsData || jobsData.length === 0) {
        console.log('No open jobs available');
        setJobs([]);
        setLoading(false);
        return;
      }
      
      // Get user's job applications
      const { data: applications, error: applicationsError } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('applicant_id', userId);
        
      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        throw applicationsError;
      }
      
      // Filter out jobs that the user has already applied to
      const appliedJobIds = applications ? applications.map(app => app.job_id) : [];
      console.log('User has applied to', appliedJobIds.length, 'jobs');
      
      const filteredJobs = jobsData.filter(job => !appliedJobIds.includes(job.id));
      console.log('Jobs available after filtering:', filteredJobs.length);
      
      if (filteredJobs.length === 0) {
        console.log('No jobs available after filtering out applied jobs');
        setJobs([]);
        setLoading(false);
        return;
      }

      // Get employer details for each job
      console.log('Fetching employer details for jobs...');
      const jobsWithEmployers = await Promise.all(
        filteredJobs.map(async (job) => {
          try {
            const { data: employerData, error: employerError } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', job.employer_id)
              .single();

            if (employerError) {
              console.error('Error fetching employer for job', job.id, ':', employerError);
              return { ...job, employer: { full_name: 'Unknown', email: 'Unknown' } };
            }

            return { ...job, employer: employerData };
          } catch (err) {
            console.error('Exception when processing job', job.id, ':', err);
            return { ...job, employer: { full_name: 'Unknown', email: 'Unknown' } };
          }
        })
      );

      console.log('Final jobs with employers:', jobsWithEmployers.length);
      setJobs(jobsWithEmployers);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const swipeRight = async () => {
    console.log('swipeRight function called');
    // Access jobs through ref to get current value
    const currentJobs = jobsRef.current;
    console.log('Jobs array length:', currentJobs.length);
    console.log('Current index:', currentIndex);
    
    // Check if there are any jobs and if the current index is valid before proceeding
    if (currentJobs.length === 0 || currentIndex >= currentJobs.length) {
      console.log('No valid job to apply to');
      return;
    }

    const currentJob = currentJobs[currentIndex];
    console.log('Current job data:', currentJob ? JSON.stringify(currentJob.title) : 'undefined');
    
    if (!currentJob || !currentJob.id) {
      console.error('Invalid job data at index:', currentIndex);
      return;
    }

    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(async () => {
      try {
        console.log('Applying to job:', currentJob.title);
        
        // Get current user session
        const sessionStored = await SecureStore.getItemAsync('user_profile');
        let parsedSession;
        let userId;
        
        try {
          parsedSession = JSON.parse(sessionStored);
          
          // Try to find user ID in different possible locations
          if (parsedSession?.user?.id) {
            userId = parsedSession.user.id;
          } else if (parsedSession?.id) {
            userId = parsedSession.id;
          } else if (parsedSession?.user_id) {
            userId = parsedSession.user_id;
          } else if (typeof parsedSession === 'string') {
            // In case the stored value is a string ID itself
            userId = parsedSession;
          }
          
          console.log('Extracted user ID for application:', userId);
        } catch (e) {
          console.error('Failed to parse session in swipeRight:', e);
          return;
        }
        
        if (!userId) {
          console.error('Invalid session. No user ID found.');
          return;
        }

        // Create job application record
        const { data, error } = await supabase
          .from('job_applications')
          .insert({
            job_id: currentJob.id,
            applicant_id: userId,
            status: 'pending',
          });
          
        if (error) {
          console.error('Error applying to job:', error.message, error.details);
        } else {
          console.log('Successfully applied to job:', currentJob.title);
          
          // try {
          //   // Create notification for the employer
          //   const { error: notificationError } = await supabase
          //     .from('notifications')
          //     .insert({
          //       user_id: currentJob.employer_id,
          //       type: 'job-application',
          //       title: 'New Job Application',
          //       message: `Someone applied to your job: ${currentJob.title}`,
          //     });
              
          //   if (notificationError) {
          //     console.error('Error creating notification:', notificationError);
          //   }
          // } catch (notificationError) {
          //   console.error('Error in notification process:', notificationError);
          //   // Continue execution even if notification fails
          // }
        }
        
        if (onSwipeRight) onSwipeRight(currentJob);
      } catch (error) {
        console.error('Error in job application process:', error);
      } finally {
        // Always move to the next card, even if there was an error
        nextCard();
      }
    });
  };

  const swipeLeft = () => {
    console.log('swipeLeft function called');
    // Access jobs through ref to get current value
    const currentJobs = jobsRef.current;
    console.log('Jobs array length:', currentJobs.length);
    console.log('Current index:', currentIndex);
    
    // Check if there are any jobs and if the current index is valid before proceeding
    if (currentJobs.length === 0 || currentIndex >= currentJobs.length) {
      console.log('No valid job to ignore');
      return;
    }

    const currentJob = currentJobs[currentIndex];
    console.log('Current job data:', currentJob ? JSON.stringify(currentJob.title) : 'undefined');
    
    if (!currentJob) {
      console.error('Invalid job data at index:', currentIndex);
      return;
    }

    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      console.log('Ignored job:', currentJob.title);
      if (onSwipeLeft) onSwipeLeft(currentJob);
      nextCard();
    });
  };

  const nextCard = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      position.setValue({ x: 0, y: 0 });
      return newIndex;
    });
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-30deg', '0deg', '30deg'],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  const renderNoMoreCards = () => (
    <View style={styles.noMoreCardsContainer}>
      <Text style={styles.noMoreCardsText}>No more jobs available</Text>
      <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={fetchJobs}
      >
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading jobs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={fetchJobs}
        >
          <Text style={styles.refreshButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (jobs.length === 0) {
    return (
      <View style={styles.noMoreCardsContainer}>
        <Text style={styles.noMoreCardsText}>No jobs available</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={fetchJobs}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (currentIndex >= jobs.length) {
    return renderNoMoreCards();
  }

  const job = jobs[currentIndex];

  return (
    <Animated.View 
      style={[styles.cardContainer, getCardStyle()]} 
      {...(panResponder.current && !loading && jobs.length > 0 ? panResponder.current.panHandlers : {})}
    >
      <View style={styles.card}>
        <Text style={styles.jobTitle}>{job?.title || 'Loading...'}</Text>
        
        <View style={styles.employerContainer}>
          <Text style={styles.employerLabel}>Employer:</Text>
          <Text style={styles.employerName}>{job?.employer?.full_name || 'Loading...'}</Text>
          <Text style={styles.employerEmail}>{job?.employer?.email || ''}</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailText}>{job?.location || 'Not specified'}</Text>
          
          <Text style={styles.detailLabel}>Job Type:</Text>
          <Text style={styles.detailText}>{job?.job_type || 'Not specified'}</Text>
          
          <Text style={styles.detailLabel}>Salary Range:</Text>
          <Text style={styles.detailText}>{job?.salary_range || 'Not specified'}</Text>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.detailLabel}>Description:</Text>
          <Text style={styles.descriptionText} numberOfLines={5}>
            {job?.description || 'No description provided'}
          </Text>
        </View>
        
        <View style={styles.requirementsContainer}>
          <Text style={styles.detailLabel}>Requirements:</Text>
          <Text style={styles.requirementsText} numberOfLines={3}>
            {job?.requirements || 'No specific requirements'}
          </Text>
        </View>
        
        <View style={styles.instructionContainer}>
          <View style={styles.swipeInstruction}>
            <Text style={styles.swipeInstructionText}>← Swipe left to ignore</Text>
          </View>
          <View style={styles.swipeInstruction}>
            <Text style={styles.swipeInstructionText}>Swipe right to apply →</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: SCREEN_WIDTH - 40,
    height: '100%',
    padding: 10,
  },
  card: {
    backgroundColor: '#114640',
    borderRadius: 20,
    height: '100%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Lexend-Bold',
  },
  employerContainer: {
    backgroundColor: '#2C3E50BF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  employerLabel: {
    fontSize: 16,
    color: '#ECE0D1',
    fontFamily: 'Lexend-Medium',
  },
  employerName: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Lexend-Bold',
    marginTop: 5,
  },
  employerEmail: {
    fontSize: 14,
    color: '#ECE0D1',
    fontFamily: 'Lexend',
    marginTop: 5,
  },
  detailsContainer: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 16,
    color: '#ECE0D1',
    fontFamily: 'Lexend-Medium',
    marginTop: 5,
  },
  detailText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Lexend',
    marginBottom: 5,
  },
  descriptionContainer: {
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Lexend',
    lineHeight: 20,
  },
  requirementsContainer: {
    marginBottom: 20,
  },
  requirementsText: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Lexend',
    lineHeight: 20,
  },
  instructionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  swipeInstruction: {
    padding: 5,
  },
  swipeInstructionText: {
    color: '#ECE0D1',
    fontFamily: 'Lexend',
    fontSize: 12,
  },
  noMoreCardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#114640',
    borderRadius: 20,
    padding: 20,
  },
  noMoreCardsText: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'Lexend-Bold',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#2C3E50BF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#114640',
    borderRadius: 20,
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Lexend',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#114640',
    borderRadius: 20,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Lexend',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default JobCard;