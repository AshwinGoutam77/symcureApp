import React, {useRef, useState} from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import {colors, fonts, spacing} from '../../theme';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slide from './Slide';

const {width} = Dimensions.get('window');

const DATA = [
  {
    id: '1',
    icon: <Feather name="search" size={60} color="#fff" />,
    title: 'Find the right',
    highlight: 'doctor, fast.',
    subtitle:
      'Browse verified doctors across 12+ specialties. Book video or clinic visits in under 2 minutes.',
  },
  {
    id: '2',
    icon: <Feather name="video" size={60} color="#fff" />,
    title: 'Consult from',
    highlight: 'anywhere.',
    subtitle:
      'Video call from your sofa or visit the clinic — your health, your schedule, your way.',
  },
  {
    id: '3',
    icon: <MIcon name="file-document-outline" size={60} color="#fff" />,
    title: 'Prescriptions',
    highlight: 'instantly.',
    subtitle:
      'MoHFW 2020-compliant digital prescriptions the moment your consultation ends. Always accessible.',
  },
];

export default function OnboardingScreen({navigation}) {
  const [index, setIndex] = useState(0);
  const flatListRef = useRef();

  const onScroll = e => {
    const slideIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(slideIndex);
  };

  const nextSlide = () => {
    if (index < DATA.length - 1) {
      flatListRef.current.scrollToIndex({index: index + 1});
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <LinearGradient colors={colors.gradient} style={styles.container}>
      {/* Top Logo */}
      <View style={styles.top}>
        {/* <View style={styles.logoChip}>
          <View style={styles.dot} />
          <Text style={styles.logoText}>SYMCURE HEALTH</Text>
        </View> */}
        <Image
          source={require('../../assets/images/white-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Slider */}
      <FlatList
        ref={flatListRef}
        data={DATA}
        renderItem={({item}) => <Slide item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      {/* Bottom */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {DATA.map((_, i) => (
            <View
              key={i}
              style={[styles.dotSmall, index === i && styles.activeDot]}
            />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.button} onPress={nextSlide}>
          <Text style={styles.buttonText}>
            {index === DATA.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Feather name="arrow-right" size={16} color="black" />
        </TouchableOpacity>

        {/* Login */}
        {/* <Text style={styles.loginText}>
          Have an account?{' '}
          <Text
            style={styles.loginLink}
            onPress={() => navigation.replace('Login')}>
            Sign In
          </Text>
        </Text> */}

        <View style={styles.emergencyBox}>
          <Text style={styles.emergencyText}>
            For medical emergencies, call <Text style={styles.bold}>112</Text>.
            This app is for non-emergency consultations only.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  top: {
    marginTop: 60,
    paddingHorizontal: 24,
  },

  logo: {
    width: 180,
    height: 60,
  },

  slider: {
    flex: 1,
  },

  bottom: {
    padding: 24,
  },
  logoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: '#79cc64',
    borderRadius: 10,
    marginRight: 6,
  },
  logoText: {
    color: colors.textWhite,
    fontWeight: '700',
    fontSize: 11,
    fontFamily: fonts.bold,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },

  dotSmall: {
    width: 7,
    height: 7,
    backgroundColor: colors.textWhite,
    margin: 4,
    borderRadius: 10,
  },

  activeDot: {
    width: 30,
    backgroundColor: colors.textWhite,
  },

  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
    color: 'black',
    height: 54,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },

  buttonText: {fontWeight: '700', color: 'black'},

  loginText: {
    textAlign: 'center',
    color: colors.textWhite,
    marginBottom: 10,
    fontFamily: fonts.regular,
  },

  loginLink: {fontWeight: '700', color: colors.textWhite},

  emergencyBox: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },

  emergencyText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textWhite,
    lineHeight: 16,
    fontFamily: fonts.regular,
  },

  bold: {
    fontFamily: fonts.semiBold,
    color: colors.textWhite,
  },
});
