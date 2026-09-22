/* eslint-disable react-hooks/exhaustive-deps */
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
import { DoctorAvatar } from '../../components/common/DoctorAvtar';

export default function BrowseByDoctors({ navigation, route }) {
  const initialSearch = route?.params?.search || '';

  const [search, setSearch] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const [page, setPage] = useState(1);
  const [allDoctors, setAllDoctors] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const specializationId =
    route?.params?.specialization_id || null;

  const cityId =
    route?.params?.city_id || null;

  const stateId =
    route?.params?.state_id || null;

  /*
   * IMPORTANT:
   * page must be passed to the query.
   */
  const {
    data,
    isLoading,
    isFetching,
  } = useDoctorsSearchQuery({
    q: searchQuery?.trim() || undefined,

    specialization_id:
      specializationId || undefined,

    city_id:
      cityId || undefined,

    state_id:
      stateId || undefined,

    page,

    limit: 20,
  });

  /*
   * Current page doctors from API
   */
  const currentDoctors =
    data?.data?.data || [];

  /*
   * API pagination metadata
   */
  const meta =
    data?.data?.meta || null;

  /*
   * Merge API results into our complete list.
   *
   * Page 1:
   *   replace list
   *
   * Page 2+:
   *   append new doctors
   */
  useEffect(() => {
    if (!data) {
      return;
    }

    if (page === 1) {
      setAllDoctors(currentDoctors);
    } else {
      setAllDoctors(prev => {
        const existingIds = new Set(
          prev.map(item => item?.doctor_id),
        );

        const uniqueDoctors =
          currentDoctors.filter(
            item =>
              item?.doctor_id &&
              !existingIds.has(item.doctor_id),
          );

        return [
          ...prev,
          ...uniqueDoctors,
        ];
      });
    }

    /*
     * Determine whether another page exists.
     */
    if (meta) {
      const currentPage =
        Number(meta.current_page || page);

      const lastPage =
        Number(meta.last_page || currentPage);

      setHasMore(
        currentPage < lastPage,
      );
    } else {
      /*
       * Fallback if API doesn't return meta.
       */
      setHasMore(
        currentDoctors.length >= 20,
      );
    }

    setIsLoadingMore(false);
  }, [
    data,
    page,
    currentDoctors,
    meta,
  ]);

  /*
   * Keep route search in sync.
   */
  useEffect(() => {
    const routeSearch =
      route?.params?.search || '';

    setSearch(routeSearch);
    setSearchQuery(routeSearch);

    setPage(1);
    setAllDoctors([]);
    setHasMore(true);
  }, [route?.params?.search]);

  /*
   * SEARCH
   */
  const handleSearch = () => {
    const value = search.trim();

    if (
      !value &&
      !specializationId &&
      !cityId &&
      !stateId
    ) {
      return;
    }

    /*
     * Reset pagination when a new
     * search is performed.
     */
    setAllDoctors([]);
    setHasMore(true);
    setIsLoadingMore(false);
    setPage(1);

    setSearchQuery(value);
  };

  /*
   * LOAD NEXT PAGE
   */
  const handleLoadMore = () => {
    /*
     * Don't request another page if:
     * - already fetching
     * - already loading more
     * - no more pages
     * - no doctors currently loaded
     */
    if (
      isFetching ||
      isLoadingMore ||
      !hasMore ||
      allDoctors.length === 0
    ) {
      return;
    }

    setIsLoadingMore(true);

    setPage(prev => prev + 1);
  };

  /*
   * CLEAR SEARCH
   */
  const handleClearSearch = () => {
    setSearch('');

    /*
     * If filters exist, keep the API active
     * but remove the text search.
     */
    setAllDoctors([]);
    setHasMore(true);
    setIsLoadingMore(false);
    setPage(1);

    if (
      specializationId ||
      cityId ||
      stateId
    ) {
      setSearchQuery('');
    }
  };

  /*
   * INITIAL LOADING
   */
  const showInitialLoader =
    isLoading &&
    allDoctors.length === 0;

  /*
   * GET INITIALS
   */
  const getInitials = doctor => {
    if (doctor?.initials) {
      return doctor.initials;
    }

    const name =
      doctor?.name || 'Doctor';

    return name
      .replace(/^Dr\.?\s*/i, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(word =>
        word.charAt(0),
      )
      .join('')
      .toUpperCase();
  };

  /*
   * DOCTOR CARD
   */
  const renderDoctor = ({
    item,
  }) => {
    const doctor = item;

    return (
      <TouchableOpacity
        style={styles.doctorCard}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate(
            'DoctorDetailScreen',
            {
              doctorId:
                doctor?.doctor_id,
            },
          )
        }>

        {/* TOP ROW */}
        <View style={styles.row}>

          {/* AVATAR */}
          <DoctorAvatar
            doctor={doctor}
          />

          {/* DETAILS */}
          <View style={{ flex: 1 }}>

            {/* NAME */}
            <Text
              style={styles.docNameDark}
              numberOfLines={1}>
              {doctor?.name ||
                'Doctor'}
            </Text>

            {/* SPECIALIZATION */}
            <Text
              style={styles.docSubDark}
              numberOfLines={2}>

              {doctor?.qualification_specializations ||
                'Specialist'}

              {doctor?.qualifications
                ? `, ${doctor.qualifications}`
                : ''}
            </Text>

            {/* META */}
            <View
              style={styles.metaRow}>

              {/* EXPERIENCE */}
              {doctor?.experience_years !==
                null &&
                doctor?.experience_years !==
                undefined && (
                  <View
                    style={
                      styles.metaItem
                    }>

                    <Feather
                      name="briefcase"
                      size={12}
                      color="#7A879E"
                    />

                    <Text
                      style={
                        styles.metaText
                      }>
                      {
                        doctor.experience_years
                      }{' '}
                      yrs
                    </Text>
                  </View>
                )}

              {/* LOCATION */}
              {!!doctor?.city_name && (
                <View
                  style={
                    styles.metaItem
                  }>

                  <Feather
                    name="map-pin"
                    size={12}
                    color="#7A879E"
                  />

                  <Text
                    style={
                      styles.metaText
                    }
                    numberOfLines={1}>
                    {
                      doctor.city_name
                    }
                  </Text>
                </View>
              )}

              {/* FEE */}
              {doctor?.clinic_fee !==
                null &&
                doctor?.clinic_fee !==
                undefined && (
                  <View
                    style={
                      styles.metaItem
                    }>

                    <Text
                      style={
                        styles.metaText
                      }>
                      ₹
                      {
                        doctor.clinic_fee
                      }
                    </Text>
                  </View>
                )}
            </View>
          </View>

          {/* CLINIC */}
          <View
            style={styles.online}>

            <Text
              style={styles.onlineText}>
              • Clinic
            </Text>
          </View>
        </View>

        {/* BUTTONS */}
        <View style={styles.row}>

          {/* BOOK APPOINTMENT */}
          <TouchableOpacity
            style={[
              styles.bookBtn,
              !doctor?.is_bookable &&
              styles.is_bookable,
            ]}
            disabled={
              !doctor?.is_bookable
            }
            onPress={() =>
              navigation.navigate(
                'SelectSlotScreen',
                {
                  doctorId:
                    doctor?.doctor_id,
                  doctorDetail:
                    doctor,
                },
              )
            }>

            <Text
              style={[
                styles.bookText,
                !doctor?.clinic_fee &&
                styles.disabledText,
              ]}>
              Book Appointment
            </Text>
          </TouchableOpacity>

          {/* VIEW PROFILE */}
          <TouchableOpacity
            style={
              styles.profileBtnSmall
            }
            onPress={() =>
              navigation.navigate(
                'DoctorDetailScreen',
                {
                  doctorId:
                    doctor?.doctor_id,
                  doctorDetail:
                    doctor,
                },
              )
            }>

            <Text
              style={
                styles.profileText
              }>
              View Profile
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {/* =========================================
          HEADER
      ========================================= */}
      <View style={styles.header}>

        <View
          style={[
            styles.row,
            { gap: 0 },
          ]}>

          {/* BACK */}
          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
            style={styles.back}>

            <Feather
              name="arrow-left"
              size={18}
              color="#060D1F"
            />
          </TouchableOpacity>

          <Text
            style={
              styles.headerTitle
            }>
            Search Doctors
          </Text>
        </View>
      </View>

      {/* =========================================
          SEARCH
      ========================================= */}
      <View style={styles.searchBox}>

        <Feather
          name="search"
          size={17}
          color="#7A879E"
        />

        <TextInput
          placeholder="Search doctors..."
          placeholderTextColor="#98A2B3"
          value={search}
          onChangeText={text =>
            setSearch(text)
          }
          onSubmitEditing={
            handleSearch
          }
          returnKeyType="search"
          style={styles.input}
        />

        {/* CLEAR */}
        {search.length > 0 && (
          <TouchableOpacity
            onPress={
              handleClearSearch
            }
            style={
              styles.clearButton
            }>

            <Feather
              name="x"
              size={16}
              color="#7A879E"
            />
          </TouchableOpacity>
        )}

        {/* SEARCH BUTTON */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}>

          <Feather
            name="search"
            size={16}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* =========================================
          LIST
      ========================================= */}
      {showInitialLoader ? (
        <View
          style={
            styles.loadingContainer
          }>

          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text
            style={
              styles.loadingText
            }>
            Finding doctors...
          </Text>
        </View>
      ) : allDoctors.length > 0 ? (
        <FlatList
          data={allDoctors}
          keyExtractor={item =>
            String(item?.doctor_id)
          }
          renderItem={renderDoctor}
          contentContainerStyle={
            styles.listContent
          }
          showsVerticalScrollIndicator={
            false
          }
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 2,
              }}
            />
          )}

          /*
           * ======================================
           * AUTOMATIC LOAD MORE
           * ======================================
           *
           * Fires when user gets close to
           * the bottom of the list.
           */
          onEndReached={
            handleLoadMore
          }
          onEndReachedThreshold={0.5}

          /*
           * FOOTER
           */
          ListFooterComponent={() => {
            if (isLoadingMore) {
              return (
                <View
                  style={
                    styles.loadMoreContainer
                  }>

                  <ActivityIndicator
                    size="small"
                    color={
                      colors.primary
                    }
                  />

                  <Text
                    style={
                      styles.loadMoreText
                    }>
                    Loading more doctors...
                  </Text>
                </View>
              );
            }

            if (
              !hasMore &&
              allDoctors.length > 0
            ) {
              return (
                <View
                  style={
                    styles.endContainer
                  }>

                  <View
                    style={
                      styles.endLine
                    }
                  />

                  <Text
                    style={
                      styles.endText
                    }>
                    You've reached the end
                  </Text>

                  <View
                    style={
                      styles.endLine
                    }
                  />
                </View>
              );
            }

            return null;
          }}
        />
      ) : (
        /* =========================================
            EMPTY
        ========================================= */
        <View
          style={
            styles.emptyContainer
          }>

          <View
            style={
              styles.emptyIcon
            }>

            <Feather
              name="user-x"
              size={28}
              color={colors.primary}
            />
          </View>

          <Text
            style={
              styles.emptyTitle
            }>
            No doctors found
          </Text>

          <Text
            style={
              styles.emptyText
            }>
            Try searching with a
            different doctor name,
            specialization or
            location.
          </Text>
        </View>
      )}

      {/* =========================================
          SEARCH LOADER
      ========================================= */}
      {isFetching &&
        !isLoading &&
        !isLoadingMore && (
          <View
            style={{
              position: 'absolute',
              right: 20,
              top: 125,
            }}>

            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
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

  /* HEADER */
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

  /* COMMON */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  /* SEARCH */
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
    backgroundColor:
      colors.darkPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* LIST */
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
  },

  /* DOCTOR */
  docNameDark: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },

  docSubDark: {
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 2,
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

  /* CLINIC */
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

  /* BUTTONS */
  bookBtn: {
    flex: 1,
    backgroundColor: '#2E76FF',
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
    marginTop: 20,
  },

  is_bookable: {
    backgroundColor: '#2e77ff8b',
  },

  disabledText: {
    color: '#fff',
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
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },

  /* INITIAL LOADING */
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

  /* LOAD MORE */
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  loadMoreText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#7A879E',
    fontFamily: fonts.medium,
  },

  /* END */
  endContainer: {
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  endLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },

  endText: {
    marginHorizontal: 12,
    fontSize: 11,
    color: '#98A2B3',
    fontFamily: fonts.medium,
  },

  /* EMPTY */
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