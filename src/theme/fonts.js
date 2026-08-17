import { Platform } from 'react-native';

const fonts = {
  regular: 'Montserrat-Regular',
  medium: Platform.OS === 'ios' ? 'Montserrat-Regular': 'Montserrat-Medium',
  semiBold: Platform.OS === 'ios' ? 'Montserrat-Medium': 'Montserrat-SemiBold',
  bold: Platform.OS === 'ios' ? 'Montserrat-SemiBold' : 'Montserrat-Bold',
};

export default fonts;
