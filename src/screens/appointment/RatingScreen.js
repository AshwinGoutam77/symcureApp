/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, fonts } from '../../theme';
import Feather from 'react-native-vector-icons/Feather';
import Button from '../../components/common/Button';

const tagsData = [
  'Listened well',
  'Clear prescription',
  'On time',
  'Easy to understand',
  'Right questions',
  'Consult again',
];

const RatingScreen = ({ navigation }) => {
  const [rating, setRating] = useState(4);
  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const toggleTag = tag => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map(i => (
      <TouchableOpacity key={i} onPress={() => setRating(i)}>
        <Text style={[styles.star, i <= rating && styles.starActive]}>★</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <LinearGradient colors={colors.gradient} style={styles.header}>
          <Text style={styles.emoji}>
            <Feather name="check-circle" size={40} color="#fff" />
          </Text>
          <Text style={styles.title}>Consultation Complete!</Text>
          <Text style={styles.subtitle}>
            Your prescription is ready in Records
          </Text>
        </LinearGradient>

        {/* Doctor Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AS</Text>
            </View>

            <View>
              <Text style={styles.name}>Dr. Anita Sharma</Text>
              <Text style={styles.sub}>General Physician · Today, 3:00 PM</Text>
            </View>
          </View>
        </View>

        {/* Rating */}
        <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>
          How was your experience?
        </Text>

        <View style={styles.starsRow}>{renderStars()}</View>

        <Text style={styles.ratingText}>Great — {rating} stars</Text>

        {/* Feedback */}
        <Text style={styles.sectionTitle}>
          Tell others{' '}
          <Text style={styles.optional}>(optional, max 150 chars)</Text>
        </Text>

        <View style={styles.textArea}>
          <TextInput
            placeholder="What did you like? What could be better?"
            multiline
            value={text}
            onChangeText={setText}
            maxLength={150}
          />
        </View>

        <Text style={styles.count}>{text.length}/150</Text>

        {/* Tags */}
        <Text style={styles.sectionTitle}>What stood out?</Text>

        <View style={styles.tagsWrap}>
          {tagsData.map((tag, i) => {
            const selected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={i}
                onPress={() => toggleTag(tag)}
                style={[styles.tag, selected && styles.tagActive]}
              >
                <Text
                  style={[styles.tagText, selected && styles.tagTextActive]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Button */}
      <View style={styles.submitBtn}>
        <Button
          title="Submit Feedback"
          onPress={() =>
            navigation.navigate('MainTabs', {
              screen: 'Records',
            })
          }
        />
      </View>
    </View>
  );
};

export default RatingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },

  header: {
    padding: 20,
    paddingTop: 80,
    alignItems: 'center',
  },

  emoji: {
    marginBottom: 10,
  },

  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },

  subtitle: {
    color: '#ffffffff',
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
  },

  card: {
    margin: 16,
    padding: 16,
    backgroundColor: '#eff0f1ff',
    borderRadius: 16,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: fonts.bold,
  },

  name: {
    fontWeight: '700',
    fontSize: 16,
    fontFamily: fonts.bold,
  },

  sub: {
    color: '#7A8A9A',
    fontSize: 13,
    fontFamily: fonts.bold,
  },

  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 10,
    fontWeight: '700',
    fontSize: 18,
    fontFamily: fonts.bold,
    marginBottom: 8,
    // textAlign: "center",
  },

  optional: {
    color: '#7A8A9A',
    fontSize: 12,
  },

  starsRow: {
    // marginHorizontal: 16,
    marginTop: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    // marginVertical: 10,
    gap: 12,
  },

  star: {
    fontSize: 40,
    color: '#E5E7EB',
  },

  starActive: {
    color: '#FFA500',
  },

  ratingText: {
    marginHorizontal: 16,
    textAlign: 'center',
    color: '#FFA500',
    fontWeight: '600',
    marginBottom: 10,
  },

  textArea: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    height: 100,
    padding: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  count: {
    textAlign: 'right',
    marginRight: 20,
    fontSize: 12,
    color: '#7A8A9A',
  },

  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 10,
  },

  tag: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
  },

  tagActive: {
    borderColor: '#2F6BFF',
    backgroundColor: '#EAF2FF',
  },

  tagText: {
    fontSize: 13,
    fontWeight: '700',
  },

  tagTextActive: {
    color: '#2F6BFF',
    fontWeight: '600',
  },

  submitBtn: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
  },
});
