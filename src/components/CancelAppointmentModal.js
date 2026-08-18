/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CancelAppointmentModal = ({
  visible,
  reason,
  reasons,
  isPending,
  onClose,
  onSelectReason,
  onConfirm,
  hasBottomBar = true
}) => {
  const [showReasonModal, setShowReasonModal] = React.useState(false);

  if (!visible) {
    return null;
  }

  return (
    <>
      {/* CANCEL MODAL */}
      <View style={[styles.modalOverlay,{bottom: hasBottomBar ? 0 : 0}]} onTouchEnd={onClose}>
        <View
          style={styles.modalContainer}
          onTouchEnd={e => e.stopPropagation()}
        >
          <View style={styles.dragBar} />

          <Text style={styles.modalTitle}>Cancel Appointment</Text>

          <View style={styles.policyBox}>
            <Text style={styles.policyText}>
              You can cancel your appointment before the scheduled time.
            </Text>
          </View>

          {/* <View style={styles.refundBoxModal}>
            <Text style={styles.refundTextModal}>
              Any applicable refund will be processed according to the
              cancellation policy.
            </Text>
          </View> */}

          <Text style={styles.label}>Reason (Optional)</Text>

          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setShowReasonModal(true)}
          >
            <Text
              style={{
                color: reason ? '#000' : '#6B7280',
              }}
            >
              {reason || 'Select Reason'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmBtn}
            disabled={isPending}
            onPress={onConfirm}
          >
            <Text style={styles.confirmText}>
              {isPending ? 'Cancelling...' : 'Confirm Cancellation'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.keepBtn} onPress={onClose}>
            <Text style={styles.keepText}>Keep Appointment</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* REASON MODAL */}
      {showReasonModal && (
        <View
          style={[styles.modalOverlay,{bottom: hasBottomBar ? 71: 0}]}
          onTouchEnd={() => setShowReasonModal(false)}
        >
          <View
            style={[styles.modalContainer, { paddingTop: 30 }]}
            onTouchEnd={e => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { marginBottom: 10 }]}>
              Select Reason
            </Text>

            {reasons.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reasonItem}
                onPress={() => {
                  onSelectReason(item);
                  setShowReasonModal(false);
                }}
              >
                <Text style={styles.reasonText}>{item}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowReasonModal(false)}
              style={[styles.keepBtn, { marginVertical: 20 }]}
            >
              <Text style={styles.keepText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

export default CancelAppointmentModal;

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 71,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 34,
  },

  dragBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000ff',
  },

  modalSub: {
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 12,
    fontSize: 13,
  },

  policyText: {
    fontSize: 13,
    color: '#000000ff',
    marginVertical: 10,
  },

  refundBoxModal: {
    backgroundColor: '#FFF4E5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  refundTextModal: {
    fontSize: 13,
    color: '#B45309',
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    color: '#000000ff',
  },

  selectBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  confirmBtn: {
    backgroundColor: '#EF4444',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },

  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },

  keepBtn: {
    borderWidth: 1,
    borderColor: '#2563EB',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  keepText: {
    color: '#2563EB',
    fontWeight: '700',
  },

  reasonItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  reasonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
