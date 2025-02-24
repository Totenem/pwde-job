import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View } from 'react-native';
import { Link, Redirect, router} from 'expo-router';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';
// import '../assets/images'

export default function App() {
  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{height: '100%',}}>
        <View className="w-full justify-center items-center h-full px-4">
          <Image 
            source={require('../assets/images/onboarding.png')}
            className = "w-full h-[300px]"
            resizeMode="contain"
          />

          <Text className = "text-tcolor text-3xl text-center font-lexend-bold">
            READY TO START ON A NEW JOURNEY
          </Text>

          <View className = "relative mt-5 items-center">
           <Text className = "text-center text-tcolor font-lexend">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Interdum dictum tempus, interdum at dignissim metus. Ultricies sed nunc.
            </Text>
          </View>
          <CustomButton 
              title="GET STARTED"
              handlePress = {() => router.push('/onboarding')} //Linking to another screen
              containerStyles="w-full mt-7"
              textStyles="font-lexend-bold"
          />

          <View className="gap-2 pt-5 justify-center items-center flex-row">
            <Text className="font-lexend">
              Already have an account? <Link href="/sign-in" className="font-lexend-bold">Sign In</Link>
            </Text>
          </View>
        </View>
      </ScrollView>
      <StatusBar backgroundColor='#ECE0D1' />
    </SafeAreaView>
  );
}