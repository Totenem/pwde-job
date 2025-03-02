import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

const JobCard = ({ onSwipeLeft, onSwipeRight }) => {
  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const position = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Fetch jobs from Supabase
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open');

      if (jobsError) throw jobsError;

      // Get employer details for each job
      const jobsWithEmployers = await Promise.all(
        jobsData.map(async (job) => {
          const { data: employerData, error: employerError } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', job.employer_id)
            .single();

          if (employerError) {
            console.error('Error fetching employer:', employerError);
            return { ...job, employer: { full_name: 'Unknown', email: 'Unknown' } };
          }

          return { ...job, employer: employerData };
        })
      );

      setJobs(jobsWithEmployers);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
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

  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      const currentJob = jobs[currentIndex];
      if (currentJob) {
        console.log('Applied to job:', currentJob.title);
        if (onSwipeRight) onSwipeRight(currentJob);
      } else {
        console.log('No job to apply to');
      }
      nextCard();
    });
  };

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      const currentJob = jobs[currentIndex];
      if (currentJob) {
        console.log('Ignored job:', currentJob.title);
        if (onSwipeLeft) onSwipeLeft(currentJob);
      } else {
        console.log('No job to ignore');
      }
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
      {...panResponder.panHandlers}
    >
      <View style={styles.card}>
        <Text style={styles.jobTitle}>{job.title}</Text>
        
        <View style={styles.employerContainer}>
          <Text style={styles.employerLabel}>Employer:</Text>
          <Text style={styles.employerName}>{job.employer.full_name}</Text>
          <Text style={styles.employerEmail}>{job.employer.email}</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailText}>{job.location}</Text>
          
          <Text style={styles.detailLabel}>Job Type:</Text>
          <Text style={styles.detailText}>{job.job_type}</Text>
          
          <Text style={styles.detailLabel}>Salary Range:</Text>
          <Text style={styles.detailText}>{job.salary_range}</Text>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.detailLabel}>Description:</Text>
          <Text style={styles.descriptionText} numberOfLines={5}>
            {job.description}
          </Text>
        </View>
        
        <View style={styles.requirementsContainer}>
          <Text style={styles.detailLabel}>Requirements:</Text>
          <Text style={styles.requirementsText} numberOfLines={3}>
            {job.requirements}
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