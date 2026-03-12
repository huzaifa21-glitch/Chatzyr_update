import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import useAuthStore from '../../store/useAuthStore';  // ← ADD

import LoginScreen from '../screens/auth/login';
import Register from "../screens/auth/Register";
import Start1 from "../screens/auth/Start1";
import Start2 from "../screens/auth/Start2";
import ForgotPassword1 from "../screens/auth/ForgotPassword1";
import ForgotPassword2 from "../screens/auth/ForgotPassword2";
import ForgotPassword3 from "../screens/auth/ForgotPassword3";
import TermsScreen from "../screens/auth/TermsScreen";

import HomeScreen from '../screens/Home/home';
import ClubChatScreen from "../screens/clubchat/clubchatscreen";
import UserProfileScreen from "../screens/Profile/userProfile";
import MembersScreen from "../screens/clubchat/membersScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const token = useAuthStore((state) => state.token)  // ← replaces useState isLoggedIn

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          // ✅ Logged in — user never sees auth screens again
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ClubChat" component={ClubChatScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="Members" component={MembersScreen} />
          </>
        ) : (
          // ❌ Not logged in — show auth flow
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={Register} />
            <Stack.Screen name="Start1" component={Start1} />
            <Stack.Screen name="Start2" component={Start2} />
            <Stack.Screen name="Forgot1" component={ForgotPassword1} />
            <Stack.Screen name="Forgot2" component={ForgotPassword2} />
            <Stack.Screen name="Forgot3" component={ForgotPassword3} />
            <Stack.Screen name="Terms" component={TermsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}