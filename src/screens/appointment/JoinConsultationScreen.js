/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors, fonts} from '../../theme';
import Feather from 'react-native-vector-icons/Feather';
import Button from '../../components/common/Button';

const tagsData = [
  'Fever',
  'Headache',
  'Cough',
  'Nausea',
  'Body Pain',
  'Fatigue',
  'Skin Issue',
  'Medication Query',
  'Other',
];

const JoinConsultationScreen = ({navigation}) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [text, setText] = useState('');

  const toggleTag = tag => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{paddingBottom: 120}}>
        <LinearGradient colors={colors.gradient} style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}>
            <Feather name="arrow-left" size={18} color="#060D1F" />
          </TouchableOpacity>

          <View style={styles.docRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AS</Text>
            </View>

            <View>
              <Text style={styles.name}>Dr. Anita Sharma</Text>
              <Text style={styles.sub}>General Physician · 3:00 PM today</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Sharing your concern helps the doctor prepare. This is shown to
              Dr. Sharma before the call starts — saving 3–5 min of paid
              consultation time.
            </Text>
          </View>

          <Text style={styles.title}>What's your main concern today?</Text>

          <View style={styles.textArea}>
            <TextInput
              placeholder="Describe your symptoms or reason for consultation..."
              multiline
              value={text}
              onChangeText={setText}
              maxLength={300}
            />
          </View>

          <Text style={styles.count}>{text.length}/300</Text>

          <Text style={styles.title}>Quick symptom tags</Text>

          <View style={styles.tagsWrap}>
            {tagsData.map((tag, i) => {
              const selected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => toggleTag(tag)}
                  style={[styles.tag, selected && styles.tagActive]}>
                  <Text
                    style={[styles.tagText, selected && styles.tagTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title="Join Consultation Now"
            onPress={() =>
              navigation.navigate('VideoConsultationScreen', {
                userName: 'Patient',
                callID: 'appointment_1234',
              })
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default JoinConsultationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  header: {
    padding: 16,
    paddingTop: 50,
  },

  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F7FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4DA3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },

  before: {
    color: '#ffffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  name: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    // marginVertical: 4,
    fontFamily: fonts.bold,
  },

  sub: {
    color: '#ffffffff',
    fontSize: 13,
    fontWeight: '500',
  },

  content: {
    paddingHorizontal: 16,
  },

  infoBox: {
    marginVertical: 16,
    backgroundColor: '#EAF2FF',
    padding: 14,
    borderRadius: 14,
  },

  infoText: {
    color: colors.darkPrimary,
    fontSize: 13,
    fontWeight: '700',
  },

  title: {
    marginTop: 10,
    marginBottom: 8,
    fontWeight: '700',
    fontSize: 16,
    color: colors.textPrimary,
  },

  textArea: {
    // marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    height: 120,
    padding: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  count: {
    textAlign: 'right',
    marginRight: 5,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
  },

  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
  },

  tagActive: {
    borderColor: colors.darkPrimary,
    backgroundColor: '#EAF2FF',
  },

  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  tagTextActive: {
    color: colors.darkPrimary,
    fontWeight: '600',
  },
});
