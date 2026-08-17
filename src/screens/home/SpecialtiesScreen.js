/* eslint-disable react-native/no-inline-styles */
import Feather from 'react-native-vector-icons/Feather';
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {colors, fonts} from '../../theme';
import {useTranslation} from 'react-i18next';

const specialties = [
  {name: 'General', icon: require('../../assets/images/general.png')},
  {name: 'Cardiology', icon: require('../../assets/images/cardiology.png')},
  {name: 'Neuro', icon: require('../../assets/images/neuro.png')},
  {name: 'Derma', icon: require('../../assets/images/derma.png')},
  {name: 'Dental', icon: require('../../assets/images/dental.png')},
  {name: 'Paediatrics', icon: require('../../assets/images/paediatrics.png')},
  {name: 'Gynaecology', icon: require('../../assets/images/gynaecology.png')},
  {name: 'Ophthal', icon: require('../../assets/images/ophthal.png')},
  {name: 'General', icon: require('../../assets/images/general.png')},
  {name: 'Cardiology', icon: require('../../assets/images/cardiology.png')},
  {name: 'Neuro', icon: require('../../assets/images/neuro.png')},
  {name: 'Derma', icon: require('../../assets/images/derma.png')},
  {name: 'Dental', icon: require('../../assets/images/dental.png')},
  {name: 'Paediatrics', icon: require('../../assets/images/paediatrics.png')},
  {name: 'Gynaecology', icon: require('../../assets/images/gynaecology.png')},
  {name: 'Ophthal', icon: require('../../assets/images/ophthal.png')},
  {name: 'General', icon: require('../../assets/images/general.png')},
  {name: 'Cardiology', icon: require('../../assets/images/cardiology.png')},
  {name: 'Neuro', icon: require('../../assets/images/neuro.png')},
  {name: 'Derma', icon: require('../../assets/images/derma.png')},
  {name: 'Dental', icon: require('../../assets/images/dental.png')},
  {name: 'Paediatrics', icon: require('../../assets/images/paediatrics.png')},
  {name: 'Gynaecology', icon: require('../../assets/images/gynaecology.png')},
  {name: 'Ophthal', icon: require('../../assets/images/ophthal.png')},
];

export default function SpecialtiesScreen({navigation}) {
  const {t} = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = specialties.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.row, {gap: 0}]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}>
            <Feather name="arrow-left" size={18} color="#060D1F" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{t('allSpecialties')}</Text>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Icon name="search" size={16} color="#888" />
        <TextInput
          placeholder={t('searchSpecialties')}
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>

      <FlatList
        data={filtered}
        numColumns={3}
        keyExtractor={(item, i) => i.toString()}
        contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 20}}
        columnWrapperStyle={{
          gap: 16,
          marginBottom: 16,
        }}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('BrowseByDoctors', {
                specialty: item.name,
              })
            }>
            <View style={styles.iconWrap}>
              <Image source={item.icon} style={styles.icon} />
            </View>
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

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
    color: colors.textPrimary,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    fontWeight: '600',
    fontSize: 12,
  },

  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    padding: 5,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignItems: 'center',
  },

  input: {
    marginLeft: 8,
    paddingRight: 32,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    width: '100%',
  },

  grid: {
    paddingHorizontal: 16,
    flexWrap: 'wrap',
  },

  card: {
    //   flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 0,
    width: '30%',
  },

  iconWrap: {
    backgroundColor: '#EEF2F7',
    borderRadius: 12,
    marginBottom: 8,
    //   width: 70,
    //   height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    width: 60,
    height: 60,
  },

  name: {
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
    color: colors.textPrimary,
  },
});
