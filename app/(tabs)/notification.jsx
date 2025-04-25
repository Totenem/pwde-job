import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const NotificationItem = ({ type, title, message, time }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'job-match':
        return {
          bgColor: 'bg-[#114640]',
          iconColor: 'bg-[#00ccb4]',
          icon: '🎯'
        }
      case 'rejection':
        return {
          bgColor: 'bg-[#114640]',
          iconColor: 'bg-button',
          icon: '❌'
        }
      default:
        return {
          bgColor: 'bg-[#114640]',
          iconColor: 'bg-gray-500',
          icon: '📋'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <TouchableOpacity 
      className={`flex-row items-center p-4 mb-2 mx-2 rounded-xl ${styles.bgColor} active:bg-gray-700`}
    >
      <View className={`h-12 w-12 rounded-full ${styles.iconColor} justify-center items-center`}>
        <Text className="text-2xl">{styles.icon}</Text>
      </View>
      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-center">
          <Text className="font-lexend-bold text-xl text-white">{title}</Text>
          <Text className="font-lexend text-gray-300 text-lg">{time}</Text>
        </View>
        <Text 
          numberOfLines={2} 
          className="font-lexend text-lg text-gray-300"
        >
          {message}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const Notification = () => {
  const notifications = [
    {
      type: 'job-match',
      title: 'New Job Match',
      message: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      time: '2m ago'
    },
    {
      type: 'rejection',
      title: 'Application Update',
      message: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      time: '2h ago'
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="px-4 py-2">
        <Text className="font-lexend-bold text-3xl text-tcolor mb-4">Notifications</Text>
      </View>

      <ScrollView className="flex-1">
        {notifications.map((notification, index) => (
          <NotificationItem key={index} {...notification} />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export default Notification