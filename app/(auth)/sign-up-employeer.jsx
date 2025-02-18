import { View, Text , ScrollView} from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import InputField from '../../components/InputField'
import { useState } from 'react'
import CustomButton  from '../../components/CustomButton'
import { Link, router } from 'expo-router'

const SignUpEmployeer = () => {
  // function usestate for the form
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employer'
  })

  // Function for the button
  const [isSubmitting, setisSubmitting] = useState(false)

  const submit = () =>{
    router.push('/additional-info-employer')
  }

  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{height: '100%'}}>
        <View className = "w-full justify-center h-auto px-4 my-4 min-h-[85vh]">

          <Text className = "font-lexend-bold text-tcolor text-2xl text-center">Welcome Onbaord!</Text>
          <Text className = "font-lexend text-tcolor text-xl mt-4 text-center">Let's help you find your dream Worker!</Text>

          {/* Input fields */}
          <InputField  //Full NAME
            title="Full Name"
            value={form.fullName}
            placeholder="Enter Full Name"
            handleChangeText={(e) => setForm({...form, fullName: e})}
            keyboardType="default"
            otherStyles="mt-7"
          />
          <InputField  //Email
            title="Email"
            value={form.email}
            placeholder="Enter Email"
            handleChangeText={(e) => setForm({...form, email: e})}
            keyboardType="email-address"
            otherStyles="mt-7"
          />
          <InputField  //PassWord
            title="Password"
            value={form.password}
            placeholder="Enter Password"
            handleChangeText={(e) => setForm({...form, password: e})}
            keyboardType="default"
            otherStyles="mt-7"
          />
          <InputField  //Confirm Password
            title="Confirm Password"
            value={form.confirmPassword}
            placeholder="Confirm Your Password"
            handleChangeText={(e) => setForm({...form, confirmPassword: e})}
            keyboardType="default"
            otherStyles="mt-7"
          />

          <CustomButton 
            title= "Next"
            handlePress = {submit}
            containerStyles = "mt-7"
            isLoading = {isSubmitting}
            textStyles="font-lexend-bold"
          />

          <View className = "gap-2 pt-5 justify-center items-center flex-row">
            <Text className= "font-lexend">Already have an account ? <Link href={"/sign-in"} className='font-lexend-bold'>Sign In</Link></Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUpEmployeer