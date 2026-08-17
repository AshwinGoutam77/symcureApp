/* eslint-disable react-native/no-inline-styles */

import Feather from 'react-native-vector-icons/Feather';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { colors, fonts } from '../../theme';
import { useDoctorsSearchQuery } from '../../hooks/queries/useDoctorQueries';

export default function BrowseByDoctors({ navigation, route }) {
  const initialSearch = route?.params?.search || '';

  const [search, setSearch] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const specializationId = route?.params?.specialization_id || null;

  const cityId = route?.params?.city_id || null;

  const stateId = route?.params?.state_id || null;

  const { data, isLoading, isFetching } = useDoctorsSearchQuery({
    q: searchQuery?.trim() || undefined,

    specialization_id: specializationId || undefined,

    city_id: cityId || undefined,

    state_id: stateId || undefined,

    page: 1,
    limit: 20,
  });

  const doctors = data?.data?.data || [];

  useEffect(() => {
    const routeSearch = route?.params?.search || '';

    setSearch(routeSearch);
    setSearchQuery(routeSearch);
  }, [route?.params?.search]);

  const handleSearch = () => {
    const value = search.trim();

    if (!value && !specializationId && !cityId && !stateId) {
      return;
    }

    setSearchQuery(value);
  };

  const getInitials = doctor => {
    if (doctor?.initials) {
      return doctor.initials;
    }

    const name = doctor?.name || 'Doctor';

    return name
      .replace(/^Dr\.?\s*/i, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const renderDoctor = ({ item }) => {
    const doctor = item;

    return (
      <TouchableOpacity
        style={styles.doctorCard}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('DoctorDetailScreen', {
            doctorId: doctor?.doctor_id,
          })
        }
      >
        <View style={styles.row}>
          {/* AVATAR */}

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(doctor)}</Text>
          </View>

          {/* DETAILS */}

          <View style={{ flex: 1 }}>
            <Text style={styles.docNameDark}>{doctor?.name || 'Doctor'}</Text>

            <Text style={styles.docSubDark}>
              {doctor?.qualification_specializations || 'Specialist'}{' '}
              {doctor.qualifications ? ',' : ''} {doctor.qualifications}
            </Text>

            {/* QUALIFICATION */}

            {/* {!!doctor?.qualifications && (
              <Text
                style={styles.docSubDark}
                numberOfLines={1}>
                {doctor.qualifications}
              </Text>
            )} */}

            <View style={styles.metaRow}>
              {/* EXPERIENCE */}

              {doctor?.experience_years !== null &&
                doctor?.experience_years !== undefined && (
                  <View style={styles.metaItem}>
                    <Feather name="briefcase" size={12} color="#7A879E" />

                    <Text style={styles.metaText}>
                      {doctor.experience_years} yrs
                    </Text>
                  </View>
                )}

              {/* LOCATION */}

              {!!doctor?.city_name && (
                <View style={styles.metaItem}>
                  <Feather name="map-pin" size={12} color="#7A879E" />

                  <Text style={styles.metaText} numberOfLines={1}>
                    {doctor.city_name}
                  </Text>
                </View>
              )}

              {/* FEE */}

              {doctor?.clinic_fee !== null &&
                doctor?.clinic_fee !== undefined && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaText}>₹{doctor.clinic_fee}</Text>
                  </View>
                )}
            </View>
          </View>

          {/* ONLINE */}

          <View style={styles.online}>
            <Text style={styles.onlineText}>• Clinic</Text>
          </View>
        </View>

        {/* BUTTONS */}

        <View style={styles.row}>
          {/* BOOK APPOINTMENT */}

          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() =>
              navigation.navigate('SelectSlotScreen', {
                doctorId: doctor?.doctor_id,
                doctorDetail: doctor
              })
            }
          >
            <Text style={styles.bookText}>Book Appointment</Text>
          </TouchableOpacity>

          {/* VIEW PROFILE */}

          <TouchableOpacity
            style={styles.profileBtnSmall}
            onPress={() =>
              navigation.navigate('DoctorDetailScreen', {
                doctorId: doctor?.doctor_id,
                doctorDetail: doctor
              })
            }
          >
            <Text style={styles.profileText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const showInitialLoader = isLoading && doctors.length === 0;

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={[styles.row, { gap: 0 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}
          >
            <Feather name="arrow-left" size={18} color="#060D1F" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Search Doctors
          </Text>
        </View>
      </View>

      {/* SEARCH */}

      <View style={styles.searchBox}>
        <Feather name="search" size={17} color="#7A879E" />

        <TextInput
          placeholder="Search doctors..."
          placeholderTextColor="#98A2B3"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          style={styles.input}
        />

        {/* CLEAR */}

        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearch('');

              /*
               * Don't call API with empty search
               * unless a filter is selected.
               */

              if (specializationId || cityId || stateId) {
                setSearchQuery('');
              }
            }}
            style={styles.clearButton}
          >
            <Feather name="x" size={16} color="#7A879E" />
          </TouchableOpacity>
        )}

        {/* SEARCH BUTTON */}

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Feather name="search" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* LIST */}

      {showInitialLoader ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />

          <Text style={styles.loadingText}>Finding doctors...</Text>
        </View>
      ) : doctors.length > 0 ? (
        <FlatList
          data={doctors}
          keyExtractor={item => String(item?.doctor_id)}
          renderItem={renderDoctor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Feather name="user-x" size={28} color={colors.primary} />
          </View>

          <Text style={styles.emptyTitle}>No doctors found</Text>

          <Text style={styles.emptyText}>
            Try searching with a different doctor name, specialization or
            location.
          </Text>
        </View>
      )}

      {/* SMALL LOADER WHILE SEARCHING */}

      {isFetching && !isLoading && (
        <View
          style={{
            position: 'absolute',
            right: 20,
            top: 125,
          }}
        >
          <ActivityIndicator size="small" color={colors.primary} />
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.white,
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
    color: colors.textPrimary,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    fontSize: 12,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 6,
    height: 54,
  },

  input: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 0,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    fontSize: 14,
  },

  clearButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.darkPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  grid: {
    paddingHorizontal: 16,
    flexWrap: 'wrap',
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
  },

  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
  },

  docNameDark: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },

  docSubDark: {
    fontSize: 13,
    color: colors.textPrimary,
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
  },

  bookText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: fonts.medium,
  },

  profileBtnSmall: {
    padding: 10,
    backgroundColor: '#EEF2F7',
    borderRadius: 12,
    marginTop: 20,
    paddingHorizontal: 30,
  },

  profileText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },

  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#7A879E',
    fontSize: 14,
    fontFamily: fonts.medium,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 17,
    fontFamily: fonts.medium,
    color: '#101828',
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: '#7A879E',
    textAlign: 'center',
  },
});
