import { ScrollView, Text, View } from 'react-native';
import { Link, Redirect, router} from 'expo-router';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../components/CustomButton';

const Onboarding = () => {
  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{height: '100%',}}>
        <View className="w-full justify-center items-center h-full px-4 my-4 min-h-[85vh]">
          <Image 
            source={require('../../assets/images/onboarding.png')}
            className = "w-full h-[300px]"
            resizeMode="contain"
          />

          <Text className = "text-tcolor text-3xl text-center font-lexend-bold">
            CHOOSE USER:
          </Text>

          <View className = "relative mt-5 items-center">
           <Text className = "text-center text-tcolor font-lexend">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Interdum dictum tempus, interdum at dignissim metus. Ultricies sed nunc.
            </Text>
          </View>
          <CustomButton 
              title="EMPLOYEE"
              handlePress = {() => router.push('/sign-up-employee')} //Linking to another screen
              containerStyles="w-full mt-7"
              textStyles="font-lexend-bold"
          />
            <CustomButton 
              title="EMPLOYER"
              handlePress = {() => router.push('/sign-up-employeer')} //Linking to another screen
              containerStyles="w-full mt-7"
              textStyles="font-lexend-bold"
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Onboarding