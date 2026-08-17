import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {WebView} from 'react-native-webview';
import Feather from 'react-native-vector-icons/Feather';
import {colors, fonts} from '../../theme';
import LinearGradient from 'react-native-linear-gradient';

const WebViewScreen = ({route, navigation}) => {
  const {url, title = 'Web Page'} = route?.params || {};

  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
       <LinearGradient
              colors={['#5CA8E8', '#8DD66B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Feather
            name="arrow-left"
            size={20}
            color={colors.textPrimary}
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
          numberOfLines={1}
  ellipsizeMode="tail">
          {title}
        </Text>
      </View>
      </LinearGradient>

      {/* WEBVIEW */}
      <View style={styles.webViewContainer}>
        <WebView
          source={{uri: url}}
          style={styles.webView}
          startInLoadingState
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled
          domStorageEnabled
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator
              size="large"
              color={colors.darkPrimary}
            />

            <Text style={styles.loadingText}>
              Loading...
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default WebViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F7FD',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: fonts.bold,
    paddingRight: 80
  },

  webViewContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },

  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
});