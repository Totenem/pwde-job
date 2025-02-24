import { View, Text, TextInput, ScrollView, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

const MessagePreview = ({ name, lastMessage, time, unread }) => (
  <TouchableOpacity 
    className="flex-row items-center p-4 border-b border-gray-200 bg-[#114640] mb-2 mx-2 rounded-xl active:bg-gray-700"
    onPress={() => router.push({ pathname: '/chat', params: { name } })}
  >
    <View className="h-12 w-12 rounded-full bg-button justify-center items-center">
      <Text className="text-white font-lexend-bold text-lg">{name[0]}</Text>
    </View>
    <View className="flex-1 ml-4">
      <View className="flex-row justify-between items-center">
        <Text className="font-lexend-bold text-xl text-white">{name}</Text>
        <Text className="font-lexend text-gray-300 text-lg">{time}</Text>
      </View>
      <Text 
        numberOfLines={1} 
        className={`font-lexend text-lg ${unread ? 'text-white' : 'text-gray-400'}`}
      >
        {lastMessage}
      </Text>
    </View>
    {unread && (
      <View className="h-3 w-3 rounded-full bg-[#00ccb4] ml-2" />
    )}
  </TouchableOpacity>
)

const Messages = () => {
  const dummyChats = [
    { name: 'John Doe', lastMessage: 'Thanks for the opportunity!', time: '2m ago', unread: true },
    { name: 'Alice Smith', lastMessage: 'When can you start?', time: '1h ago', unread: false },
    { name: 'Bob Wilson', lastMessage: 'The position has been filled', time: '2h ago', unread: true },
    { name: 'Emma Brown', lastMessage: 'Please send your portfolio', time: '1d ago', unread: false },
  ]

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="px-4 py-2">
        <Text className="font-lexend-bold text-3xl text-tcolor mb-4">Messages</Text>
        <View className="bg-inputField rounded-xl px-4 mb-4">
          <TextInput
            placeholder="Search messages"
            placeholderTextColor="#ffffff80"
            className="h-12 font-lexend text-white"
          />
        </View>
      </View>

      <ScrollView className="flex-1">
        {dummyChats.map((chat, index) => (
          <MessagePreview key={index} {...chat} />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export default Messages