import { View, Text } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const MenuLayout = () => {
  return (
    <>
       <Stack>
        <Stack.Screen 
          name='profile'
          options={{headerShown: false}}
        />
        <Stack.Screen
          name='security'
          options={{headerShown: false}}
        />
        <Stack.Screen
          name='settings'
          options={{headerShown: false}}
        />
        <Stack.Screen
          name='about'
          options={{headerShown: false}}
        />
        <Stack.Screen
          name='job-listings'
          options={{headerShown: false}}
        />
        <Stack.Screen
          name='create-job'
          options={{headerShown: false}}
        />
        <Stack.Screen
          name='job/[id]'
          options={{headerShown: false}}
        />
       </Stack>
    </>
  )
}

export default MenuLayout