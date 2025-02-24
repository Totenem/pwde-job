import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'

const ChatBubble = ({ message, time, isUser }) => (
  <View className={`flex-row ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    <View 
      className={`rounded-2xl px-4 py-2 max-w-[80%] ${isUser ? 'bg-button' : 'bg-[#114640]'}`}
    >
      <Text className="text-white font-lexend text-base">{message}</Text>
      <Text className="text-gray-300 font-lexend text-xs mt-1">{time}</Text>
    </View>
  </View>
)

const Chat = () => {
  const params = useLocalSearchParams()
  const [message, setMessage] = useState('')
  
  // Dummy chat data - in a real app, this would come from a backend
  const chatHistory = [
    { message: 'Hi, I saw your job posting for a UI Designer', time: '10:00 AM', isUser: true },
    { message: 'Hello! Yes, are you interested in the position?', time: '10:02 AM', isUser: false },
    { message: 'Yes, I have 3 years of experience in UI/UX design', time: '10:03 AM', isUser: true },
    { message: 'Great! Could you share your portfolio?', time: '10:05 AM', isUser: false },
  ]

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-row items-center px-4 py-2 border-b border-gray-700">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4"
        >
          <Text className="text-button text-[#114640] font-lexend-bold text-lg">Back</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="font-lexend-bold text-xl text-tcolor">{params.name}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {chatHistory.map((chat, index) => (
          <ChatBubble key={index} {...chat} />
        ))}
      </ScrollView>

      <View className="p-4 border-t border-gray-700">
        <View className="flex-row items-center bg-inputField rounded-xl px-4">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#ffffff80"
            className="flex-1 h-12 font-lexend text-white"
          />
          <TouchableOpacity 
            onPress={() => {
              if (message.trim()) {
                // Here you would typically send the message to your backend
                console.log('Sending message:', message)
                setMessage('')
              }
            }}
            className="ml-2"
          >
            <Text className="text-button font-lexend-bold">Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Chat