import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_SET_KEY = '@symcure_pin_set';
const LOGIN_MOBILE_KEY = '@symcure_login_mobile';

const pinStorage = {
  setPinSet: async value => {
    await AsyncStorage.setItem(
      PIN_SET_KEY,
      value ? 'true' : 'false',
    );
  },

  getPinSet: async () => {
    const value = await AsyncStorage.getItem(PIN_SET_KEY);

    console.log('PIN STORAGE RAW VALUE:', value);

    return value === 'true';
  },

  setLoginMobile: async mobile => {
    if (!mobile) {
      return;
    }

    await AsyncStorage.setItem(
      LOGIN_MOBILE_KEY,
      String(mobile),
    );
  },

  getLoginMobile: async () => {
    const mobile =
      await AsyncStorage.getItem(LOGIN_MOBILE_KEY);

    console.log(
      'PIN STORAGE MOBILE:',
      mobile,
    );

    return mobile;
  },

  clearPinStatus: async () => {
    await AsyncStorage.removeItem(PIN_SET_KEY);
    await AsyncStorage.removeItem(LOGIN_MOBILE_KEY);
  },
};

export default pinStorage;