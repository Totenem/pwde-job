import { View, Text, ScrollView, Image, BackHandler, Alert, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import JobCard from '../../components/JobCard';
import { router } from 'expo-router'; // Import useRouter from expo-router 
import * as SecureStore from 'expo-secure-store';

const Home = () => {
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // useEffect(() => {
  //   const getProfileFromStorage = async () => {
  //     try {
  //       const storedProfile = await SecureStore.getItemAsync('user_profile');
  //       if (!storedProfile) {
  //         router.replace('/signin');
  //         return;
  //       }

  //       const parsedProfile = JSON.parse(storedProfile);
  //       setProfile(parsedProfile);
  //       setUserType(parsedProfile.user_type);
  //     } catch (err) {
  //       console.log('Error loading profile:', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   getProfileFromStorage();

  //   const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  //   return () => backHandler.remove();
  // }, []);

  // const handleSwipeLeft = (job) => {
  //   console.log('Ignored job:', job.title);
  // };

  // const handleSwipeRight = (job) => {
  //   console.log('Applied to job:', job.title);
  // };

  // const handleBackPress = () => {
  //   if (userType) {
  //     Alert.alert(
  //       'Exit App',
  //       'Do you want to exit the app?',
  //       [
  //         { text: 'Cancel', style: 'cancel', onPress: () => {} },
  //         { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() }
  //       ]
  //     );
  //     return true;
  //   }
  //   return false;
  // };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 px-4 py-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-lexend-bold text-3xl text-tcolor">Home</Text>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="font-lexend text-xl text-tcolor">Loading...</Text>
          </View>
        ) : userType === 'employee' ? (
          <View className="flex-1">
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
  );
};

export default Home;
