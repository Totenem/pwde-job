// Import required components and libraries
import { ScrollView, Text, View } from 'react-native';
import { Link, Redirect, router} from 'expo-router';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../components/CustomButton';

// Onboarding component - Initial screen for user type selection
const Onboarding = () => {
  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{height: '100%',}}>
        {/* Main container for onboarding content */}
        <View className="w-full justify-center items-center h-full px-4 my-4 min-h-[85vh]">
          {/* Onboarding illustration */}
          <Image 
            source={require('../../assets/images/onboarding.png')}
            className = "w-full h-[300px]"
            resizeMode="contain"
          />

          {/* User type selection header */}
          <Text className = "text-tcolor text-3xl text-center font-lexend-bold">
            CHOOSE USER:
          </Text>

          {/* Description text */}
          <View className = "relative mt-5 items-center">
           <Text className = "text-center text-tcolor font-lexend">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Interdum dictum tempus, interdum at dignissim metus. Ultricies sed nunc.
            </Text>
          </View>

          {/* Navigation buttons for different user types */}
          <CustomButton 
              title="EMPLOYEE"
              handlePress = {() => router.push('/sign-up-employee')} //Linking to employee registration
              containerStyles="w-full mt-7"
              textStyles="font-lexend-bold"
          />
          <CustomButton 
              title="EMPLOYER"
              handlePress = {() => router.push('/sign-up-employeer')} //Linking to employer registration
              containerStyles="w-full mt-7"
              textStyles="font-lexend-bold"
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Onboarding