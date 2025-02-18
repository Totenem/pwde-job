import { View, Text } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const AdditionalInfo = () => {
  return (
    <>
       <Stack>
       <Stack.Screen 
          name='additional-info-employee' 
          options={{headerShown: false}} 
        />
        <Stack.Screen 
          name='additional-info-employer' 
          options={{headerShown: false}} 
        />
       </Stack>
    </>
  )
}

export default AdditionalInfo