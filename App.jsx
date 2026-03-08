import React from 'react';
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
// import 'expo-router/entry';
import Toast from 'react-native-toast-message';


export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Wrapper paddingHorizontal={0} paddingVertical={0}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5"/>
      <AppNavigator />
      <Toast />
    </Wrapper>
  );
}

const styles = StyleSheet.create({
 
});