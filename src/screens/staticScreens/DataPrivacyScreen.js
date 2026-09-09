import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { WebView } from 'react-native-webview';
import Feather from 'react-native-vector-icons/Feather';

import { colors, fonts } from '../../theme';
import { useLegalContentQuery } from '../../hooks/queries/useContentQueries';

export default function DataPrivacyScreen({ navigation, route }) {
  const slug = route?.params?.slug || 'privacy_policy';
  const { data, isLoading, isError, error } = useLegalContentQuery(slug);
  const content = data?.content;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={colors.gradient}>
        <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Feather
            name="arrow-left"
            size={22}
            color="#fff"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          {content?.title || 'Your Data, Your Rights.'}
        </Text>

        <Text style={styles.subtitle}>
          {route?.params?.slug == "privacy_policy" ? 'Your privacy and control over your personal data.' :
            'Your Terms and Conditions over your personal data.'}
        </Text>
        </View>
      </LinearGradient>

      {/* CONTENT */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.loadingText}>
            {route?.params?.slug === "privacy_policy" ? " Loading privacy policy..." : "Loading terms and condition..."}
          </Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <View style={styles.errorIcon}>
            <Feather
              name="alert-circle"
              size={28}
              color="#DC2626"
            />
          </View>

          <Text style={styles.errorTitle}>
            {route?.params?.slug === "privacy_policy" ? "Unable to load privacy policy" : "Unable to load terms and condition"}
          </Text>

          <Text style={styles.errorText}>
            {error?.message || 'Something went wrong. Please try again.'}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.replace('DataPrivacyScreen')}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : content?.body ? (
        <WebView
          source={{
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                  />

                  <style>
                    * {
                      box-sizing: border-box;
                    }

                    body {
                      margin: 0;
                      padding: 20px 16px 40px;
                      background: #F4F7FD;
                      color: #1F2937;
                      font-family:
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        sans-serif;
                      font-size: 15px;
                      line-height: 1.65;
                    }

                    h1 {
                      color: #111827;
                      font-size: 24px;
                      line-height: 1.3;
                      margin: 0 0 18px;
                    }

                    h2 {
                      color: #111827;
                      font-size: 19px;
                      line-height: 1.4;
                      margin: 24px 0 10px;
                    }

                    h3 {
                      color: #111827;
                      font-size: 16px;
                      margin: 20px 0 8px;
                    }

                    p {
                      margin: 0 0 14px;
                    }

                    ul,
                    ol {
                      margin-top: 8px;
                      margin-bottom: 16px;
                      padding-left: 22px;
                    }

                    li {
                      margin-bottom: 8px;
                    }

                    strong {
                      color: #111827;
                    }

                    a {
                      color: #2E76FF;
                    }

                    img {
                      max-width: 100%;
                      height: auto;
                    }

                    table {
                      width: 100%;
                      border-collapse: collapse;
                      margin: 16px 0;
                    }

                    th,
                    td {
                      padding: 8px;
                      border: 1px solid #E5E7EB;
                      text-align: left;
                    }

                    blockquote {
                      margin: 16px 0;
                      padding: 12px 16px;
                      background: #EEF2F7;
                      border-left: 4px solid #2E76FF;
                    }
                  </style>
                </head>

                <body>
                  ${content.body}
                </body>
              </html>
            `,
          }}
          style={styles.webview}
          originWhitelist={['*']}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled
          domStorageEnabled
        />
      ) : (
        <View style={styles.center}>
          <Feather
            name="file-text"
            size={32}
            color="#94A3B8"
          />

          <Text style={styles.errorTitle}>
            {route?.params?.slug === "privacy_policy" ? "Privacy Policy Unavailable" : "Terms and Condition Unavailable"}
          </Text>

          <Text style={styles.errorText}>
            {route?.params?.slug === "privacy_policy" ? "No privacy policy content is currently available." : "No terms and condition content is currently available."}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FD',
  },

 header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 20 },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    lineHeight: 34,
    color: '#fff',
  },

  subtitle: {
    fontFamily: fonts.medium,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },

  webview: {
    flex: 1,
    backgroundColor: '#F4F7FD',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },

  errorIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  errorTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  errorText: {
    marginTop: 7,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },

  retryText: {
    color: '#fff',
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
});