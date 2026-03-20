import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import AppNavigator from './src/navigations/AppNavigator';
import Wrapper from './src/Wrapper/wrapper';
import useAppStore from './store/useAppStore';
import useAuthStore from './store/useAuthStore';
// import 'expo-router/entry';
import Toast from 'react-native-toast-message';
import Loader from './src/components/Loader/Loader';


export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const loadAuth = useAuthStore((state) => state.loadAuth)
  const initializeApp = useAppStore((state) => state.initializeApp)
  const setAutoJoinOnLogin = useAppStore((state) => state.setAutoJoinOnLogin)
  const isInitialized = useAppStore((state) => state.isInitialized)
  const isLoading = useAppStore((state) => state.isLoading)
  const error = useAppStore((state) => state.error)

  useEffect(() => {
  const bootstrap = async () => {
    try {
      const { token, userEmail } = await loadAuth()
      // console.log('🔑 bootstrap token:', token)
      // console.log('📧 bootstrap email:', userEmail)
      if (token && userEmail) {
        setAutoJoinOnLogin(true)
      }
      await initializeApp(token, userEmail)
    } catch(e) {
      console.error('bootstrap failed:', e)
      // even if it fails, dont leave user on white screen
      useAppStore.setState({ isInitialized: true, isLoading: false })
    }
  }
  bootstrap()
}, [])

  if (isLoading || !isInitialized) {
    return (
      <View>
        <Loader visible={isLoading} size='medium' message='loading...' overlay={true}></Loader>
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Failed to load: {error}</Text>
      </View>
    )
  }

  return (
    <Wrapper paddingHorizontal={0} paddingVertical={0}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#f5f5f5"
        translucent={false}  // ← ADD this
      />
      <AppNavigator />
      <Toast />
    </Wrapper>
  );
}

const styles = StyleSheet.create({

});