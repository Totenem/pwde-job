import { View, Text } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const AuthLayout = () => {
  return (
    <>
       <Stack>
          <Stack.Screen 
          name='onboarding' 
          options={{headerShown: false}} 
          />
          <Stack.Screen 
          name='sign-up-employee' 
          options={{headerShown: false}} 
          />
          <Stack.Screen 
          name='sign-in' 
          options={{headerShown: false}} 
          />
       </Stack>
      <StatusBar backgroundColor='#ECE0D1' />
    </>
  )
}

export default AuthLayout