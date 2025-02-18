import { View, Text, ScrollView, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CardSwiper from '../../components/CardSwiper'

const Home = () => {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1">
        <CardSwiper />
      </View>
    </SafeAreaView>
  )
}

export default Home