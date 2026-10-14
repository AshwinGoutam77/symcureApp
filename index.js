import { AppRegistry } from 'react-native';
// import {
//   getMessaging,
//   setBackgroundMessageHandler,
// } from '@react-native-firebase/messaging';
// import notifee, { AndroidImportance } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';


// setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
//   console.log('BG MESSAGE:', remoteMessage);

//   // Messages with a `notification` block are shown by Android automatically.
//   // Data-only messages must be displayed manually.
//   if (remoteMessage.notification) return;

//   const channelId = await notifee.createChannel({
//     id: 'default',
//     name: 'General',
//     importance: AndroidImportance.HIGH,
//   });

//   await notifee.displayNotification({
//     title: remoteMessage.data?.title,
//     body: remoteMessage.data?.body,
//     data: remoteMessage.data,
//     android: { channelId, pressAction: { id: 'default' } },
//   });
// });

// Required by Notifee for events while the app is in background
// notifee.onBackgroundEvent(async () => {});

AppRegistry.registerComponent(appName, () => App);