/* eslint-disable react-native/no-inline-styles */
import Feather from 'react-native-vector-icons/Feather';
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {colors, fonts} from '../../theme';

const doctors = [
  {
    name: 'Dr. Anita Sharma',
    specialty: 'General Physician',
    experience: '12 yrs',
    location: 'Mumbai',
    fee: 499,
    type: 'video',
  },
  {
    name: 'Dr. Raj Mehta',
    specialty: 'Cardiologist',
    experience: '8 yrs',
    location: 'Delhi',
    fee: 699,
    type: 'clinic',
  },
  {
    name: 'Dr. Sneha Kapoor',
    specialty: 'Dermatologist',
    experience: '10 yrs',
    location: 'Jaipur',
    fee: 599,
    type: 'video',
  },
  {
    name: 'Dr. Amit Verma',
    specialty: 'Neurologist',
    experience: '15 yrs',
    location: 'Bangalore',
    fee: 899,
    type: 'clinic',
  },
];

export default function RecentConsultedScreen({navigation, route}) {
  const [search, setSearch] = useState('');

  const filtered = doctors.filter(item => {
    const text = search.toLowerCase();

    return (
      item.name.toLowerCase().includes(text) ||
      item.specialty.toLowerCase().includes(text) ||
      item.location.toLowerCase().includes(text)
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.row, {gap: 0}]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}>
            <Feather name="arrow-left" size={18} color="#060D1F" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Recently Consulated Doctors</Text>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Icon name="search" size={16} color="#888" />
        <TextInput
          placeholder="Search doctors..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => i.toString()}
        contentContainerStyle={{padding: 16}}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{height: 16}} />}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.doctorCard}
            onPress={() => navigation.navigate('DoctorDetailScreen')}>
            {/* TOP */}
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </Text>
              </View>

              <View style={{flex: 1}}>
                <Text style={styles.docNameDark}>{item.name}</Text>

                <Text style={styles.docSubDark}>
                  {item.specialty} • MBBS, MD
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Feather name="briefcase" size={12} color="#7A879E" />
                    <Text style={styles.metaText}>{item.experience}</Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Feather name="map-pin" size={12} color="#7A879E" />
                    <Text style={styles.metaText}>{item.location}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.online}>
                <Text style={styles.onlineText}>
                  {item.type === 'clinic' ? 'Clinic Visit' : 'Video Consult'}
                </Text>
              </View>
            </View>

            {/* DIVIDER */}
            <View style={styles.divider} />

            {/* ACTIONS */}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() =>
                  navigation.navigate('SelectSlotScreen', {
                    selected: item.type || 'video',
                    doctor: item,
                  })
                }>
                <Feather name="refresh-cw" size={14} color="#fff" />
                <Text style={styles.bookText}>Book Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.profileBtnSmall}
                onPress={() => navigation.navigate('RecordsScreen')}>
                <Feather name="file-text" size={14} color="#060D1F" />
                <Text style={styles.profileText}>View Prescriptions</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{textAlign: 'center', marginTop: 50}}>
            No doctors found
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F4F7FD'},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
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

  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    fontWeight: '700',
    color: '#000000ff',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  content: {
    padding: 16,
  },

  badge: {
    backgroundColor: '#DFF5E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    color: colors.success,
    fontWeight: '600',
    fontSize: 12,
  },

  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    padding: 5,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 0,
  },

  input: {
    marginLeft: 8,
    paddingRight: 32,
    height: 45,
    fontFamily: fonts.medium,
    color: '#7A879E',
    fontSize: 15,
    fontWeight: '700',
    width: '100%',
  },

  grid: {
    paddingHorizontal: 16,
    flexWrap: 'wrap',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginTop: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4FA3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  avatarText: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontWeight: '800',
  },

  docName: {
    color: '#fff',
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '700',
  },

  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    // marginTop: 10,
    marginBottom: 10,
  },

  docNameDark: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '700',
    color: '#000000ff',
  },

  docSubDark: {
    fontSize: 12,
    color: colors.textPrimary,
    // fontWeight: '700',
    fontFamily: fonts.semiBold,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 10,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },

  metaText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginLeft: 4,
    fontFamily: fonts.semiBold,
  },

  metaSub: {
    fontSize: 11,
    color: '#7A879E',
    marginLeft: 2,
  },

  online: {
    backgroundColor: '#E6F7EC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  onlineText: {
    color: '#2E9E5B',
    fontSize: 12,
    fontWeight: '700',
  },

  bookBtn: {
    flex: 1,
    backgroundColor: '#2E76FF',
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  bookText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },

  profileBtnSmall: {
    padding: 10,
    backgroundColor: '#EEF2F7',
    borderRadius: 12,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  profileText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
