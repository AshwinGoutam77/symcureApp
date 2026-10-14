/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import Feather from 'react-native-vector-icons/Feather';
import React, { useEffect, useState, useRef, useMemo } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';

import { colors, fonts } from '../../theme';

import {
  useDoctorsSearchQuery,
} from '../../hooks/queries/useDoctorQueries';

import { DoctorAvatar } from '../../components/common/DoctorAvtar';

import AdvancedDoctorSearchModal from '../../components/common/AdvancedDoctorSearchModal';

export default function BrowseByDoctors({
  navigation,
  route,
}) {
  /*
   * ==========================================
   * ROUTE VALUES
   * ==========================================
   */

  const initialSearch =
    route?.params?.search || '';

  const specialistGroupName =
    route?.params?.search ||
    'Specialists';

  const routeSpecialtyGroupId =
    route?.params?.specialty_group_id ||
    null;

  /*
   * ==========================================
   * SEARCH / FILTER STATES
   * ==========================================
   */

  const [
    specialtyGroupId,
    setSpecialtyGroupId,
  ] = useState(
    routeSpecialtyGroupId,
  );

  /*
   * IMPORTANT:
   *
   * This is the actual search text.
   *
   * Example:
   *
   * User searches "fever"
   *
   * search = "fever"
   *
   * Advanced Search receives:
   *
   * initialSearch={search}
   *
   * Therefore the modal shows "fever".
   */

  const [search, setSearch] =
    useState(
      routeSpecialtyGroupId
        ? ''
        : initialSearch,
    );

  const [searchQuery, setSearchQuery] =
    useState(
      routeSpecialtyGroupId
        ? ''
        : initialSearch,
    );

  /*
   * ==========================================
   * PAGINATION
   * ==========================================
   */

  const [page, setPage] =
    useState(1);

  const [allDoctors, setAllDoctors] =
    useState([]);

  const [hasMore, setHasMore] =
    useState(true);

  const [isLoadingMore, setIsLoadingMore] =
    useState(false);

  /*
   * ==========================================
   * OLD FILTER PARAMS
   * ==========================================
   */

  const specializationId =
    route?.params?.specialization_id ||
    null;

  const cityId =
    route?.params?.city_id ||
    null;

  const stateId =
    route?.params?.state_id ||
    null;

  /*
   * ==========================================
   * NEW SMART SEARCH PARAMS
   * ==========================================
   */

  const qualificationSpecializationId =
    route?.params
      ?.qualification_specialization_id ||
    null;

  const source =
    route?.params?.source ||
    'home';

  /*
   * ==========================================
   * ADVANCED SEARCH MODAL
   * ==========================================
   */

  const [
    advancedSearchVisible,
    setAdvancedSearchVisible,
  ] = useState(false);

  /*
   * ==========================================
   * DOCTOR SEARCH API
   * ==========================================
   */

  const {
    data,
    isLoading,
    isFetching,
    dataUpdatedAt,
    refetch,
  } = useDoctorsSearchQuery({
    /*
     * Specialty group searches should not
     * send q.
     */
    q: specialtyGroupId
      ? undefined
      : searchQuery?.trim() ||
      undefined,

    /*
     * Existing specialty-group flow.
     */
    specialty_group_id:
      specialtyGroupId ||
      undefined,

    /*
     * New advanced search.
     */
    qualification_specialization_id:
      qualificationSpecializationId ||
      undefined,

    /*
     * Existing filters.
     */
    specialization_id:
      specializationId ||
      undefined,

    city_id:
      cityId ||
      undefined,

    state_id:
      stateId ||
      undefined,

    /*
     * API requires source.
     */
    source,

    /*
     * Pagination.
     */
    page,

    limit: 20,
  });

  /*
   * ==========================================
   * CURRENT PAGE DOCTORS
   * ==========================================
   */

  const currentDoctors = useMemo(
    () => data?.data?.data || [],
    [data],
  );

  const appliedFilters = data?.data?.applied_filters || [];
  console.log(data?.data?.applied_filters);

  /*
   * ==========================================
   * PAGINATION META
   * ==========================================
   */

  const meta =
    data?.data?.meta || null;

  /*
   * ==========================================
   * MERGE API RESULTS
   * ==========================================
   */

  useEffect(() => {
    if (!data) {
      return;
    }

    /*
     * Page 1:
     * replace complete list.
     */
    if (page === 1) {
      setAllDoctors(
        currentDoctors,
      );
    } else {
      /*
       * Page 2+:
       * append unique doctors.
       */
      setAllDoctors(prev => {
        const existingIds =
          new Set(
            prev.map(
              item =>
                item?.doctor_id,
            ),
          );

        const uniqueDoctors =
          currentDoctors.filter(
            item =>
              item?.doctor_id &&
              !existingIds.has(
                item.doctor_id,
              ),
          );

        return [
          ...prev,
          ...uniqueDoctors,
        ];
      });
    }

    /*
     * ========================================
     * DETERMINE WHETHER MORE PAGES EXIST
     * ========================================
     */

    if (meta) {
      const currentPage =
        Number(
          meta.current_page ||
          page,
        );

      const lastPage =
        Number(
          meta.last_page ||
          currentPage,
        );

      setHasMore(
        currentPage < lastPage,
      );
    } else {
      /*
       * Fallback.
       */
      setHasMore(
        currentDoctors.length >=
        20,
      );
    }

    setIsLoadingMore(false);
  }, [data, dataUpdatedAt, page]);

  /*
   * ==========================================
   * KEEP ROUTE SEARCH IN SYNC
   * ==========================================
   */

  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const routeSearch =
      route?.params?.search ||
      '';

    const routeSpecialtyGroupId =
      route?.params
        ?.specialty_group_id ||
      null;

    /*
     * Update specialty group.
     */
    setSpecialtyGroupId(
      routeSpecialtyGroupId,
    );

    /*
     * Update visible search.
     */
    setSearch(
      routeSpecialtyGroupId
        ? ''
        : routeSearch,
    );

    /*
     * Update API search.
     */
    setSearchQuery(
      routeSpecialtyGroupId
        ? ''
        : routeSearch,
    );

    /*
     * Reset pagination when
     * route filters change.
     */
    setPage(1);
    setAllDoctors([]);
    setHasMore(true);
  }, [
    route?.params?.search,
    route?.params
      ?.specialty_group_id,

    route?.params
      ?.qualification_specialization_id,

    route?.params?.city_id,

    route?.params?.state_id,

    route?.params?.source,
  ]);

  /*
   * ==========================================
   * NORMAL SEARCH
   * ==========================================
   */

  const handleSearch = () => {
    const value = search.trim();

    if (
      !value &&
      !specialtyGroupId &&
      !qualificationSpecializationId &&
      !specializationId &&
      !cityId &&
      !stateId
    ) {
      return;
    }

    // Same search as what's already showing → just refresh it
    if (value === searchQuery && page === 1 && !(value && specialtyGroupId)) {
      refetch();
      return;
    }

    if (value) {
      setSpecialtyGroupId(null);
    }

    // Don't clear allDoctors here — the merge effect replaces the
    // list as soon as page-1 data for the new search arrives.
    setHasMore(true);
    setIsLoadingMore(false);
    setPage(1);
    setSearchQuery(value);
  };

  /*
   * ==========================================
   * LOAD NEXT PAGE
   * ==========================================
   */

  const handleLoadMore = () => {
    /*
     * Don't request another page if:
     *
     * - API is fetching
     * - already loading more
     * - no more pages
     * - no doctors loaded
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

    setPage(
      prev => prev + 1,
    );
  };

  /*
   * ==========================================
   * CLEAR SEARCH
   * ==========================================
   */

  const handleClearSearch = () => {
    setSearch('');

    /*
     * If filters exist,
     * keep API active but
     * remove text search.
     */
    setAllDoctors([]);
    setHasMore(true);
    setIsLoadingMore(false);
    setPage(1);

    if (
      qualificationSpecializationId ||
      specializationId ||
      cityId ||
      stateId
    ) {
      setSearchQuery('');
    } else {
      /*
       * Nothing else to filter by.
       */
      setSearchQuery('');
    }
  };

  /*
   * ==========================================
   * OPEN ADVANCED SEARCH
   * ==========================================
   */

  const openAdvancedSearch = () => {
    setAdvancedSearchVisible(
      true,
    );
  };

  /*
   * ==========================================
   * APPLY ADVANCED SEARCH
   * ==========================================
   */

  const handleAdvancedSearch = params => {
    /*
     * Close modal.
     */
    setAdvancedSearchVisible(
      false,
    );

    /*
     * Update route params.
     *
     * This causes the route-sync effect
     * above to update search/searchQuery.
     */
    navigation.setParams({
      search:
        params?.q || '',

      qualification_specialization_id:
        params
          ?.qualification_specialization_id,

      city_id:
        params?.city_id,

      source:
        params?.source ||
        'advanced',
    });
  };

  /*
   * ==========================================
   * INITIAL LOADING
   * ==========================================
   */

  const showInitialLoader =
    isLoading &&
    allDoctors.length === 0;

  /*
   * ==========================================
   * GET INITIALS
   * ==========================================
   */

  const getInitials = doctor => {
    if (doctor?.initials) {
      return doctor.initials;
    }

    const name =
      doctor?.name ||
      'Doctor';

    return name
      .replace(
        /^Dr\.?\s*/i,
        '',
      )
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
   * ==========================================
   * DOCTOR CARD
   * ==========================================
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
        {/* ==================================
            TOP ROW
        ================================== */}

        <View
          style={styles.row}>
          {/* AVATAR */}

          <DoctorAvatar
            doctor={doctor}
          />

          {/* DETAILS */}

          <View
            style={{ flex: 1 }}>
            {/* NAME */}

            <Text
              style={
                styles.docNameDark
              }
              numberOfLines={1}>
              {doctor?.name ||
                'Doctor'}
            </Text>

            {/* SPECIALIZATION */}

            <Text
              style={
                styles.docSubDark
              }
              numberOfLines={2}>
              {doctor?.qualification_specializations ||
                'Specialist'}

              {doctor?.qualifications
                ? `, ${doctor.qualifications}`
                : ''}
            </Text>

            {/* META */}

            <View
              style={
                styles.metaRow
              }>
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
            style={
              styles.online
            }>
            <Text
              style={
                styles.onlineText
              }>
              • Clinic
            </Text>
          </View>
        </View>

        {/* ==================================
            BUTTONS
        ================================== */}

        <View
          style={styles.row}>
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

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <View
      style={styles.container}>
      {/* ========================================
          HEADER
      ======================================== */}

      <View
        style={styles.header}>
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

          <View
            style={
              styles.headerTitleContainer
            }>
            <Text
              style={
                styles.headerTitle
              }
            >
              {specialtyGroupId
                ? specialistGroupName
                : 'Search Doctors'}
            </Text>
          </View>
        </View>

        {/* FILTER BUTTON */}

        {!routeSpecialtyGroupId && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={
              styles.filterButton
            }
            onPress={
              openAdvancedSearch
            }>
            <Feather
              name="sliders"
              size={15}
              color="#101828"
            />

            <Text
              style={
                styles.filterButtonText
              }>
              Filters
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ========================================
          SEARCH
      ======================================== */}

      {!routeSpecialtyGroupId && (
        <View
          style={styles.searchBox}>
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
                name={
                  Platform.OS ===
                    'ios'
                    ? 'x-circle'
                    : 'x'
                }
                size={16}
                color="#667085"
              />
            </TouchableOpacity>
          )}

          {/* SEARCH BUTTON */}

          <TouchableOpacity
            style={
              styles.searchButton
            }
            onPress={
              handleSearch
            }>
            <Feather
              name="search"
              size={16}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      )}

      {/* ========================================
          ACTIVE FILTER SUMMARY
      ======================================== */}

      {!routeSpecialtyGroupId &&
        (search?.trim() ||
          qualificationSpecializationId ||
          cityId) && (
          <View
            style={
              styles.activeFilters
            }>
            {search?.trim() && (
              <View
                style={
                  styles.filterChip
                }>
                <Text
                  style={
                    styles.filterChipText
                  }
                  numberOfLines={1}>
                  {search.trim()}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setSearch('');

                    navigation.setParams(
                      {
                        search: '',
                      },
                    );
                  }}>
                  <Feather
                    name={Platform.OS === 'ios' ? 'x-circle' : 'x'}
                    size={13}
                    color="#1264F5"
                  />
                </TouchableOpacity>
              </View>
            )}

            {appliedFilters?.qualification_specialization?.name && (
              <View
                style={
                  styles.filterChip
                }>
                <Text
                  style={
                    styles.filterChipText
                  }>
                  {appliedFilters?.qualification_specialization?.name}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    navigation.setParams(
                      {
                        qualification_specialization_id:
                          undefined,
                      },
                    );
                  }}>
                  <Feather
                    name={Platform.OS === 'ios' ? 'x-circle' : 'x'}
                    size={13}
                    color="#1264F5"
                  />
                </TouchableOpacity>
              </View>
            )}

            {appliedFilters?.city && (
              <View
                style={
                  styles.filterChip
                }>
                <Text
                  style={
                    styles.filterChipText
                  }>
                  {appliedFilters?.city?.name}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    navigation.setParams(
                      {
                        city_id:
                          undefined,
                      },
                    );
                  }}>
                  <Feather
                    name={Platform.OS === 'ios' ? 'x-circle' : 'x'}
                    size={13}
                    color="#1264F5"
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

      {/* ========================================
          LIST
      ======================================== */}

      {showInitialLoader ? (
        <View
          style={
            styles.loadingContainer
          }>
          <ActivityIndicator
            size="large"
            color={
              colors.primary
            }
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
            String(
              item?.doctor_id,
            )
          }
          renderItem={
            renderDoctor
          }
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
          onEndReached={
            handleLoadMore
          }
          onEndReachedThreshold={
            0.5
          }
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
              allDoctors.length >
              0
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
                    You've reached
                    the end
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
        /* ======================================
           EMPTY
        ====================================== */

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
              color={
                colors.primary
              }
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

      {/* ========================================
          SEARCH LOADER
      ======================================== */}

      {isFetching &&
        !isLoading &&
        !isLoadingMore && (
          <View
            style={{
              position:
                'absolute',
              right: 20,
              top: 125,
            }}>
            <ActivityIndicator
              size="small"
              color={
                colors.primary
              }
            />
          </View>
        )}

      {/* ========================================
          ADVANCED SEARCH MODAL
      ======================================== */}

      <AdvancedDoctorSearchModal
        visible={
          advancedSearchVisible
        }
        onClose={() =>
          setAdvancedSearchVisible(
            false,
          )
        }

        /*
         * IMPORTANT:
         *
         * If user searched:
         *
         * fever
         *
         * search === "fever"
         *
         * so modal opens with:
         *
         * [ 🔍 fever              x ]
         */
        initialSearch={search}

        /*
         * We currently don't have the
         * complete specialization object
         * in route params, so the modal
         * will show the selected specialty
         * after the user chooses it.
         */
        initialSpecialization={
          route?.params
            ?.qualification_specialization ||
          null
        }

        initialCity={
          route?.params?.city ||
          null
        }

        onSearch={
          handleAdvancedSearch
        }
      />
    </View>
  );
}

/*
 * ============================================
 * STYLES
 * ============================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FD',
  },

  /*
   * ==========================================
   * HEADER
   * ==========================================
   */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',

    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,

    backgroundColor:
      colors.white,
  },

  back: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor:
      '#F4F7FD',

    justifyContent:
      'center',
    alignItems: 'center',

    marginRight: 10,
  },

  headerTitleContainer: {
    flexShrink: 1,
    // maxWidth: '72%',
  },

  headerTitle: {
    fontFamily:
      fonts.bold,

    fontSize: 20,

    color:
      colors.textPrimary,
  },

  searchSummary: {
    // marginTop: 3,

    fontFamily:
      fonts.medium,

    fontSize: 12,

    // color: '#7A879E',
  },

  filterButton: {
    height: 38,

    paddingHorizontal: 11,

    borderRadius: 11,

    backgroundColor:
      '#F4F7FD',

    borderWidth: 1,
    borderColor:
      '#E2E7EF',

    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'center',

    gap: 6,
  },

  filterButtonText: {
    fontFamily:
      fonts.semiBold,

    fontSize: 12,

    color:
      '#101828',
  },

  /*
   * ==========================================
   * COMMON
   * ==========================================
   */

  row: {
    flexDirection:
      'row',

    alignItems:
      'center',

    gap: 10,
  },

  /*
   * ==========================================
   * SEARCH
   * ==========================================
   */

  searchBox: {
    flexDirection:
      'row',

    alignItems:
      'center',

    backgroundColor:
      '#fff',

    marginHorizontal:
      16,

    marginTop:
      16,

    borderRadius:
      14,

    paddingLeft:
      14,

    paddingRight:
      6,

    height:
      54,
  },

  input: {
    flex: 1,

    marginLeft:
      8,

    paddingVertical:
      0,

    fontFamily:
      fonts.medium,

    color:
      colors.textPrimary,

    fontSize:
      14,
  },

  clearButton: {
    width: 34,
    height: 34,

    justifyContent:
      'center',

    alignItems:
      'center',
  },

  searchButton: {
    width: 36,
    height: 36,

    borderRadius: 10,

    backgroundColor:
      colors.darkPrimary,

    justifyContent:
      'center',

    alignItems:
      'center',
  },

  /*
   * ==========================================
   * ACTIVE FILTERS
   * ==========================================
   */

  activeFilters: {
    flexDirection:
      'row',

    alignItems:
      'center',

    flexWrap:
      'wrap',

    gap: 7,

    marginHorizontal:
      16,

    marginTop:
      12,
  },

  filterChip: {
    flexDirection:
      'row',

    alignItems:
      'center',

    maxWidth:
      '70%',

    paddingHorizontal:
      11,

    paddingVertical:
      7,

    borderRadius:
      18,

    backgroundColor:
      '#EFF5FF',

    borderWidth:
      1,

    borderColor:
      '#D8E7FF',
  },

  filterChipText: {
    maxWidth:
      150,

    marginRight:
      6,

    fontFamily:
      fonts.medium,

    fontSize:
      11,

    color:
      '#1264F5',
  },

  /*
   * ==========================================
   * LIST
   * ==========================================
   */

  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  doctorCard: {
    backgroundColor:
      '#fff',

    borderRadius:
      20,

    padding:
      16,

    marginBottom:
      10,
  },

  /*
   * ==========================================
   * DOCTOR
   * ==========================================
   */

  docNameDark: {
    fontFamily:
      fonts.semiBold,

    fontSize:
      16,

    color:
      colors.textPrimary,
  },

  docSubDark: {
    fontSize:
      13,

    color:
      colors.textPrimary,

    marginTop:
      2,
  },

  metaRow: {
    flexDirection:
      'row',

    alignItems:
      'center',

    marginTop:
      4,

    gap: 10,
  },

  metaItem: {
    flexDirection:
      'row',

    alignItems:
      'center',

    marginRight:
      12,
  },

  metaText: {
    fontSize:
      12,

    color:
      colors.textPrimary,

    marginLeft:
      4,

    fontFamily:
      fonts.semiBold,
  },

  /*
   * ==========================================
   * CLINIC
   * ==========================================
   */

  online: {
    backgroundColor:
      '#E6F7EC',

    paddingHorizontal:
      8,

    paddingVertical:
      2,

    borderRadius:
      10,
  },

  onlineText: {
    color:
      '#2E9E5B',

    fontSize:
      12,

    fontWeight:
      '700',
  },

  /*
   * ==========================================
   * BUTTONS
   * ==========================================
   */

  bookBtn: {
    flex: 1,

    backgroundColor:
      '#2E76FF',

    padding:
      10,

    borderRadius:
      12,

    marginRight:
      10,

    marginTop:
      20,
  },

  is_bookable: {
    backgroundColor:
      '#2e77ff8b',
  },

  disabledText: {
    color:
      '#fff',
  },

  bookText: {
    color:
      '#fff',

    textAlign:
      'center',

    fontSize:
      14,

    fontFamily:
      fonts.medium,
  },

  profileBtnSmall: {
    padding:
      10,

    backgroundColor:
      '#EEF2F7',

    borderRadius:
      12,

    marginTop:
      20,

    paddingHorizontal:
      30,
  },

  profileText: {
    fontSize:
      14,

    fontFamily:
      fonts.semiBold,

    color:
      colors.textPrimary,
  },

  /*
   * ==========================================
   * INITIAL LOADING
   * ==========================================
   */

  loadingContainer: {
    flex: 1,

    justifyContent:
      'center',

    alignItems:
      'center',
  },

  loadingText: {
    marginTop:
      10,

    color:
      '#7A879E',

    fontSize:
      14,

    fontFamily:
      fonts.medium,
  },

  /*
   * ==========================================
   * LOAD MORE
   * ==========================================
   */

  loadMoreContainer: {
    paddingVertical:
      20,

    alignItems:
      'center',

    justifyContent:
      'center',

    flexDirection:
      'row',
  },

  loadMoreText: {
    marginLeft:
      8,

    fontSize:
      13,

    color:
      '#7A879E',

    fontFamily:
      fonts.medium,
  },

  /*
   * ==========================================
   * END
   * ==========================================
   */

  endContainer: {
    paddingVertical:
      20,

    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'center',

    paddingHorizontal:
      20,
  },

  endLine: {
    flex: 1,

    height: 1,

    backgroundColor:
      '#E2E8F0',
  },

  endText: {
    marginHorizontal:
      12,

    fontSize:
      11,

    color:
      '#98A2B3',

    fontFamily:
      fonts.medium,
  },

  /*
   * ==========================================
   * EMPTY
   * ==========================================
   */

  emptyContainer: {
    flex: 1,

    justifyContent:
      'center',

    alignItems:
      'center',

    paddingHorizontal:
      40,
  },

  emptyIcon: {
    width: 64,
    height: 64,

    borderRadius: 32,

    backgroundColor:
      '#EEF4FF',

    justifyContent:
      'center',

    alignItems:
      'center',

    marginBottom:
      14,
  },

  emptyTitle: {
    fontSize:
      17,

    fontFamily:
      fonts.medium,

    color:
      '#101828',
  },

  emptyText: {
    marginTop:
      6,

    fontSize:
      13,

    lineHeight:
      19,

    color:
      '#7A879E',

    textAlign:
      'center',
  },
});