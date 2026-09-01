import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Modal,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';

import { colors, fonts } from '../../theme';
import accountService from '../../services/accountService';
import { clearSession } from '../../store/authSlice';
import LinearGradient from 'react-native-linear-gradient';

export default function DeleteAccountScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();

    // ==========================================
    // STATE
    // ==========================================

    const [step, setStep] = useState(1);

    const [otp, setOtp] = useState('');
    const [otpRequestId, setOtpRequestId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Confirmation modal
    const [showConfirmModal, setShowConfirmModal] =
        useState(false);

    // Active appointments modal
    const [showBlockedModal, setShowBlockedModal] =
        useState(false);

    const [blockingAppointments, setBlockingAppointments] =
        useState([]);

    // ==========================================
    // SEND DELETE OTP
    // ==========================================

    const handleSendOtp = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await accountService.sendDeletionOtp();

            console.log(
                'DELETE ACCOUNT OTP RESPONSE:',
                response,
            );

            const requestId =
                response?.otp_request_id ||
                response?.data?.otp_request_id;

            // ------------------------------------------
            // Safety check
            // ------------------------------------------

            if (!requestId) {
                throw new Error(
                    'Unable to start account deletion.',
                );
            }

            setOtpRequestId(requestId);

            setShowConfirmModal(false);

            setStep(2);
        } catch (err) {
            console.log(
                'DELETE ACCOUNT OTP ERROR:',
                err,
            );

            const errorData =
                err?.error ||
                err?.response?.data?.error;

            const errorCode =
                errorData?.code;

            // ==========================================
            // ACTIVE APPOINTMENTS
            // ==========================================

            if (
                errorCode ===
                'ACCOUNT_HAS_ACTIVE_APPOINTMENTS'
            ) {
                setBlockingAppointments(
                    errorData?.details
                        ?.blocking_appointments || [],
                );

                setShowConfirmModal(false);

                setShowBlockedModal(true);

                return;
            }

            // ==========================================
            // OTHER ERROR
            // ==========================================

            setError(
                errorData?.message ||
                err?.message ||
                'Unable to send verification code. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // VERIFY DELETE OTP
    // ==========================================

    const handleVerifyOtp = async () => {
        if (otp.length !== 4) {
            setError('Enter the 4-digit OTP.');
            return;
        }

        if (!otpRequestId) {
            setError(
                'OTP session expired. Please request a new code.',
            );

            return;
        }

        try {
            setLoading(true);
            setError('');

            const response =
                await accountService.verifyDeletionOtp({
                    otp,
                    otp_request_id: otpRequestId,
                });

            console.log(
                'DELETE ACCOUNT RESPONSE:',
                response,
            );

            // ==========================================
// CLEAR LOCAL SESSION
// SAME AS LOGOUT
// ==========================================

try {
    console.log('STARTING DELETE ACCOUNT LOCAL LOGOUT');

    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('patient_account_id');
    await AsyncStorage.removeItem('active_profile');
    await AsyncStorage.removeItem('registration_phone');

    console.log('DELETE ACCOUNT STORAGE CLEARED');

} catch (storageError) {
    console.log(
        'DELETE ACCOUNT STORAGE ERROR:',
        storageError,
    );
}

// ==========================================
// CLEAR REDUX SESSION
// AuthNavigator will automatically show Login
// ==========================================

try {
    dispatch(clearSession());

    console.log(
        'DELETE ACCOUNT REDUX SESSION CLEARED',
    );

} catch (reduxError) {
    console.log(
        'DELETE ACCOUNT REDUX ERROR:',
        reduxError,
    );
}
        } catch (err) {
            console.log(
                'VERIFY DELETE OTP ERROR:',
                err,
            );

            const errorData =
                err?.error ||
                err?.response?.data?.error;

            const errorCode =
                errorData?.code;

            // ==========================================
            // OTP INVALID
            // ==========================================

            if (errorCode === 'OTP_INVALID') {
                setError(
                    'Invalid or expired OTP. Please request a new code.',
                );

                return;
            }

            // ==========================================
            // ACTIVE APPOINTMENTS
            // ==========================================

            if (
                errorCode ===
                'ACCOUNT_HAS_ACTIVE_APPOINTMENTS'
            ) {
                setBlockingAppointments(
                    errorData?.details
                        ?.blocking_appointments || [],
                );

                setShowBlockedModal(true);

                return;
            }

            // ==========================================
            // GENERAL ERROR
            // ==========================================

            setError(
                errorData?.message ||
                err?.message ||
                'Unable to delete your account. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // OPEN CONFIRMATION
    // ==========================================

    const openConfirmation = () => {
        setError('');
        setShowConfirmModal(true);
    };

    // ==========================================
    // CLOSE CONFIRMATION
    // ==========================================

    const closeConfirmation = () => {
        if (!loading) {
            setShowConfirmModal(false);
        }
    };

    // ==========================================
    // SCREEN
    // ==========================================

    return (
        <View
            style={[
                styles.container,
            ]}>

            {/* ======================================
          HEADER
      ====================================== */}

            {/* HEADER */}
            <LinearGradient
                colors={['#5CA8E8', '#8DD66B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}>
                            <Feather
                                name="arrow-left"
                                size={23}
                                color="#fff"
                            />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>
                            Delete Account
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* ======================================
          MAIN CONTENT
      ====================================== */}

            <View style={styles.content}>

                {/* ICON */}

                <View style={styles.iconCircle}>

                    <Feather
                        name="trash-2"
                        size={30}
                        color="#EF4444"
                    />

                </View>

                {/* ====================================
            STEP 1
        ==================================== */}

                {step === 1 ? (
                    <>

                        <Text style={styles.title}>
                            Delete your account
                        </Text>

                        <Text style={styles.description}>
                            Deleting your Symcure account will
                            permanently remove your account and
                            associated information.
                        </Text>

                        {/* WARNING */}

                        <View style={styles.warningCard}>

                            <View style={styles.warningRow}>

                                <Feather
                                    name="alert-circle"
                                    size={18}
                                    color="#EF4444"
                                />

                                <Text style={styles.warningText}>
                                    This action cannot be undone.
                                </Text>

                            </View>

                            <Text style={styles.deleteInfo}>
                                You will lose access to your patient
                                profile and account information.
                            </Text>

                        </View>

                        {/* DELETE */}

                        <TouchableOpacity
                            style={[
                                styles.deleteButton,
                                loading &&
                                styles.deleteButtonDisabled,
                            ]}
                            disabled={loading}
                            onPress={openConfirmation}>

                            <Feather
                                name="trash-2"
                                size={19}
                                color="#fff"
                            />

                            <Text style={styles.deleteButtonText}>
                                Delete My Account
                            </Text>

                        </TouchableOpacity>

                        {/* CANCEL */}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}
                            disabled={loading}>

                            <Text style={styles.cancelText}>
                                Cancel
                            </Text>

                        </TouchableOpacity>

                    </>
                ) : (

                    /* ====================================
                       STEP 2 — OTP
                    ==================================== */

                    <>

                        <Text style={styles.title}>
                            Verify account deletion
                        </Text>

                        <Text style={styles.description}>
                            We've sent a verification code to your
                            registered mobile number.
                        </Text>

                        {/* OTP */}

                        <TextInput
                            style={styles.otpInput}
                            value={otp}
                            onChangeText={text => {
                                setError('');

                                setOtp(
                                    text
                                        .replace(/[^0-9]/g, '')
                                        .slice(0, 4),
                                );
                            }}
                            keyboardType="number-pad"
                            maxLength={4}
                            placeholder="Enter 4-digit OTP"
                            placeholderTextColor="#9CA3AF"
                            textAlign="center"
                            editable={!loading}
                        />

                        {/* ERROR */}
                        {error ? (
                            <View style={styles.errorBox}>

                                <Feather
                                    name="alert-circle"
                                    size={16}
                                    color="#DC2626"
                                />

                                <Text style={styles.errorText}>
                                    {error}
                                </Text>

                            </View>
                        ) : null}

                        {/* VERIFY */}

                        <TouchableOpacity
                            style={[
                                styles.deleteButton,
                                (loading || otp.length !== 4) &&
                                styles.deleteButtonDisabled,
                            ]}
                            disabled={
                                loading ||
                                otp.length !== 4
                            }
                            onPress={handleVerifyOtp}>

                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Feather
                                        name="trash-2"
                                        size={19}
                                        color="#fff"
                                    />

                                    <Text style={styles.deleteButtonText}>
                                        Permanently Delete Account
                                    </Text>
                                </>
                            )}

                        </TouchableOpacity>

                        {/* BACK */}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            disabled={loading}
                            onPress={() => {
                                setOtp('');
                                setError('');
                                setOtpRequestId(null);
                                setStep(1);
                            }}>

                            <Text style={styles.cancelText}>
                                Go Back
                            </Text>

                        </TouchableOpacity>

                    </>
                )}

            </View>

            {/* ======================================
          CONFIRMATION MODAL
      ====================================== */}

            <Modal
                visible={showConfirmModal}
                transparent
                animationType="fade"
                onRequestClose={closeConfirmation}>

                <View style={styles.modalOverlay}>

                    <View style={styles.modalCard}>

                        <View style={styles.modalIcon}>

                            <Feather
                                name="trash-2"
                                size={25}
                                color="#EF4444"
                            />

                        </View>

                        <Text style={styles.modalTitle}>
                            Are you sure?
                        </Text>

                        <Text style={styles.modalDescription}>
                            This will permanently delete your
                            Symcure account and associated
                            information.
                        </Text>

                        {/* CONTINUE */}

                        <TouchableOpacity
                            style={styles.modalDeleteButton}
                            onPress={handleSendOtp}
                            disabled={loading}>

                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.modalDeleteText}>
                                    Yes, Continue
                                </Text>
                            )}

                        </TouchableOpacity>

                        {/* CANCEL */}

                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={closeConfirmation}
                            disabled={loading}>

                            <Text style={styles.modalCancelText}>
                                Cancel
                            </Text>

                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>

            {/* ======================================
          ACTIVE APPOINTMENTS MODAL
      ====================================== */}

            <Modal
                visible={showBlockedModal}
                transparent
                animationType="fade"
                onRequestClose={() =>
                    setShowBlockedModal(false)
                }>

                <View style={styles.modalOverlay}>

                    <View style={styles.modalCard}>

                        {/* ICON */}

                        <View style={styles.appointmentIcon}>

                            <Feather
                                name="calendar"
                                size={27}
                                color="#F59E0B"
                            />

                        </View>

                        <Text style={styles.modalTitle}>
                            Account can't be deleted
                        </Text>

                        <Text style={styles.modalDescription}>
                            You have upcoming or in-progress
                            appointments. Please cancel them
                            before deleting your account.
                        </Text>

                        {/* APPOINTMENT LIST */}

                        {blockingAppointments.length > 0 && (
                            <View style={styles.appointmentList}>

                                <Text
                                    style={styles.appointmentListTitle}>
                                    Active appointments
                                </Text>

                                {blockingAppointments.map(
                                    appointment => (
                                        <View
                                            key={
                                                appointment.appointment_id
                                            }
                                            style={
                                                styles.appointmentRow
                                            }>

                                            <View style={styles.appointmentLeft}>

                                                <Text
                                                    style={
                                                        styles.appointmentCode
                                                    }>
                                                    {
                                                        appointment.appointment_code
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.appointmentDate
                                                    }>
                                                    {formatAppointmentDate(
                                                        appointment.start_at,
                                                    )}
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.appointmentStatus
                                                    }>
                                                    {appointment.status}
                                                </Text>

                                            </View>

                                            <Feather
                                                name="chevron-right"
                                                size={18}
                                                color="#9CA3AF"
                                            />

                                        </View>
                                    ),
                                )}

                            </View>
                        )}

                        {/* VIEW APPOINTMENTS */}

                        <TouchableOpacity
                            style={styles.modalPrimaryButton}
                            onPress={() => {
                                setShowBlockedModal(false);

                                navigation.navigate(
                                    'Appointments',
                                );
                            }}>

                            <Text style={styles.modalPrimaryText}>
                                View Appointments
                            </Text>

                        </TouchableOpacity>

                        {/* CLOSE */}

                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() =>
                                setShowBlockedModal(false)
                            }>

                            <Text style={styles.modalCancelText}>
                                Close
                            </Text>

                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>

        </View>
    );
}

// ==========================================
// DATE FORMATTER
// ==========================================

const formatAppointmentDate = dateString => {
    if (!dateString) {
        return '';
    }

    try {
        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    } catch (error) {
        return '';
    }
};

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F7FD',
    },

    // ========================================
    // HEADER
    // ========================================

    header: {
        paddingTop: 75,
        paddingBottom: 20,
        paddingHorizontal: 18,
    },

    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    backBtn: {
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginRight: 10,
    },

    headerTitle: {
        color: '#fff',
        fontSize: 22,
        fontFamily: fonts.bold,
    },

    // ========================================
    // CONTENT
    // ========================================

    content: {
        flex: 1,
        paddingHorizontal: 22,
        alignItems: 'center',
        paddingTop: 45,
    },

    iconCircle: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 22,
    },

    title: {
        fontSize: 24,
        fontFamily: fonts.bold,
        color: '#111827',
        textAlign: 'center',
    },

    description: {
        width: '100%',
        fontSize: 14,
        lineHeight: 22,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 11,
    },

    // ========================================
    // WARNING CARD
    // ========================================

    warningCard: {
        width: '100%',
        backgroundColor: '#FFF7ED',
        borderRadius: 15,
        padding: 16,
        marginTop: 26,
        borderWidth: 1,
        borderColor: '#FED7AA',
    },

    warningRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    warningText: {
        flex: 1,
        marginLeft: 9,
        fontSize: 14,
        fontFamily: fonts.semiBold,
        color: '#C2410C',
    },

    deleteInfo: {
        marginTop: 8,
        fontSize: 13,
        lineHeight: 20,
        color: '#7C2D12',
    },

    // ========================================
    // BUTTONS
    // ========================================

    deleteButton: {
        width: '100%',
        height: 54,
        borderRadius: 14,
        backgroundColor: '#EF4444',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 28,
    },

    deleteButtonDisabled: {
        opacity: 0.55,
    },

    deleteButtonText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: fonts.semiBold,
        marginLeft: 9,
    },

    cancelButton: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
    },

    cancelText: {
        color: '#6B7280',
        fontSize: 15,
        fontFamily: fonts.semiBold,
    },

    // ========================================
    // OTP
    // ========================================

    otpInput: {
        width: '100%',
        height: 58,
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        marginTop: 28,
        fontSize: 22,
        fontFamily: fonts.bold,
        color: '#111827',
        letterSpacing: 6,
    },

    errorBox: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 12,
    },

    errorText: {
        flex: 1,
        marginLeft: 8,
        color: '#DC2626',
        fontSize: 13,
        lineHeight: 18,
    },

    // ========================================
    // MODAL
    // ========================================

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.58)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    modalCard: {
        width: '100%',
        maxWidth: 390,
        backgroundColor: '#fff',
        borderRadius: 24,
        paddingHorizontal: 22,
        paddingTop: 24,
        paddingBottom: 16,
        alignItems: 'center',
    },

    modalIcon: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },

    appointmentIcon: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },

    modalTitle: {
        fontSize: 20,
        fontFamily: fonts.bold,
        color: '#111827',
        textAlign: 'center',
    },

    modalDescription: {
        width: '100%',
        fontSize: 14,
        lineHeight: 21,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 9,
    },

    modalWarning: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 11,
        marginTop: 17,
    },

    modalWarningText: {
        flex: 1,
        marginLeft: 9,
        fontSize: 13,
        lineHeight: 18,
        color: '#B91C1C',
        fontFamily: fonts.semiBold,
    },

    modalDeleteButton: {
        width: '100%',
        height: 52,
        borderRadius: 13,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },

    modalDeleteText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: fonts.semiBold,
    },

    modalPrimaryButton: {
        width: '100%',
        height: 52,
        borderRadius: 13,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },

    modalPrimaryText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: fonts.semiBold,
    },

    modalCancelButton: {
        width: '100%',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 3,
    },

    modalCancelText: {
        color: '#6B7280',
        fontSize: 15,
        fontFamily: fonts.semiBold,
    },

    // ========================================
    // APPOINTMENTS
    // ========================================

    appointmentList: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginTop: 17,
    },

    appointmentListTitle: {
        fontSize: 15,
        fontFamily: fonts.semiBold,
        paddingVertical: 7,
    },

    appointmentRow: {
        minHeight: 58,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },

    appointmentLeft: {
        flex: 1,
        paddingVertical: 8,
        paddingRight: 10,
    },

    appointmentCode: {
        fontSize: 13,
        fontFamily: fonts.semiBold,
        color: '#111827',
    },

    appointmentDate: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 3,
    },

    appointmentStatus: {
        fontSize: 11,
        color: '#D97706',
        marginTop: 2,
        textTransform: 'capitalize',
        fontFamily: fonts.semiBold,
    },
});