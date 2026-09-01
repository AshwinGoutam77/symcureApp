/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors, fonts } from '../../theme';
import EmptyComponent from '../../components/EmptyComponent';
import { useTranslation } from 'react-i18next';
import RNFS from 'react-native-fs';
import {
  usePrescriptions,
  useReports,
} from '../../hooks/queries/useRecordsQueries';
import Share from 'react-native-share';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ToggleBtn({ active, label, icon, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.toggleBtn, active && styles.activeToggle]}
    >
      <Feather name={icon} size={14} color={active ? '#fff' : '#060D1F'} />
      <Text style={[styles.toggleText, active && styles.activeText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function RecordCard({ item, navigation }) {
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

  return (
    <View style={styles.doctorCard}>
      <View style={styles.cardTop}>
        <View
          style={[styles.iconBox]}
        >
          <Feather name="file-text" size={18} color={colors.darkPrimary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.docNameDark}>{item.doctor}</Text>
          <Text style={styles.docSubDark}>{item.speciality}</Text>
          <View style={styles.visitRow}>
            <Feather name="calendar" size={13} color="#6B7280" />
            <Text style={styles.visitText}>{item.date}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoChip}>
          <Feather name="activity" size={13} color="#2563EB" />

          <Text style={styles.infoText}>{item.diagnosis}</Text>
        </View>

        {item?.item?.follow_up_date && <View style={styles.infoChip}>
          <Feather name="calendar" size={13} color="#2563EB" />

          <Text style={styles.infoText}>
            {/* {formatDate(item.follow_up_date)} */}
            {formatDate(item?.item?.follow_up_date)}</Text>
        </View>}
      </View>

      <View style={styles.divider} />

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.profileBtnSmall}
          onPress={() =>
            navigation.navigate('PrescriptionDetail', {
              prescriptionId: item.prescriptionId,
              doctorId: item.doctorId
            })
          }
        >
          <Feather name="file-text" size={15} color="#000" />

          <Text style={styles.profileText}>View Prescription</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bookBtn, !item?.item?.doctor?.is_bookable && styles.disabled]}
          disabled={!item?.item?.doctor?.is_bookable}
          onPress={() =>
            navigation.navigate('SelectSlotScreen', {
              selected: 'clinic',
              doctorId: item.doctorId,
              doctorDetail: item?.item?.doctor,
            })
          }
        >
          <Feather name="refresh-cw" size={15} color="#fff" />

          <Text style={styles.bookText}>Book Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ReportCard({ item, navigation }) {

  const handleShareReport = async () => {
    if (!item?.file_url) {
      Alert.alert('Unable to share', 'Report file is not available.');
      return;
    }

    try {
      const fileUrl = item.file_url;

      const fileName =
        item?.report_name?.replace(/[^a-zA-Z0-9-_]/g, '_') ||
        'Medical_Report';

      const extension =
        fileUrl
          .split('?')[0]
          .split('.')
          .pop()
          ?.toLowerCase() || 'pdf';

      const filePath = `${RNFS.CachesDirectoryPath}/${fileName}.${extension}`;

      const accessToken = await AsyncStorage.getItem('access_token');

      if (!accessToken) {
        Alert.alert(
          'Unable to share',
          'Authentication token is missing.',
        );
        return;
      }

      console.log('FILE URL:', fileUrl);
      console.log('TOKEN EXISTS:', !!accessToken);

      const download = await RNFS.downloadFile({
        fromUrl: fileUrl,
        toFile: filePath,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: '*/*',
        },
      }).promise;

      console.log('DOWNLOAD STATUS:', download.statusCode);
      console.log('FILE PATH:', filePath);

      const fileExists = await RNFS.exists(filePath);

      console.log('FILE EXISTS:', fileExists);

      if (
        download.statusCode < 200 ||
        download.statusCode >= 300 ||
        !fileExists
      ) {
        throw new Error(
          `Download failed: ${download.statusCode}`,
        );
      }

      await Share.open({
        title: item.report_name || 'Medical Report',
        url: `file://${filePath}`,
        type:
          extension === 'pdf'
            ? 'application/pdf'
            : extension === 'jpg' || extension === 'jpeg'
              ? 'image/jpeg'
              : extension === 'png'
                ? 'image/png'
                : '*/*',
        failOnCancel: false,
      });
    } catch (error) {
      console.log('SHARE REPORT ERROR:', error);

      Alert.alert(
        'Unable to share',
        error?.message ||
        'Something went wrong while sharing the report.',
      );
    }
  };

  const formattedDate = item?.created_at
    ? new Date(item.created_at.replace(' ', 'T')).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    )
    : '';

  return (
    <View style={styles.reportBox}>
      <View style={styles.reportCard}>
        {/* TOP */}
        <View style={styles.reportTop}>
          <View style={styles.reportLeft}>
            <View style={styles.fileIcon}>
              <Feather
                name={
                  item.file_url?.toLowerCase().includes('.pdf')
                    ? 'file-text'
                    : 'image'
                }
                size={20}
                color="#64748B"
              />
            </View>

            <View style={styles.reportInfo}>
              <Text numberOfLines={1} style={styles.fileName}>
                {item.report_name || 'Medical Report'}
              </Text>

              <Text numberOfLines={1} style={styles.doctorName}>
                {item.doctor_name || 'Patient uploaded'}
              </Text>
            </View>
          </View>

          {/* DATE */}
          <View style={styles.dateBadge}>
            <Feather
              name="calendar"
              size={12}
              color={colors.darkPrimary}
            />

            <Text style={styles.dateText}>
              {formattedDate}
            </Text>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.btnRows}>
          <TouchableOpacity
            style={styles.viewBtnCompact}
            onPress={() =>
              navigation.navigate('WebViewScreen', {
                url: item.file_url,
                title: item.report_name,
              })
            }
          >
            <Feather
              name="eye"
              size={15}
              color={colors.darkPrimary}
            />
            <Text style={styles.viewText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function RecordsScreen({ navigation, route }) {
  const { t } = useTranslation();
  const [showShare, setShowShare] = useState(false);

  const [mode, setMode] = useState(
    route?.params?.mode || 'Prescriptions',
  );

  useEffect(() => {
    if (route?.params?.mode) {
      setMode(route.params.mode);
    }
  }, [route?.params?.mode]);

  const {
    data: prescriptionsResponse,
    isLoading: prescriptionsLoading,
    isFetching: prescriptionsFetching,
    error: prescriptionsError,
  } = usePrescriptions({
    page: 1,
    limit: 20,
  });

  const {
    data: reportsResponse,
    isLoading: reportsLoading,
    isFetching: reportsFetching,
    error: reportsError,
  } = useReports({
    page: 1,
    limit: 20,
  });

  const prescriptions = prescriptionsResponse?.data || [];
  const reports = reportsResponse?.data || [];

  const data = mode === 'Prescriptions' ? prescriptions : reports;

  const prescriptionItems = prescriptions.map(item => ({
    prescriptionId: item.prescription_id,
    appointmentId: item.appointment_id,

    doctorId: item.doctor?.doctor_id,

    item: item,

    doctor: item.doctor?.name || 'Doctor',

    speciality:
      (item.doctor?.qualification_specializations || 'Specialist') +
      ', ' +
      item.doctor?.qualifications,

    diagnosis: item.diagnosis_summary || 'No diagnosis available',

    prescriptionNo: item.prescription_no,

    date: item.issued_at
      ? new Date(item.issued_at.replace(' ', 'T')).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      : '',

    color: '#E8F7EF',
  }));

  const pdfUrl =
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  const handleShare = async url => {
    try {
      await Share.open({
        pdfUrl,
        type: 'application/pdf',
      });
    } catch (err) { }
  };

  if (prescriptionsLoading || reportsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.darkPrimary} />
        <Text style={styles.loadingText}>Loading records...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.row, { gap: 0 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}
          >
            <Feather name="arrow-left" size={18} />
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}> {t('healthRecords')}</Text>
          </View>
        </View>
      </View>

      {/* TOGGLE */}
      <View style={styles.toggleWrap}>
        <ToggleBtn
          active={mode === 'Prescriptions'}
          label={t('prescriptions')}
          icon="activity"
          onPress={() => setMode('Prescriptions')}
        />

        <ToggleBtn
          active={mode === 'reports'}
          label={t('reports')}
          icon="folder"
          onPress={() => setMode('reports')}
        />
      </View>

      {/* LIST */}
      {data?.length === 0 ? (
        <EmptyComponent
          text={`No records yet. Start by booking an appointment and getting your ${mode === 'Prescriptions' ? 'prescriptions' : 'reports'
            } here.`}
          btnText="Book an appointment"
          onBtnPress={() => navigation.navigate('BrowseByDoctors')}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {mode === 'Prescriptions'
            ? prescriptionItems.map(item => (
              <RecordCard
                key={item.prescriptionId}
                item={item}
                navigation={navigation}
                t={t}
              />
            ))
            : reports.map(item => (
              <ReportCard
                key={item.report_id}
                item={item}
                navigation={navigation}
              />
            ))}
        </ScrollView>
      )}

      {showShare && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowShare(false)}
          />

          <View style={styles.shareContainer}>
            <Text style={styles.shareTitle}>Share Report</Text>

            <View style={styles.shareRow}>
              {[
                { icon: 'share-2', label: 'WhatsApp' },
                { icon: 'mail', label: 'Email' },
                { icon: 'message-circle', label: 'SMS' },
                { icon: 'copy', label: 'Copy Link' },
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.shareItem}
                  onPress={handleShare}
                >
                  <Feather name={item.icon} size={22} />
                  <Text style={styles.shareText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FD',
    paddingHorizontal: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  header: {
    paddingTop: 60,
    paddingBottom: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EBF5',
  },

  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },

  toggleWrap: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 20,
  },

  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#EEF2F7',
    marginRight: 10,
  },

  activeToggle: {
    backgroundColor: colors.darkPrimary,
  },

  toggleText: {
    marginLeft: 6,
    fontFamily: fonts.semiBold,
  },

  activeText: {
    color: '#fff',
  },

  disabledBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  disabledText: {
    fontSize: 12,
    color: '#A0AEC0',
  },

  infoBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#ffffffff',
    borderRadius: 14,
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },

  shareContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 100,
    marginBottom: 60,
  },

  shareTitle: {
    fontSize: 22,
    marginBottom: 16,
    color: '#000000',
  },

  shareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    flexWrap: 'wrap',
    marginTop: 10,
  },

  shareItem: {
    alignItems: 'center',
    backgroundColor: colors.primary + 33,
    padding: 20,
    width: 100,
    borderRadius: 10,
  },

  shareText: {
    fontSize: 12,
    marginTop: 6,
    color: '#000000ff',
  },

  card: {
    backgroundColor: '#fff',
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#438be836',
  },

  name: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#111827',
  },

  summary: {
    fontSize: 12,
    color: '#000000ff',
    marginTop: 2,
    lineHeight: 18,
    fontFamily: fonts.semiBold,
  },

  doctor: {
    fontSize: 12,
    marginTop: 6,
    color: '#374151',
    fontFamily: fonts.medium,
  },

  meta: {
    fontSize: 13,
    color: '#000000ff',
    marginTop: 2,
    fontFamily: fonts.semiBold,
  },

  badge: {
    backgroundColor: '#EAFBF1',
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  badgeText: {
    color: '#16A34A',
    fontSize: 11,
    fontFamily: fonts.semiBold,
  },

  actions: {
    flexDirection: 'row',
    marginTop: 14,
  },

  primaryBtn: {
    backgroundColor: colors.darkPrimary,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  primaryText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },

  secondaryBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  secondaryText: {
    color: '#374151',
    fontSize: 12,
    fontFamily: fonts.medium,
  },

  groupTitle: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 12,
    color: '#2f2f2fff',
    fontFamily: fonts.bold,
  },

  reportBox: {
    marginBottom: 12,
  },

  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
  },

  reportTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  reportLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },

  fileIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  reportInfo: {
    flex: 1,
  },

  fileName: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },

  doctorName: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },

  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  dateText: {
    marginLeft: 5,
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.darkPrimary,
  },

  btnRows: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
  },

  viewBtnCompact: {
    alignSelf: 'flex-start',
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  viewBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 8,
  },

  viewText: {
    marginLeft: 6,
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.darkPrimary,
  },

  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    marginBottom: 20,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: fonts.bold,
  },

  docNameDark: {
    fontSize: 15,
    color: '#111827',
    fontFamily: fonts.bold,
  },

  docSubDark: {
    fontSize: 13,
    marginTop: 2,
  },

  visitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  visitText: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: fonts.medium,
  },

  online: {
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },

  onlineText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
  },

  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },

  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },

  infoText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#374151',
    fontFamily: fonts.medium,
  },

  divider: {
    marginVertical: 5,
  },

  actionRow: {
    flexDirection: 'row',
  },

  profileBtnSmall: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  profileText: {
    marginLeft: 6,
    color: '#000000ff',
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },

  bookBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.darkPrimary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabled: {
    backgroundColor: '#2e77ff8b',
  },

  bookText: {
    marginLeft: 6,
    color: '#fff',
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
});
