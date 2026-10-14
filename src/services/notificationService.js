import { Platform, PermissionsAndroid } from 'react-native';
import {
  getMessaging,
  getToken,
  deleteToken,
  requestPermission as requestFcmPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';

export const ensureDefaultChannel = () =>
  notifee.createChannel({
    id: 'default',
    name: 'General',
    importance: AndroidImportance.HIGH,
  });

export const requestPermission = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version < 33) return true; // no runtime permission before Android 13
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return res === PermissionsAndroid.RESULTS.GRANTED;
  }

  const status = await requestFcmPermission(getMessaging());
  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  );
};

// Send token to backend — confirm this endpoint exists on your server
export const registerDeviceToken = async () => {
  const token = await getToken(getMessaging());
  console.log('FCM TOKEN:', token);
  if (!token) return;

  const saved = await AsyncStorage.getItem('fcm_token');
  if (saved === token) return; // already registered

  await apiClient.post('/patient/device-tokens', {
    token,
    platform: Platform.OS,
  });

  await AsyncStorage.setItem('fcm_token', token);
  console.log('FCM TOKEN REGISTERED WITH BACKEND');
};

export const unregisterDeviceToken = async () => {
  try {
    const token = await AsyncStorage.getItem('fcm_token');
    if (token) {
      await apiClient.delete('/patient/device-tokens', { data: { token } });
    }
    await deleteToken(getMessaging());
    await AsyncStorage.removeItem('fcm_token');
  } catch (e) {
    console.log('UNREGISTER TOKEN ERROR:', e);
  }
};

// Show the notification while app is in foreground
export const displayForegroundNotification = async remoteMessage => {
  const channelId = await ensureDefaultChannel();

  await notifee.displayNotification({
    title: remoteMessage.notification?.title ?? remoteMessage.data?.title,
    body: remoteMessage.notification?.body ?? remoteMessage.data?.body,
    data: remoteMessage.data,
    android: { channelId, pressAction: { id: 'default' } },
  });
};