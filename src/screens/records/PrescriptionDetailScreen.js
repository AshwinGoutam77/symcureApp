/* eslint-disable react-native/no-inline-styles */

import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import DoctorHeader from '../../components/prescription/DoctorHeader';
import PatientCard from '../../components/prescription/PatientCard';
import ComplaintsSection from '../../components/prescription/ComplaintsSection';
import DiagnosisSection from '../../components/prescription/DiagnosisSection';
import FinalDiagnosisSection from '../../components/prescription/FinalDignosis';
import VitalsSection from '../../components/prescription/VitalsSection';
import ExaminationSection from '../../components/prescription/ExaminationSection';
import MedicinesSection from '../../components/prescription/MedicinesSection';
import InvestigationsSection from '../../components/prescription/InvestigationsSection';
import LifestyleSection from '../../components/prescription/LifestyleSection';
import FamilyHistorySection from '../../components/prescription/FamilyHistorySection';
import AdviceSection from '../../components/prescription/AdviceSection';
import FooterActions from '../../components/prescription/FooterActions';
import SectionCard from '../../components/prescription/SectionCard';

import { colors, fonts } from '../../theme';

import {
  usePrescriptionDetail,
  usePrescriptionPdfFormat,
} from '../../hooks/queries/useRecordsQueries';

const formatDate = value => {
  if (!value) {
    return '';
  }

  const date = new Date(String(value).replace(' ', 'T'));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ' | ' + date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export default function PrescriptionDetailScreen({ route, navigation }) {
  const { prescriptionId, doctorId } = route?.params || {};
  console.log("doctorId", doctorId);
  

  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = usePrescriptionDetail(prescriptionId);

  const {
    data: formatResponse,
    isLoading: isFormatLoading,
  } = usePrescriptionPdfFormat(doctorId);

  const pdfFormat = formatResponse?.prescription_pdf_format_setting;


  const prescription = response?.prescription;
  const detail = prescription?.general_detail;
  const finalDiagnosis = prescription?.final_diagnoses;

  const hasExaminationData = examination => {
    if (!examination) {
      return false;
    }

    const fields = [
      'general_condition',
      'pallor',
      'icterus',
      'cyanosis',
      'oedema',
      'lymph_nodes',
      'nutrition',
      'hydration',
      'local_examination',
      'systemic_examination',

      'general_condition_label',
      'pallor_label',
      'icterus_label',
      'cyanosis_label',
      'oedema_label',
      'lymph_nodes_label',
    ];

    const hasTextData = fields.some(field => {
      const value = examination[field];

      return (
        value !== null && value !== undefined && String(value).trim() !== ''
      );
    });

    // These are meaningful when explicitly true
    const hasBooleanData =
      examination.clubbing === true ||
      examination.purpura === true ||
      examination.obesity === true;

    return hasTextData || hasBooleanData;
  };

  if (isLoading || isFetching || isFormatLoading) {
    return (
      <>
        <View style={styles.header}>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.back}
            >
              <Feather name="arrow-left" size={18} color={colors.textPrimary} />
            </TouchableOpacity>

            <View>
              <Text style={styles.headerTitle}>Prescription Detail</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.darkPrimary} />
          <Text style={styles.loadingText}>Loading prescription...</Text>
        </View>
      </>
    );
  }

  if (error || !prescription) {
    return (
      <>
        <View style={styles.header}>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.back}
            >
              <Feather name="arrow-left" size={18} color={colors.textPrimary} />
            </TouchableOpacity>

            <View>
              <Text style={styles.headerTitle}>Prescription Detail</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <View style={styles.errorIcon}>
            <Feather name="alert-circle" size={28} color="#DC2626" />
          </View>

          <Text style={styles.errorTitle}>Unable to load prescription</Text>

          <Text style={styles.errorSub}>Please try again.</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const doctor = prescription?.doctor;

  const patient = prescription?.patient || null;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}
          >
            <Feather name="arrow-left" size={18} color={colors.textPrimary} />
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>Prescription Detail</Text>

            <Text style={styles.headerSub}>
              {prescription?.prescription_no}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* DOCTOR */}
        {pdfFormat?.doctor?.enabled && (
          <DoctorHeader
            prescription={{
              ...prescription,
              digital_signature_text: prescription?.digital_signature_text,
            }}
            settings={pdfFormat?.doctor}
            hospitalSettings={pdfFormat?.hospital}
          />
        )}

        {/* PATIENT */}
        {patient && pdfFormat?.patient?.name && (
          <PatientCard
            patient={patient}
            settings={pdfFormat?.patient}
          />
        )}

        {/* PATIENT */}

        {patient ? <PatientCard patient={patient} /> : null}

        {/* PRESCRIPTION META */}

        <View style={styles.metaCard}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Prescription No.</Text>

            <Text style={styles.metaValue}>
              {prescription?.prescription_no || '—'}
            </Text>
          </View>

          <View style={[styles.metaItem, styles.metaRight]}>
            <Text style={styles.metaLabel}>Issued On</Text>

            <Text style={styles.metaValue}>
              {formatDate(
                prescription?.submitted_at || prescription?.created_at,
              )}
            </Text>
          </View>
        </View>

          {/* VITALS */}
        {pdfFormat?.vitals?.enabled && !!prescription?.vitals && (
          <VitalsSection vitals={prescription.vitals}
            settings={pdfFormat.vitals} />
        )}

         {/* COMPLAINTS */}
        {pdfFormat?.complaints?.enabled &&
          !!prescription?.complaints?.length && (
            <ComplaintsSection complaints={prescription.complaints} />
          )}

        {/* DIAGNOSIS */}
        {pdfFormat?.diagnosis?.enabled &&
          (detail?.provisional_diagnosis_text ||
            detail?.final_diagnosis_text ||
            prescription?.diagnosis_summary) && (
            <DiagnosisSection detail={detail} />
          )}

           {pdfFormat?.additionaldiagnosis?.enabled &&
          (finalDiagnosis.length) && (
            <FinalDiagnosisSection detail={finalDiagnosis} />
          )}

        {/* EXAMINATION */}
        {pdfFormat?.examination?.enabled &&
          hasExaminationData(prescription?.examination) && (
            <ExaminationSection examination={prescription.examination} />
          )}

        {/* MEDICINES */}
        {pdfFormat?.medicines?.enabled &&
          !!prescription?.medicines?.length && (
            <MedicinesSection medicines={prescription.medicines} />
          )}

        {/* INVESTIGATIONS */}
        {pdfFormat?.investigations?.enabled &&
          !!prescription?.investigations?.length && (
            <InvestigationsSection investigations={prescription.investigations} />
          )}

        {/* CLINICAL HISTORY */}

        {pdfFormat?.clinicalHistory?.enabled && (
          <>
            {/* HISTORY OF PRESENT ILLNESS */}
            {pdfFormat.clinicalHistory.presentIllness &&
              !!detail?.history_present_illness && (
                <SectionCard
                  title="History of Present Illness"
                  value={detail.history_present_illness}
                />
              )}

            {/* PAST MEDICAL HISTORY */}
            {pdfFormat.clinicalHistory.pastMedicalHistory &&
              !!detail?.past_medical_notes && (
                <SectionCard
                  title="Past Medical Notes"
                  value={detail.past_medical_notes}
                />
              )}

            {/* PAST TREATMENT HISTORY */}
            {pdfFormat.clinicalHistory.pastTreatmentHistory &&
              !!detail?.past_treatment_history && (
                <SectionCard
                  title="Past Treatment History"
                  value={detail.past_treatment_history}
                />
              )}

            {/* DRUG ALLERGY */}
            {pdfFormat.clinicalHistory.drugAllergy &&
              !!detail?.drug_allergy && (
                <SectionCard
                  title="Drug Allergy"
                  value={detail.drug_allergy}
                />
              )}

            {/* FOOD ALLERGY */}
            {pdfFormat.clinicalHistory.foodAllergy &&
              !!detail?.food_other_allergy && (
                <SectionCard
                  title="Food / Other Allergy"
                  value={detail.food_other_allergy}
                />
              )}

            {/* LIFESTYLE */}
            {pdfFormat.clinicalHistory.lifestyleHabits &&
              !!prescription?.lifestyle_habits?.length && (
                <LifestyleSection
                  habits={prescription.lifestyle_habits}
                  settings={pdfFormat.clinicalHistory}
                />
              )}

            {/* FAMILY HISTORY */}
            {pdfFormat.clinicalHistory.familyHistory &&
              !!prescription?.family_histories?.length && (
                <FamilyHistorySection
                  family={prescription.family_histories}
                  settings={pdfFormat.clinicalHistory}
                />
              )}

            {/* EXAMINATION NOTES */}
            {pdfFormat.clinicalHistory.examinationNotes &&
              !!detail?.examination_notes && (
                <SectionCard
                  title="Examination Notes"
                  value={detail.examination_notes}
                />
              )}
          </>
        )}

        {/* ADVICE */}

        {pdfFormat?.followUp?.enabled &&
          (detail?.general_advice ||
            detail?.next_treatment_plan_notes ||
            detail?.follow_up_date ||
            detail?.next_review_plan) && (
            <AdviceSection
              general={detail}
              settings={pdfFormat.followUp}
            />
          )}

        {/* LOCKED RECORD */}

        <View style={styles.lockedCard}>
          <View style={styles.lockIcon}>
            <Feather name="lock" size={17} color="#16A34A" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.lockTitle}>Prescription Locked</Text>

            <Text style={styles.lockText}>
              This is a locked prescription and cannot be edited.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* <FooterActions prescription={prescription} /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EBF5',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: colors.textPrimary,
  },

  headerSub: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  content: {
    padding: 16,
    paddingBottom: 120,
  },

  metaCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  metaItem: {
    flex: 1,
  },

  metaRight: {
    alignItems: 'flex-end',
  },

  metaLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },

  metaValue: {
    marginTop: 4,
    fontSize: 14,
    color: '#111827',
    fontWeight: '800',
  },

  lockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
  },

  lockIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  lockTitle: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '800',
  },

  lockText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: '#15803D',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F8FB',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  errorIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorTitle: {
    marginTop: 14,
    fontSize: 18,
    color: '#111827',
    fontWeight: '800',
  },

  errorSub: {
    marginTop: 5,
    fontSize: 13,
    color: '#64748B',
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.darkPrimary,
  },

  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
});
