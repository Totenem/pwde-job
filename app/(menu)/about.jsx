import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../../components/CustomButton'

const About = () => {
  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{height: '100%'}}>
        <View className="w-full justify-center h-auto px-4 my-4 min-h-[85vh]">
          <Text className="font-lexend-bold text-3xl">About</Text>

          <View className="mt-7">
            <Text className="font-lexend-bold text-xl mb-4">App Information</Text>
            <Text className="font-lexend text-base mb-4">
              PWD E-Job is a dedicated platform designed to connect Persons with Disabilities (PWDs) with meaningful employment opportunities. Our mission is to create an inclusive job marketplace that empowers PWDs and helps employers build diverse, talented teams.
            </Text>

            <Text className="font-lexend-bold text-base mt-4">Version</Text>
            <Text className="font-lexend text-base mb-4">1.0.0</Text>

            <Text className="font-lexend-bold text-base mt-4">Developer</Text>
            <Text className="font-lexend text-base mb-4">PWD E-Job Team</Text>
          </View>

          <View className="mt-7">
            <Text className="font-lexend-bold text-xl mb-4">Legal</Text>
            <CustomButton
              title="TERMS OF SERVICE"
              handlePress={() => console.log('View terms of service')}
              containerStyles="w-full mb-4"
              textStyles="font-lexend-bold"
            />
            <CustomButton
              title="PRIVACY POLICY"
              handlePress={() => console.log('View privacy policy')}
              containerStyles="w-full mb-4"
              textStyles="font-lexend-bold"
            />
            <CustomButton
              title="LICENSES"
              handlePress={() => console.log('View licenses')}
              containerStyles="w-full"
              textStyles="font-lexend-bold"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default About