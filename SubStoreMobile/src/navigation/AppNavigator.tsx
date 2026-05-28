import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';

import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import ArtifactsScreen from '../screens/ArtifactsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SubscriptionDetailScreen from '../screens/SubscriptionDetailScreen';
import CollectionDetailScreen from '../screens/CollectionDetailScreen';
import ServerSetupScreen from '../screens/ServerSetupScreen';
import PreviewScreen from '../screens/PreviewScreen';
import LogsScreen from '../screens/LogsScreen';
import SyncScreen from '../screens/SyncScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';

          if (route.name === 'Subscriptions') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Collections') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'Artifacts') {
            iconName = focused ? 'code-working' : 'code-working-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Subscriptions" 
        component={SubscriptionsScreen}
        options={{ title: '订阅管理' }}
      />
      <Tab.Screen 
        name="Collections" 
        component={CollectionsScreen}
        options={{ title: '集合管理' }}
      />
      <Tab.Screen 
        name="Artifacts" 
        component={ArtifactsScreen}
        options={{ title: '制品管理' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: '设置' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: colors.background === '#0F172A',
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ServerSetup" 
          component={ServerSetupScreen}
          options={{ title: '服务器配置' }}
        />
        <Stack.Screen 
          name="SubscriptionDetail" 
          component={SubscriptionDetailScreen}
          options={{ title: '订阅详情' }}
        />
        <Stack.Screen 
          name="CollectionDetail" 
          component={CollectionDetailScreen}
          options={{ title: '集合详情' }}
        />
        <Stack.Screen 
          name="Preview" 
          component={PreviewScreen}
          options={{ title: '预览' }}
        />
        <Stack.Screen 
          name="Logs" 
          component={LogsScreen}
          options={{ title: '日志' }}
        />
        <Stack.Screen 
          name="Sync" 
          component={SyncScreen}
          options={{ title: '同步' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
