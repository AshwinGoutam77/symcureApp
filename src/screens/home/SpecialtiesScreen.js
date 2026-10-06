/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import Feather from 'react-native-vector-icons/Feather';
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fonts } from '../../theme';
import { useTranslation } from 'react-i18next';
import { useDashboardQuery } from '../../hooks/queries/useDashboardQueries';

export default function SpecialtiesScreen({ navigation }) {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');

  const {
    data: dashboard,
    isLoading,
    isFetching,
  } = useDashboardQuery();

  /*
   * API:
   * GET /patient/dashboard
   *
   * dashboard.data.specialty_groups
   */
  const specialtyGroups =
    dashboard?.data?.specialty_groups || [];

  /*
   * Search specialty groups
   */
  const filteredSpecialties = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return specialtyGroups;
    }

    return specialtyGroups.filter(item =>
      String(item?.title || '')
        .toLowerCase()
        .includes(searchText),
    );
  }, [specialtyGroups, search]);

  /*
   * Loading
   */
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}
            activeOpacity={0.8}>
            <Feather
              name="arrow-left"
              size={19}
              color="#060D1F"
            />
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>
              {t('allSpecialties') || 'All Specialities'}
            </Text>
          </View>
        </View>
      </View>

      {/* SPECIALITIES */}
      <FlatList
        data={filteredSpecialties}
        numColumns={3}
        keyExtractor={(item, index) =>
          String(item?.id ?? index)
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.listContent
        }
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => {
              if (!item?.id) {
                return;
              }

              navigation.navigate(
                'BrowseByDoctors',
                {
                  specialty_group_id: item?.id,
                  search: item.title,
                },
              );
            }}>
            {/* IMAGE / DEFAULT ICON */}
            <View style={styles.iconWrap}>
              {item?.image_url ? (
                <Image
                  source={{
                    uri: item.image_url,
                  }}
                  style={styles.icon}
                  resizeMode="contain"
                />
              ) : (
                <Feather
                  name="heart"
                  size={24}
                  color={colors.primary}
                />
              )}
            </View>

            {/* TITLE */}
            <Text
              style={styles.name}
              numberOfLines={2}>
              {item?.title || 'Speciality'}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Feather
                name="search"
                size={24}
                color="#98A2B3"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No specialities found
            </Text>

            <Text style={styles.emptyText}>
              Try searching for another speciality.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FD',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F7FD',
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    paddingTop: 58,
    paddingHorizontal: 16,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
    marginBottom: 20,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  back: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F4F7FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },

  headerSubtitle: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#98A2B3',
  },

  searchBox: {
    height: 48,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF1F5',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    marginLeft: 9,
    paddingVertical: 0,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    fontSize: 14,
  },

  clearButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  resultHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  resultCount: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#667085',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  card: {
    width: '31.5%',
    minHeight: 116,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF1F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
    paddingVertical: 13,
  },

  iconWrap: {
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
  },

  icon: {
    width: 45,
    height: 45,
    borderRadius: 10,
  },

  name: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: colors.textPrimary,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },

  emptyText: {
    marginTop: 5,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#98A2B3',
    textAlign: 'center',
  },
});