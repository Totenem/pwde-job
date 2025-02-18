import { View, Text, Image } from 'react-native'
import React from 'react'
import { Tabs, Redirect } from 'expo-router'

import { icons } from '../../constants'

const TabIcon = ({ icon, color, name, focused}) => {
  return(
    <View>
      <Image 
        source={icon}
        resizeMode='conatin'
        tintColor={color}
        className = "w-6 h-6"
      />
    </View>
  )
}

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor: '#ECE0D1',
          tabBarStyle:{
            backgroundColor: '#00897B',
            height: 50
          }
        }}
      >
        <Tabs.Screen 
          name='home'
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({color, focused}) =>(
              <TabIcon 
                icon={icons.home}
                name='Home'
                color={color}
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen 
          name='messages'
          options={{
            title: 'Message',
            headerShown: false,
            tabBarIcon: ({color, focused}) =>(
              <TabIcon 
                icon={icons.message}
                name='Message'
                color={color}
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen 
          name='notification'
          options={{
            title: 'Notification',
            headerShown: false,
            tabBarIcon: ({color, focused}) =>(
              <TabIcon 
                icon={icons.notification}
                name='Notification'
                color={color}
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen 
          name='menu'
          options={{
            title: 'Menu',
            headerShown: false,
            tabBarIcon: ({color, focused}) =>(
              <TabIcon 
                icon={icons.menu}
                name='Menu'
                color={color}
                focused={focused}
              />
            )
          }}
        />
      </Tabs>
    </>
  )
}

export default TabsLayout