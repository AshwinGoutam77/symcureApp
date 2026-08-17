/* eslint-disable react-native/no-inline-styles */

import React, {useMemo, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, fonts} from '../../theme';
import {Modal} from 'react-native';

const FILTERS = ['All', 'Paid', 'Failed', 'Refunded'];

const transactions = [
  {
    id: '1',
    doctor: 'Dr. Anita Sharma',
    speciality: 'General Physician',
    consultationType: 'Video',
    amount: 800,
    status: 'Paid',
    transactionId: 'TXN548963214',
    paymentMode: 'UPI',
    date: '10 Jul 2026',
    time: '11:30 AM',
  },
  {
    id: '2',
    doctor: 'Dr. Raj Patel',
    speciality: 'Dermatologist',
    consultationType: 'Clinic',
    amount: 650,
    status: 'Failed',
    transactionId: 'TXN458965212',
    paymentMode: 'Card',
    date: '08 Jul 2026',
    time: '05:00 PM',
  },
  {
    id: '3',
    doctor: 'Dr. Neha Kapoor',
    speciality: 'Pediatrician',
    consultationType: 'Video',
    amount: 500,
    status: 'Refunded',
    transactionId: 'TXN785632145',
    paymentMode: 'Net Banking',
    date: '05 Jul 2026',
    time: '09:00 AM',
  },
  {
    id: '4',
    doctor: 'Dr. Amit Verma',
    speciality: 'Orthopedic',
    consultationType: 'Clinic',
    amount: 900,
    status: 'Paid',
    transactionId: 'TXN965874123',
    paymentMode: 'UPI',
    date: '02 Jul 2026',
    time: '02:30 PM',
  },
  {
    id: '5',
    doctor: 'Dr. Vivek Singh',
    speciality: 'Cardiologist',
    consultationType: 'Video',
    amount: 1200,
    status: 'Paid',
    transactionId: 'TXN658741258',
    paymentMode: 'UPI',
    date: '28 Jun 2026',
    time: '10:00 AM',
  },
];

const TransactionsScreen = ({navigation}) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [invoiceVisible, setInvoiceVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(item => {
      const statusMatch =
        selectedFilter === 'All' ? true : item.status === selectedFilter;

      const searchText = search.toLowerCase();

      const searchMatch =
        item.doctor.toLowerCase().includes(searchText) ||
        item.speciality.toLowerCase().includes(searchText) ||
        item.transactionId.toLowerCase().includes(searchText) ||
        item.consultationType.toLowerCase().includes(searchText);

      return statusMatch && searchMatch;
    });
  }, [selectedFilter, search]);

  const getStatusColor = status => {
    switch (status) {
      case 'Paid':
        return '#12B76A';

      case 'Failed':
        return '#F04438';

      case 'Refunded':
        return '#155EEF';

      default:
        return '#667085';
    }
  };

  const getStatusBackground = status => {
    switch (status) {
      case 'Paid':
        return '#ECFDF3';

      case 'Failed':
        return '#FEF3F2';

      case 'Refunded':
        return '#EFF8FF';

      default:
        return '#F2F4F7';
    }
  };

  const renderFilter = ({item}) => {
    const isSelected = selectedFilter === item;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSelectedFilter(item)}
        style={[styles.filterChip, isSelected && styles.filterChipActive]}>
        <Text
          style={[styles.filterText, isSelected && styles.filterTextActive]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AS</Text>
          </View>

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{item.doctor}</Text>

              <Text style={styles.amount}>₹{item.amount}</Text>
            </View>

            <View style={styles.subRow}>
              <Text style={styles.speciality}>{item.speciality}</Text>

              <View style={styles.dot} />

              <Ionicons
                name={
                  item.consultationType === 'Video'
                    ? 'videocam-outline'
                    : 'business-outline'
                }
                size={14}
                color={colors.darkPrimary}
              />

              <Text style={styles.type}>{item.consultationType}</Text>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.date}>
                {item.date} • {item.time}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getStatusBackground(item.status),
                  },
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: getStatusColor(item.status),
                    },
                  ]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.invoiceRow}
              onPress={() => {
                setSelectedTransaction(item);
                setInvoiceVisible(true);
              }}>
              <Ionicons
                name={
                  item.status === 'Failed' ? 'refresh' : 'document-text-outline'
                }
                size={17}
                color="#000000ff"
              />

              <Text style={styles.invoiceText}>
                {item.status === 'Failed' ? 'Retry Payment' : 'Invoice'}
              </Text>

              <Feather name="chevron-right" size={18} color="#98A2B3" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.row, {gap: 0}]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}>
            <Feather name="arrow-left" size={18} color="#060D1F" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Transactions</Text>
        </View>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <>
            <FlatList
              horizontal
              data={FILTERS}
              keyExtractor={item => item}
              renderItem={renderFilter}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            />
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={70} color="#D0D5DD" />

            <Text style={styles.emptyTitle}>No Transactions Found</Text>

            <Text style={styles.emptySubtitle}>
              Your transactions will appear here.
            </Text>
          </View>
        }
      />
      <Modal
        visible={invoiceVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setInvoiceVisible(false)}
        statusBarTranslucent>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setInvoiceVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>Payment Details</Text>

            <View style={styles.statusContainer}>
              <Ionicons name="checkmark-circle" size={22} color="#12B76A" />

              <Text style={styles.statusSuccess}>Payment Successful</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Amount</Text>

              <Text style={styles.amountText}>
                ₹{selectedTransaction?.amount}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Doctor</Text>

              <Text style={styles.infoValue}>
                {selectedTransaction?.doctor}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Consultation</Text>

              <Text style={styles.infoValue}>
                {selectedTransaction?.consultationType}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date & Time</Text>

              <Text style={styles.infoValue}>
                {selectedTransaction?.date} • {selectedTransaction?.time}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Mode</Text>

              <Text style={styles.infoValue}>
                {selectedTransaction?.paymentMode}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Transaction ID</Text>

              <Text style={styles.infoValue}>
                {selectedTransaction?.transactionId}
              </Text>
            </View>

            <TouchableOpacity style={styles.downloadButton}>
              <Text style={styles.downloadText}>Download Invoice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setInvoiceVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default TransactionsScreen;

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

  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },

  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 5,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignItems: 'center',
  },

  input: {
    marginLeft: 8,
    paddingRight: 32,
    fontFamily: fonts.medium,
    color: '#7A879E',
    fontSize: 15,
    fontWeight: '700',
    width: '100%',
  },

  filterContainer: {
    paddingBottom: 18,
    paddingRight: 16,
  },

  filterChip: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  filterChipActive: {
    backgroundColor: '#2E76FF',
    borderColor: '#2E76FF',
  },

  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344054',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: '700',
    color: '#101828',
  },

  emptySubtitle: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#667085',
    lineHeight: 22,
    paddingHorizontal: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },

  topRow: {
    flexDirection: 'row',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkPrimary,
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#101828',
  },

  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000ff',
  },

  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 3,
  },

  speciality: {
    fontSize: 14,
    color: '#000000ff',
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D5DD',
    marginHorizontal: 8,
  },

  type: {
    marginLeft: 5,
    fontSize: 13,
    color: colors.darkPrimary,
    fontWeight: '600',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  date: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000ff',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  invoiceRow: {
    marginTop: 10,
    marginBottom: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
    flexDirection: 'row',
    alignItems: 'center',
  },

  invoiceText: {
    flex: 1,
    marginLeft: 8,
    fontWeight: '600',
    color: '#000000ff',
    fontSize: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  bottomSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
  },

  sheetHandle: {
    width: 55,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#D0D5DD',
    alignSelf: 'center',
    marginBottom: 18,
  },

  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 20,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  statusSuccess: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#12B76A',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },

  infoLabel: {
    color: '#667085',
    fontSize: 14,
  },

  infoValue: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },

  amountText: {
    color: '#2E90FA',
    fontSize: 22,
    fontWeight: '700',
  },

  downloadButton: {
    marginTop: 24,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2E76FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  downloadText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },

  closeButton: {
    marginTop: 12,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecececff',
    borderRadius: 12,
  },

  closeText: {
    color: '#000000ff',
    fontWeight: '600',
    fontSize: 15,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  typeBadgeText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
