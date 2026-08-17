import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function SplashScreen() {
  return (
    <LinearGradient
      colors={['#438ae8', '#79cc64']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* Top Section */}
      <View style={styles.top}>
        <View style={styles.logoChip}>
          <View style={styles.dot} />
          <Text style={styles.logoText}>SYMCURE HEALTH</Text>
        </View>
      </View>

      {/* Center Content */}
      <View style={styles.center}>
        <Text style={styles.icon}>📋</Text>

        <Text style={styles.title}>
          Prescriptions{'\n'}
          <Text style={styles.highlight}>instantly.</Text>
        </Text>

        <Text style={styles.subtitle}>
          MoHFW 2020-compliant digital prescriptions the moment your
          consultation ends. Always accessible.
        </Text>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          <View style={styles.dotSmall} />
          <View style={styles.dotSmall} />
          <View style={[styles.dotSmall, styles.activeDot]} />
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Create Account →</Text>
        </TouchableOpacity>

        {/* Login */}
        <Text style={styles.loginText}>
          Have an account? <Text style={styles.loginLink}>Sign In →</Text>
        </Text>

        {/* Footer */}
        <Text style={styles.footer}>
          🚨 For medical emergencies, call 112. This app is for non-emergency consultations only.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  top: {
    marginTop: 60,
  },

  logoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
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
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
  },

  icon: {
    fontSize: 60,
    marginBottom: 20,
  },

  title: {
    fontSize: 34,
    color: '#fff',
    fontWeight: '800',
    lineHeight: 42,
  },

  highlight: {
    color: '#cde3ff',
    fontStyle: 'italic',
  },

  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 12,
    lineHeight: 22,
  },

  bottom: {
    marginBottom: 40,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },

  dotSmall: {
    width: 6,
    height: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },

  activeDot: {
    width: 20,
    backgroundColor: '#fff',
  },

  button: {
    backgroundColor: '#fff',
    height: 54,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  buttonText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#000',
  },

  loginText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 10,
  },

  loginLink: {
    color: '#fff',
    fontWeight: '700',
  },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 16,
  },
});