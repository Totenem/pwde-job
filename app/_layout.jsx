import { SplashScreen, Stack } from  'expo-router'
import "../global.css"
import { useFonts } from 'expo-font'
import { useEffect } from 'react'

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Lexend-Regular": require("../assets/fonts/Lexend-Regular.ttf"),
    "Lexend-Bold": require("../assets/fonts/Lexend-Bold.ttf"),
    "Lexend-Medium": require("../assets/fonts/Lexend-Medium.ttf"),
  });
  
  useEffect(() => {
    if (error) {
      console.error(error);
      return;
    }
  
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);
  
  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <Stack>
        <Stack.Screen name='index' options={{headerShown: false}} />
    </Stack>
  )
}

export default RootLayout