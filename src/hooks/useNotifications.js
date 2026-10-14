import { useEffect } from 'react';
import {
    getMessaging,
    onMessage,
    onTokenRefresh,
    onNotificationOpenedApp,
    getInitialNotification,
} from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import {
    requestPermission,
    registerDeviceToken,
    displayForegroundNotification,
    ensureDefaultChannel,
} from '../services/notificationService';

// navigationRef is used to open a screen when a notification is tapped
export default function useNotifications(navigationRef) {
    useEffect(() => {
        const messaging = getMessaging();

        const handleOpen = data => {
            if (!data?.screen) return;
            const go = () =>
                navigationRef.navigate(data.screen, {
                    appointmentId: data.appointment_id,
                });
            if (navigationRef.isReady()) go();
            else setTimeout(() => navigationRef.isReady() && go(), 500);
        };

        (async () => {
            try {
                await ensureDefaultChannel();
                const allowed = await requestPermission();
                console.log('NOTIF PERMISSION:', allowed);
                if (allowed) await registerDeviceToken();
            } catch (e) {
                console.log('NOTIFICATION SETUP ERROR:', e);
            }
        })();

        // Foreground messages
        const unsubMessage = onMessage(messaging, displayForegroundNotification);

        // Token refreshed
        const unsubToken = onTokenRefresh(messaging, () =>
            registerDeviceToken().catch(e => console.log('TOKEN REFRESH ERROR:', e)),
        );

        // Tap while app in background
        const unsubOpened = onNotificationOpenedApp(messaging, msg =>
            handleOpen(msg?.data),
        );

        // Tap that launched the app from killed state
        getInitialNotification(messaging).then(msg => handleOpen(msg?.data));

        // Tap on a notification shown by Notifee (foreground)
        const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.PRESS) handleOpen(detail.notification?.data);
        });

        return () => {
            unsubMessage();
            unsubToken();
            unsubOpened();
            unsubNotifee();
        };
    }, [navigationRef]);
}