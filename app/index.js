import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { useJwtAuth } from './Api/jwtAuth';
import { router, Link } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';
// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { isLoggedIn, login } = useJwtAuth();
  const [userInfo, setUserInfo] = useState(null);
 
 
  async function fetchUserInfo() {
    const storedUserInfo = await AsyncStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }


  useEffect(() => {
    async function fetchDataAndPrepare() {
      try {
        // Mengambil informasi pengguna
        const storedUserInfo = await AsyncStorage.getItem('userInfo');
        if (storedUserInfo) {
          setUserInfo(JSON.parse(storedUserInfo));
        }

        // Memuat font
        await Font.loadAsync(Entypo.font);

        // Menunggu 1 detik untuk simulasi delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Menavigasi pengguna berdasarkan informasi yang didapat
        if (isLoggedIn && userInfo) {
          console.log("test 1");
          if (userInfo.role === "TRAINEE" || userInfo.role === 'TRAINEE_INSTRUCTOR' || userInfo.role === 'TRAINEE_CPTS') {
            router.replace('(tabs)');
          } else if (userInfo.role === 'INSTRUCTOR' || userInfo.role === 'INSTRUCTOR_CPTS') {
            router.replace('(tabsinstructor)');
          } else if (userInfo.role === 'CPTS') {
            router.replace('(tabscpts)');
          }
        } else {
          console.log("test 2");
          router.replace('login');
        }
      } catch (e) {
        console.warn(e);
      } finally {
        // Setelah semua proses selesai, tandai aplikasi sebagai siap
        setAppIsReady(true);
      }
    }

    // Memanggil fungsi fetchDataAndPrepare() saat komponen mount
    fetchDataAndPrepare();
  }, [isLoggedIn]);



  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      onLayout={onLayoutRootView}>
      <Text>SplashScreen Demo! 👋</Text>
      <Entypo name="rocket" size={30} />
    </View>
  );
}