import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, fonts} from '../../theme';

export default function FinalDiagnosisSection({detail}) {
    console.log('detail', detail);
    
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Additional Diagnosis</Text>

    {detail?.map((item, index)=>{
        return(
              <View style={styles.box}>
          <Text style={styles.label}>Diagnosis</Text>

          <Text style={styles.value}>{item?.final_diagnosis_text} {item?.location_side_label && '-'} {item?.location_side_label}</Text>
        </View>
        )
    })}
    
      {/* {!!detail?.provisional_diagnosis_text && (
        <View style={styles.box}>
          <Text style={styles.label}>Provisional Diagnosis</Text>

          <Text style={styles.value}>{detail.provisional_diagnosis_text}</Text>
        </View>
      )}

      {!!detail?.final_diagnosis_text && (
        <View style={styles.box}>
          <Text style={styles.label}>Final Diagnosis</Text>

          <Text style={styles.value}>{detail.final_diagnosis_text}</Text>
        </View>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },

  heading: {
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: 16,
    color: '#111827',
  },

  box: {
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
  },

  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 5,
  },

  value: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.primary,
  },
});
