/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { colors, fonts } from '../../theme';
import { Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RefreshableScrollView from '../../components/common/RefreshableScrollView';
import { useDashboardQuery } from '../../hooks/queries/useDashboardQueries';
import ManageProfilesModal from '../../components/common/ManageProfilesModal';
import {
  useActiveProfileQuery,
  useProfilesQuery,
} from '../../hooks/queries/useProfileQueries';
import { useSwitchProfileMutation } from '../../hooks/queries/useProfileMutations';
import { useDispatch } from 'react-redux';
import { setFamilyMemberFlow } from '../../store/authSlice';

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;
  const [search, setSearch] = useState('');

  const [profileModal, setProfileModal] = useState(false);

  const { data: profilesResponse, isLoading: profilesLoading, refetch: refetchProfiles, } =
    useProfilesQuery();

  const { data: activeProfileResponse, isLoading: activeProfileLoading, refetch: refetchActiveProfile, } =
    useActiveProfileQuery();

  const { mutateAsync: switchProfile, isPending: switchingProfile } =
    useSwitchProfileMutation();

  const profiles =
    profilesResponse?.profiles || profilesResponse?.data?.profiles || [];

  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDashboardQuery();

  const activeProfile =
    activeProfileResponse?.profile ||
    activeProfileResponse?.data?.profile ||
    activeProfileResponse?.data ||
    activeProfileResponse;

  const handleSelectProfile = async profile => {
    try {
      const patientAccountId = profile?.patient_account_id;

      if (!patientAccountId) {
        Alert.alert('Error', 'Unable to switch this profile.');
        return;
      }

      console.log('SWITCHING PROFILE:', profile);

      await switchProfile({
        patient_account_id: patientAccountId,
      });

      // Keep the active profile locally
      await AsyncStorage.setItem(
        'patient_account_id',
        String(patientAccountId),
      );

      await AsyncStorage.setItem('active_profile', JSON.stringify(profile));

      setProfileModal(false);

      // Optional: reload current screen
      navigation.goBack();
    } catch (error) {
      console.log('SWITCH PROFILE ERROR:', error?.error?.message || error);

      Alert.alert(
        'Error',
        error?.error?.message || error?.message || 'Unable to switch profile.',
      );
    }
  };

  const upcomingAppointment = dashboard?.data?.upcoming_appointment;
  const recentlyConsulted = dashboard?.data?.recently_consulted || [];
  const appointment = dashboard?.upcoming_appointment;
  const seasonalHealth = dashboard?.data?.seasonal_health || [];

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity, scale]);

  const handleRefresh = async () => {
  try {
    await Promise.all([
      refetchDashboard(),
      refetchProfiles(),
      refetchActiveProfile(),
    ]);
  } catch (error) {
    console.log('HOME REFRESH ERROR:', error);
  }
};

  if (isDashboardLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const formatDate = dateString => {
    if (!dateString) {
      return '';
    }

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const DoctorAvatar = ({ doctor, size = 48 }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const name = doctor?.name || 'Doctor';

    const initials =
      name
        .replace(/^Dr\.?\s*/i, '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase() || 'DR';

    const imageUrl = doctor?.profile_photo_url;

    return (
      <View
        style={[
          styles.avatarWrapper,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <View
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {imageUrl && !imageError && (
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.avatarImage,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                opacity: imageLoaded ? 1 : 0,
              },
            ]}
            resizeMode="cover"
            onLoad={() => {
              setImageLoaded(true);
            }}
            onError={() => {
              setImageError(true);
              setImageLoaded(false);
            }}
          />
        )}
      </View>
    );
  };

  const formatConsultType = type => {
    if (type === 'offline') {
      return 'Clinic';
    }

    if (type === 'online' || type === 'video') {
      return 'Video';
    }

    return type || 'Consultation';
  };

  const getAppointmentStatusLabel = status => {
    switch (status) {
      case 'scheduled':
        return 'Upcoming';

      case 'reschedule_requested':
        return 'Reschedule Requested';

      case 'cancelled':
        return 'Cancelled';

      case 'completed':
        return 'Completed';

      case 'no_show':
        return 'No Show';

      default:
        return status
          ? status
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase())
          : '';
    }
  };

  return (
    <>
      <LinearGradient colors={colors.gradient}>
        <View style={styles.header}>
          <View style={styles.topRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setProfileModal(true)}
            >
              <Text style={styles.greeting}>{t('greeting')}</Text>
              <Text style={styles.name}>
                {dashboard?.data?.greeting_name || 'Patient'}{' '}
                <Feather name="chevron-down" size={22} color="#fff" />
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => navigation.navigate('Profile')}
            >
              <Feather name="user" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* SEARCH */}
          <View style={styles.searchBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="search" size={16} color="#7A879E" />
              <TextInput
                placeholder={t('searchPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                value={search}
                onChangeText={text => {
                  setSearch(text);
                }}
              />
            </View>

            <TouchableOpacity
              style={styles.menuBtn}
              onPress={() => {
                navigation.navigate('BrowseByDoctors', {
                  search: search,
                });

                setSearch('');
              }}
            >
              <Feather name="log-in" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {upcomingAppointment && (
            <TouchableOpacity onPress={() =>
              navigation.navigate('AppointmentDetailScreen', {
                appointmentId: upcomingAppointment?.appointment_id,
              })
            } style={styles.upcomingCard}>
              <View style={styles.upcomingCardHeader}>
                <Text style={styles.upcomingCardTitle}>
                  {t('upcomingConsultation')}
                </Text>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {getAppointmentStatusLabel(upcomingAppointment?.status)}
                  </Text>
                </View>
              </View>

              <View style={[styles.row, { alignItems: 'flex-start' }]}>
                <DoctorAvatar doctor={upcomingAppointment?.doctor} size={48} />

                {/* DOCTOR DETAILS */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.docName} numberOfLines={1}>
                    {upcomingAppointment?.doctor?.name || 'Doctor'}
                  </Text>

                  <Text style={styles.docSub} numberOfLines={1}>
                    {(upcomingAppointment?.doctor
                      ?.qualification_specializations || 'Specialist') +
                      ', ' +
                      upcomingAppointment?.doctor?.qualifications}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.typeChip}>
                      <Feather
                        name={
                          upcomingAppointment?.consult_type === 'offline'
                            ? 'map-pin'
                            : 'video'
                        }
                        size={11}
                        color="#fff"
                      />

                      <Text style={styles.typeText}>
                        {formatConsultType(upcomingAppointment?.consult_type)}
                      </Text>
                    </View>

                    <Text style={styles.docSub}>
                      {formatDate(upcomingAppointment?.date)}
                      {upcomingAppointment?.time_label
                        ? ` • ${upcomingAppointment.time_label}`
                        : ''}
                    </Text>
                  </View>

                  {/* ONLINE MESSAGE */}
                  {upcomingAppointment?.consult_type !== 'offline' && (
                    <Text style={styles.tokenText}>
                      Join available 10 mins before
                    </Text>
                  )}
                </View>

                {/* ACTION */}
                <View style={{ position: 'relative' }}>
                  <Animated.View
                    style={[
                      styles.ping,
                      {
                        transform: [{ scale }],
                        opacity,
                      },
                    ]}
                  />

                  {upcomingAppointment?.consult_type === 'offline' ? (
                    <TouchableOpacity
                      style={styles.directionBtn}
                      onPress={() =>
                        navigation.navigate('AppointmentDetailScreen', {
                          appointmentId: upcomingAppointment?.appointment_id,
                        })
                      }
                    >
                      <Feather name="navigation" size={15} color="#fff" />

                      <Text style={styles.directionText}>Directions</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.joinBtn}
                      onPress={() =>
                        navigation.navigate('AppointmentDetailScreen', {
                          appointmentId: upcomingAppointment?.appointment_id,
                        })
                      }
                    >
                      <Feather name="video" size={15} color="#fff" />

                      <Text style={styles.joinText}>Join</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <View style={styles.container}>
        <RefreshableScrollView
  style={styles.content}
  contentContainerStyle={{paddingBottom: 100}}
  showsVerticalScrollIndicator={false}
  onRefresh={handleRefresh}
>
          {/* Recently Consulted */}
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('recentlyConsulted')}</Text>
            </View>

            {recentlyConsulted.length > 0 ? (
              recentlyConsulted.map(item => {
                const doctor = item?.doctor;
                const doctorName = doctor?.name || 'Doctor';
                const specialization = [
                  doctor?.qualification_specializations || 'Doctor',
                  doctor?.qualifications,
                ]
                  .filter(Boolean)
                  .join(', ');
                const consultType = formatConsultType(item?.consult_type);

                return (
                  <TouchableOpacity
                    key={item?.appointment_id}
                    style={styles.doctorCard}
                    activeOpacity={0.85}
                    onPress={() =>
                      navigation.navigate('DoctorDetailScreen', {
                        doctorId: item?.doctor?.doctor_id,
                      })
                    }
                  >
                    {/* TOP */}
                    <View style={styles.cardTop}>
                      {/* DOCTOR IMAGE / INITIALS */}
                      <DoctorAvatar doctor={doctor} size={48} />

                      {/* DOCTOR DETAILS */}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.docNameDark} numberOfLines={1}>
                          {doctorName}
                        </Text>

                        <Text style={styles.docSubDark} numberOfLines={1}>
                          {specialization}
                        </Text>

                        {/* DATE + TIME */}
                        <View style={styles.visitRow}>
                          <Feather name="calendar" size={13} color="#000" />

                          <Text style={styles.visitText}>
                            {formatDate(item?.date)}
                            {item?.time_label ? `, ${item.time_label}` : ''}
                          </Text>
                        </View>
                      </View>

                      {/* CONSULT TYPE */}
                      <View style={styles.online}>
                        <Text style={styles.onlineText}>{consultType}</Text>
                      </View>
                    </View>

                    <View style={[styles.actionRow, { gap: 10 }]}>
                      {/* DIAGNOSIS */}
                      {item?.diagnosis ? (
                        <View style={styles.infoRow}>
                          <View style={styles.infoChip}>
                            <Feather
                              name="activity"
                              size={13}
                              color="#2E76FF"
                            />

                            <Text style={styles.infoText} numberOfLines={1}>
                              {item.diagnosis}
                            </Text>
                          </View>
                        </View>
                      ) : null}

                      {/* follow_up_date */}
                      {item?.follow_up_date ? (
                        <View style={styles.infoRow}>
                          <View style={styles.infoChip}>
                            <Feather
                              name="calendar"
                              size={13}
                              color="#2E76FF"
                            />

                            <Text style={styles.infoText} numberOfLines={1}>
                              {formatDate(item.follow_up_date)}
                            </Text>
                          </View>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.divider} />

                    {/* ACTIONS */}
                    <View style={styles.actionRow}>
                      {/* BOOK AGAIN */}
                      <TouchableOpacity
                        style={styles.bookBtn}
                        activeOpacity={0.8}
                        onPress={() =>
                          navigation.navigate('SelectSlotScreen', {
                            selected:
                              item?.consult_type === 'offline'
                                ? 'clinic'
                                : 'video',

                            doctorId: doctor?.doctor_id,
                            doctorDetail: doctor,
                            appointmentId: item?.appointment_id,
                          })
                        }
                      >
                        <Feather name="refresh-cw" size={15} color="#fff" />

                        <Text style={styles.bookText}>Book Again</Text>
                      </TouchableOpacity>

                      {/* VIEW PRESCRIPTION */}
                      <TouchableOpacity
                        style={styles.profileBtnSmall}
                        activeOpacity={0.8}
                        onPress={() =>
                          navigation.navigate('PrescriptionDetail', {
                            appointmentId: item?.appointment_id,
                          })
                        }
                      >
                        <Feather name="file-text" size={15} color="#060D1F" />

                        <Text style={styles.profileText}>
                          View Prescription
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyRecentCard}>
                <View style={styles.emptyRecentIcon}>
                  <Feather name="calendar" size={24} color={colors.primary} />
                </View>

                <Text style={styles.emptyRecentTitle}>
                  No recent consultations
                </Text>

                <Text style={styles.emptyRecentText}>
                  Your completed consultations will appear here.
                </Text>
              </View>
            )}
          </View>

          {/* Health Tip */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Tip of the Day</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.healthTipCard}
            onPress={() => { }}
          >
            <View style={styles.healthTipContent}>
              <View style={{ flex: 1 }}>
                <View style={styles.waterDropContainer}>
                  <Image
                    source={require('../../assets/images/water-drop.png')}
                    style={styles.waterDropIcon}
                  />
                  <Text style={{ marginLeft: 10 }}></Text>
                  <Text style={styles.healthTitle}>Stay Hydrated</Text>
                </View>

                <Text style={styles.healthDescription}>
                  Drink at least 8 glasses of water every day to maintain energy
                  levels, improve digestion and support overall health.
                </Text>

                <TouchableOpacity style={styles.readMoreBtn}>
                  <Text style={styles.readMoreText}>Read More</Text>

                  <Feather name="arrow-right" size={14} color="#2E76FF" />
                </TouchableOpacity>
              </View>

              <View style={styles.healthImage}>
                <Image
                  source={require('../../assets/images/stay-hydrated.png')}
                  style={styles.hydratedImage}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Did You Know */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Did You Know?</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.didYouKnowContainer}
          >
            <TouchableOpacity
              style={[styles.didCard, { backgroundColor: '#FFEDED' }]}
            >
              <View style={styles.didIcon}>
                <Feather name="heart" size={18} color="#E11D48" />
              </View>

              <Text style={styles.didTitle}>Heart Health</Text>

              <Text style={styles.didDescription}>
                Walking for just 30 minutes a day can lower your risk of heart
                disease.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.didCard, { backgroundColor: '#EEF9F1' }]}
            >
              <View style={[styles.didIcon]}>
                <Feather name="sun" size={18} color="#16A34A" />
              </View>

              <Text style={styles.didTitle}>Vitamin D</Text>

              <Text style={styles.didDescription}>
                15–20 minutes of sunlight daily helps maintain healthy bones.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.didCard, { backgroundColor: '#FFF7E8' }]}
            >
              <View style={[styles.didIcon]}>
                <Feather name="droplet" size={18} color="#2563EB" />
              </View>

              <Text style={styles.didTitle}>Hydration</Text>

              <Text style={styles.didDescription}>
                Even mild dehydration can reduce concentration and energy.
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Healthy Habits */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Healthy Habits</Text>
          </View>

          <View style={styles.habitsRow}>
            {[
              {
                icon: require('../../assets/images/health-walk.png'),
                title: 'Walk',
                subtitle: '30 mins Daily',
                bg: '#EEF3FD',
              },
              {
                icon: require('../../assets/images/health-hydrate.png'),
                title: 'Hydrate',
                subtitle: '2–3 L Water',
                bg: '#ECF9F0',
              },
              {
                icon: require('../../assets/images/health-sleep.png'),
                title: 'Sleep',
                subtitle: '7–8 Hours',
                bg: '#FFF8E8',
              },
              {
                icon: require('../../assets/images/health-nutrition.png'),
                title: 'Nutrition',
                subtitle: 'Balanced Diet',
                bg: '#FFEDED',
              },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                style={[styles.habitCard, { backgroundColor: item.bg }]}
              >
                <View style={[styles.habitIcon]}>
                  <Image source={item.icon} style={styles.habitImage} />
                </View>

                <Text style={styles.habitTitle}>{item.title}</Text>

                <Text style={styles.habitSubtitle}>{item.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Seasonal Health Alert */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seasonal Health</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.seasonCard}
            onPress={() => { }}
          >
            <Image
              source={require('../../assets/images/seasonal-health-bg.png')}
              style={styles.seasonBg}
            />

            <View style={styles.seasonOverlay} />

            <View style={styles.seasonContent}>
              <View style={styles.seasonLeft}>
                <View style={styles.seasonBadge}>
                  <Feather name="cloud-rain" size={13} color="#2563EB" />
                  <Text style={styles.seasonBadgeText}>Monsoon Alert</Text>
                </View>

                <Text style={styles.seasonTitle}>
                  Protect Yourself From Dengue
                </Text>

                <Text style={styles.seasonDescription}>
                  Keep your surroundings clean, avoid stagnant water and use
                  mosquito protection while outdoors.
                </Text>

                <TouchableOpacity style={styles.learnRow}>
                  <Text style={styles.learnText}>Learn More</Text>

                  <Feather name="arrow-right" size={15} color="#2E76FF" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </RefreshableScrollView>

        <ManageProfilesModal
          visible={profileModal}
          profiles={profiles}
          activeProfile={activeProfile}
          switchingProfile={switchingProfile}
          onClose={() => setProfileModal(false)}
          onSelect={handleSelectProfile}
          onAddProfile={async () => {
            setProfileModal(false);

            const phone = await AsyncStorage.getItem('registration_phone');

            console.log('REGISTRATION PHONE:', phone);

            dispatch(
              setFamilyMemberFlow({
                phone: phone || null,
              }),
            );
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FD',
  },

  container: { flex: 1, backgroundColor: '#F4F7FD' },

  header: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  greeting: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.medium,
    fontSize: 14,
  },

  name: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontSize: 20,
  },

  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchBox: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 16 : 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontWeight: '700',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },

  input: {
    marginLeft: 8,
    paddingRight: 32,
    fontFamily: fonts.semiBold,
    color: '#7A879E',
    fontSize: 14,
    width: '100%',
  },

  menuBtn: {
    backgroundColor: colors.darkPrimary,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 34,
    position: 'absolute',
    right: 13,
    // top: 13,
  },

  upcomingCard: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 14,
  },

  upcomingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  upcomingCardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  badge: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF2D55',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    // marginBottom: 8,
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  ping: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 12,
    backgroundColor: '#00be1dff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginTop: 14,
  },

  avatarWrapper: {
    position: 'relative',
    overflow: 'hidden',
    marginRight: 10,
  },

  avatar: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  avatarText: {
    color: '#fff',
    fontFamily: fonts.bold,
  },

  docName: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontSize: 16,
  },

  docSub: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },

  joinBtn: {
    backgroundColor: '#00c11dff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  joinText: {
    color: '#fff',
    fontSize: 13,
  },

  content: {
    padding: 16,
  },

  doctorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
    backgroundColor: '#EEF2F7',
  },

  emptyRecentCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginTop: 10,
    alignItems: 'center',
  },

  emptyRecentIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  emptyRecentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#101828',
  },

  emptyRecentText: {
    marginTop: 5,
    fontSize: 12,
    color: '#7A879E',
    textAlign: 'center',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },

  link: {
    color: colors.darkPrimary,
    fontSize: 14,
    fontWeight: '700',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    justifyContent: 'space-between',
  },

  card: {
    width: '23%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  activeCard: {
    borderWidth: 2,
    borderColor: colors.darkPrimary,
  },

  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textPrimary,
  },

  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
    marginBottom: 10,
  },

  docNameDark: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },

  docSubDarkDate: {
    fontSize: 14,
    color: '#000000ff',
    marginTop: 2,
  },

  docSubDark: {
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 10,
  },

  metaRowSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
    fontFamily: fonts.bold,
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
    fontFamily: fonts.semiBold,
  },

  bookBtn: {
    flex: 1,
    backgroundColor: colors.darkPrimary,
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
    gap: 5,
  },

  profileText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  ConsultedGrid: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 12,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  visitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  visitText: {
    fontSize: 13,
    color: '#000000ff',
    marginLeft: 5,
    fontFamily: fonts.semiBold,
  },

  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },

  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  infoText: {
    marginLeft: 5,
    fontSize: 11,
    color: '#000000ff',
    fontFamily: fonts.semiBold,
  },

  actionRow: {
    flexDirection: 'row',
  },

  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  typeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },

  dot: {
    color: '#fff',
    marginHorizontal: 6,
    fontSize: 12,
  },

  tokenText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 4,
    fontFamily: fonts.semiBold,
  },

  viewBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  directionBtn: {
    backgroundColor: '#00be1dff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  directionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5,
  },

  healthTipCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginTop: 12,
  },

  healthTipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  healthTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  healthTagText: {
    marginLeft: 5,
    color: colors.darkPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#101828',
  },

  healthDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#667085',
    fontWeight: '500',
  },

  readMoreBtn: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  readMoreText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkPrimary,
  },
  waterDropIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },

  waterDropContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  healthImage: {
    width: 150,
    height: 150,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },

  hydratedImage: {
    width: 150,
    height: 150,
  },

  healthEmoji: {
    fontSize: 42,
  },

  didYouKnowContainer: {
    paddingTop: 22,
    paddingRight: 16,
  },

  didCard: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginRight: 14,
  },

  didIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  didTitle: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '700',
    color: '#060D1F',
  },

  didDescription: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: '#000000ff',
  },

  habitsRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  habitCard: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },

  habitIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  habitImage: {
    width: 54,
    height: 54,
    resizeMode: 'contain',
  },

  habitTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#101828',
  },

  habitSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#98A2B3',
    textAlign: 'center',
  },

  seasonCard: {
    marginTop: 20,
    height: 260,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  seasonBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },

  seasonContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  seasonLeft: {
    width: '60%',
  },

  seasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EEF4FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  seasonBadgeText: {
    marginLeft: 5,
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },

  seasonTitle: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '700',
    color: '#101828',
    lineHeight: 28,
  },

  seasonDescription: {
    marginTop: 8,
    color: '#000000ff',
    fontSize: 14,
    lineHeight: 22,
  },

  learnRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },

  learnText: {
    color: colors.darkPrimary,
    fontWeight: '700',
    fontSize: 16,
    marginRight: 6,
  },
});
