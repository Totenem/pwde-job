import { View, Text, ScrollView, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import InputField from '../../components/InputField'
import CustomButton  from '../../components/CustomButton'
import { useState } from 'react'
import { Link } from 'expo-router'

const SignIn = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [isSubmitting, setisSubmitting] = useState(false)

  const signin = () =>{

  }

  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{height: '100%'}}>
        <View className = "w-full justify-center h-auto px-4 my-4 min-h-[85vh]">
          {/* iMAGE */}
          <Text className= "text-center text-tcolor text-3xl font-lexend-bold">
            Welcome To PWDe Job!
          </Text>
          <Image 
            source={require('../../assets/images/onboarding.png')}
            className = "w-full h-[250px]"
            resizeMode="contain"
          />

          {/* Input fields */}
          <InputField  //Email
            title="Email"
            value={form.email}
            placeholder="Enter Email"
            handleChangeText={(e) => setForm({...form, email: e})}
            keyboardType="default"
            otherStyles="mt-7"
          />
          <InputField  //password
            title="Password"
            value={form.password}
            placeholder="Enter Password"
            handleChangeText={(e) => setForm({...form, password: e})}
            keyboardType="default"
            otherStyles="mt-7"
          />

          <View className = "gap-2 pt-2 justify-center items-center flex-row">
            <Link href={"/password-recovery"} className='text-lg font-lexend-bold'>Forgot Password</Link>
          </View>

          {/* Button right here */}
         <CustomButton 
            title= "Sign In"
            handlePress = {signin}
            containerStyles = "mt-7"
            isLoading = {isSubmitting}
            textStyles="font-lexend-bold"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn