import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { colors, fonts } from '../../theme';

import {
    useCitiesSearchQuery,
    useQualificationSpecializationsQuery,
} from '../../hooks/queries/useLookupQueries';

const POPULAR_SEARCHES = [
    'Fever',
    'Skin doctor',
    'Child fever',
    'Cold & cough',
    'Diabetes',
    'Blood test',
    'Stomach pain',
    'Women health',
];

const AdvancedDoctorSearchModal = ({
    visible,
    onClose,
    onSearch,

    // Existing search from BrowseByDoctors
    initialSearch = '',

    // Existing selected filters
    initialSpecialization = null,
    initialCity = null,

    initialLocationType = 'city',
}) => {
    const useDebounce = (value, delay = 300) => {
        const [debouncedValue, setDebouncedValue] =
            useState(value);

        useEffect(() => {
            const timer = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            return () => {
                clearTimeout(timer);
            };
        }, [value, delay]);

        return debouncedValue;
    };

    const [search, setSearch] = useState(
        initialSearch || '',
    );

    const [
        specializationText,
        setSpecializationText,
    ] = useState(
        initialSpecialization?.name ||
        initialSpecialization?.label ||
        initialSpecialization?.title ||
        '',
    );

    const [cityText, setCityText] = useState(
        initialCity?.label ||
        initialCity?.name ||
        '',
    );

    const debouncedCitySearch =
        useDebounce(cityText, 300);

    const [
        selectedSpecialization,
        setSelectedSpecialization,
    ] = useState(
        initialSpecialization || null,
    );

    const [selectedCity, setSelectedCity] =
        useState(initialCity || null);

    const [locationType, setLocationType] =
        useState(
            initialLocationType || 'city',
        );

    const [
        showSpecializationList,
        setShowSpecializationList,
    ] = useState(false);

    const [showCityList, setShowCityList] =
        useState(false);

    /*
     * ==========================================
     * QUALIFICATION / SPECIALIZATION LOOKUP
     * ==========================================
     */

    const {
        data: specializationResponse,
        isFetching: specializationLoading,
    } = useQualificationSpecializationsQuery(
        specializationText,
    );

    /*
     * ==========================================
     * CITY LOOKUP
     * ==========================================
     */

    const {
        data: cityResponse,
        isFetching: cityLoading,
    } = useCitiesSearchQuery(
        debouncedCitySearch,
    );

    /*
     * ==========================================
     * NORMALIZE SPECIALIZATION RESPONSE
     * ==========================================
     */

    const specializations = useMemo(() => {
        const result =
            specializationResponse?.data
                ?.data ||
            specializationResponse?.data
                ?.qualification_specializations ||
            specializationResponse
                ?.qualification_specializations ||
            specializationResponse?.data ||
            [];

        return Array.isArray(result)
            ? result
            : [];
    }, [specializationResponse]);

    /*
     * ==========================================
     * NORMALIZE CITY RESPONSE
     * ==========================================
     */

    const cities = useMemo(() => {
        const result =
            cityResponse?.data?.data ||
            cityResponse?.data?.cities ||
            cityResponse?.cities ||
            cityResponse?.data ||
            [];

        return Array.isArray(result)
            ? result
            : [];
    }, [cityResponse]);

    /*
     * ==========================================
     * WHEN MODAL OPENS
     * ==========================================
     */

    useEffect(() => {
        if (!visible) {
            return;
        }

        setSearch(
            initialSearch || '',
        );

        setSpecializationText(
            initialSpecialization?.name ||
            initialSpecialization?.label ||
            initialSpecialization?.title ||
            '',
        );

        setCityText(
            initialCity?.label ||
            initialCity?.name ||
            '',
        );

        setSelectedSpecialization(
            initialSpecialization || null,
        );

        setSelectedCity(
            initialCity || null,
        );

        setLocationType(
            initialLocationType || 'city',
        );

        setShowSpecializationList(false);
        setShowCityList(false);
    }, [
        visible,
        initialSearch,
        initialSpecialization,
        initialCity,
        initialLocationType,
    ]);

    /*
     * ==========================================
     * SEARCH TEXT
     * ==========================================
     */

    const handleSearchChange = value => {
        setSearch(value);
    };

    /*
     * ==========================================
     * POPULAR SEARCH
     * ==========================================
     */

    const handlePopularSearch = value => {
        setSearch(value);
    };

    /*
     * ==========================================
     * CLEAR SEARCH
     * ==========================================
     */

    const clearSearch = () => {
        setSearch('');
    };

    /*
     * ==========================================
     * CLEAR SPECIALIZATION
     * ==========================================
     */

    const clearSpecialization = () => {
        setSpecializationText('');
        setSelectedSpecialization(null);
        setShowSpecializationList(false);
    };

    /*
     * ==========================================
     * CLEAR CITY
     * ==========================================
     */

    const clearCity = () => {
        setCityText('');
        setSelectedCity(null);
        setShowCityList(false);
    };

    /*
     * ==========================================
     * SELECT SPECIALIZATION
     * ==========================================
     */

    const handleSelectSpecialization =
        item => {
            setSelectedSpecialization(item);

            setSpecializationText(
                item?.name ||
                item?.label ||
                item?.title ||
                '',
            );

            setShowSpecializationList(false);
        };

    /*
     * ==========================================
     * SELECT CITY
     * ==========================================
     */

    const handleSelectCity = item => {
        setSelectedCity(item);

        setCityText(
            item?.label ||
            item?.name ||
            '',
        );

        setLocationType('city');

        setShowCityList(false);
    };

    /*
     * ==========================================
     * CURRENT LOCATION
     * ==========================================
     */

    const handleCurrentLocation = () => {
        setLocationType('current');
        setShowCityList(false);
    };

    /*
     * ==========================================
     * STATE
     * ==========================================
     */

    const handleStateLocation = () => {
        setLocationType('state');
        setShowCityList(false);
    };

    /*
     * ==========================================
     * APPLY SEARCH
     * ==========================================
     */

    const handleSearch = () => {
        const payload = {
            q:
                search.trim() ||
                undefined,

            qualification_specialization_id:
                selectedSpecialization?.id ||
                undefined,

            city_id:
                locationType === 'city'
                    ? selectedCity?.id ||
                    undefined
                    : undefined,

            source: 'advanced',
        };

        onSearch?.(payload);
    };

    /*
     * ==========================================
     * SPECIALIZATION ITEM
     * ==========================================
     */

    const renderSpecializationItem = ({
        item,
    }) => {
        const selected =
            selectedSpecialization?.id ===
            item?.id;

        return (
            <TouchableOpacity
                activeOpacity={0.75}
                style={[
                    styles.dropdownItem,
                    selected &&
                    styles.dropdownItemSelected,
                ]}
                onPress={() =>
                    handleSelectSpecialization(
                        item,
                    )
                }>
                <View
                    style={
                        styles.dropdownIcon
                    }>
                    <Feather
                        name="activity"
                        size={15}
                        color="#1264F5"
                    />
                </View>

                <Text
                    style={
                        styles.dropdownItemText
                    }
                    numberOfLines={2}>
                    {item?.name ||
                        item?.label ||
                        item?.title ||
                        'Specialization'}
                </Text>

                {selected && (
                    <Feather
                        name="check"
                        size={17}
                        color="#1264F5"
                    />
                )}
            </TouchableOpacity>
        );
    };

    /*
     * ==========================================
     * CITY ITEM
     * ==========================================
     */

    const renderCityItem = ({
        item,
    }) => {
        const selected =
            selectedCity?.id ===
            item?.id;

        return (
            <TouchableOpacity
                activeOpacity={0.75}
                style={[
                    styles.dropdownItem,
                    selected &&
                    styles.dropdownItemSelected,
                ]}
                onPress={() =>
                    handleSelectCity(item)
                }>
                <View
                    style={
                        styles.dropdownIcon
                    }>
                    <Feather
                        name="map-pin"
                        size={15}
                        color="#1264F5"
                    />
                </View>

                <Text
                    style={
                        styles.dropdownItemText
                    }
                    numberOfLines={2}>
                    {item?.label ||
                        item?.name ||
                        'City'}
                </Text>

                {selected && (
                    <Feather
                        name="check"
                        size={17}
                        color="#1264F5"
                    />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.root}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : undefined
                }>
                <View style={styles.overlay}>
                    {/* BACKDROP */}

                    <Pressable
                        style={styles.backdrop}
                        onPress={onClose}
                    />

                    <View style={styles.sheet}>
                        {/* DRAG HANDLE */}

                        <View
                            style={
                                styles.dragHandle
                            }
                        />

                        {/* ====================================
                            HEADER
                        ==================================== */}

                        <View
                            style={
                                styles.header
                            }>
                            <Text
                                style={
                                    styles.title
                                }>
                                Search Doctors
                            </Text>

                            {/* CLOSE */}

                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={onClose}
                                style={
                                    styles.closeButton
                                }>
                                <Feather
                                    name={Platform.OS === 'ios' ? 'x-circle' : 'x'}
                                    size={20}
                                    color="#344054"
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={
                                false
                            }
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={
                                styles.scrollContent
                            }>
                            {/* ==================================
                                WHAT ARE YOU LOOKING FOR
                            ================================== */}

                            <View
                                style={
                                    styles.section
                                }>
                                <Text
                                    style={
                                        styles.label
                                    }>
                                    What are you
                                    looking for?
                                </Text>

                                <View
                                    style={
                                        styles.inputContainer
                                    }>
                                    <Feather
                                        name="search"
                                        size={18}
                                        color="#1264F5"
                                    />

                                    <TextInput
                                        value={
                                            search
                                        }
                                        onChangeText={
                                            handleSearchChange
                                        }
                                        placeholder="Doctor name, specialty, symptom (e.g. fever)"
                                        placeholderTextColor="#9AA4B5"
                                        style={
                                            styles.input
                                        }
                                        returnKeyType="search"
                                    />

                                    {search.length >
                                        0 && (
                                            <TouchableOpacity
                                                activeOpacity={
                                                    0.7
                                                }
                                                onPress={
                                                    clearSearch
                                                }
                                                style={
                                                    styles.clearInput
                                                }>
                                                <Feather
                                                    name="x"
                                                    size={13}
                                                    color="#FFFFFF"
                                                />
                                            </TouchableOpacity>
                                        )}
                                </View>
                            </View>

                            {/* ==================================
                                SPECIALTY
                            ================================== */}

                            <View
                                style={[
                                    styles.section,
                                    {
                                        zIndex: 30,
                                    },
                                ]}>
                                <Text
                                    style={
                                        styles.label
                                    }>
                                    Specialty
                                </Text>

                                <TouchableOpacity
                                    activeOpacity={
                                        0.8
                                    }
                                    style={
                                        styles.selectBox
                                    }
                                    onPress={() => {
                                        setShowSpecializationList(
                                            value =>
                                                !value,
                                        );

                                        setShowCityList(
                                            false,
                                        );
                                    }}>
                                    <View
                                        style={
                                            styles.selectLeft
                                        }>
                                        <View
                                            style={
                                                styles.selectIcon
                                            }>
                                            <Feather
                                                name="activity"
                                                size={17}
                                                color="#1264F5"
                                            />
                                        </View>

                                        <Text
                                            numberOfLines={
                                                1
                                            }
                                            style={[
                                                styles.selectText,
                                                !specializationText &&
                                                styles.placeholderText,
                                            ]}>
                                            {specializationText ||
                                                'Select specialty'}
                                        </Text>
                                    </View>

                                    {specializationText ? (
                                        <TouchableOpacity
                                            activeOpacity={
                                                0.7
                                            }
                                            onPress={
                                                clearSpecialization
                                            }>
                                            <Feather
                                                name="x-circle"
                                                size={18}
                                                color="#98A2B3"
                                            />
                                        </TouchableOpacity>
                                    ) : specializationLoading ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#1264F5"
                                        />
                                    ) : (
                                        <Feather
                                            name={
                                                showSpecializationList
                                                    ? 'chevron-up'
                                                    : 'chevron-down'
                                            }
                                            size={18}
                                            color="#526071"
                                        />
                                    )}
                                </TouchableOpacity>

                                {/* SPECIALIZATION DROPDOWN */}

                                {showSpecializationList && (
                                    <View
                                        style={
                                            styles.dropdown
                                        }>
                                        <View
                                            style={
                                                styles.dropdownSearch
                                            }>
                                            <Feather
                                                name="search"
                                                size={15}
                                                color="#8995A8"
                                            />

                                            <TextInput
                                                value={
                                                    specializationText
                                                }
                                                onChangeText={value => {
                                                    setSpecializationText(
                                                        value,
                                                    );

                                                    setSelectedSpecialization(
                                                        null,
                                                    );
                                                }}
                                                placeholder="Search specialty"
                                                placeholderTextColor="#9AA4B5"
                                                style={
                                                    styles.dropdownInput
                                                }
                                                autoFocus
                                            />

                                            {specializationText.length >
                                                0 && (
                                                    <TouchableOpacity
                                                        activeOpacity={
                                                            0.7
                                                        }
                                                        onPress={
                                                            clearSpecialization
                                                        }>
                                                        <Feather
                                                            name="x-circle"
                                                            size={
                                                                17
                                                            }
                                                            color="#98A2B3"
                                                        />
                                                    </TouchableOpacity>
                                                )}
                                        </View>

                                        {specializations.length >
                                            0 ? (
                                            <FlatList
                                                data={
                                                    specializations
                                                }
                                                keyExtractor={(
                                                    item,
                                                    index,
                                                ) =>
                                                    String(
                                                        item?.id ??
                                                        index,
                                                    )
                                                }
                                                renderItem={
                                                    renderSpecializationItem
                                                }
                                                keyboardShouldPersistTaps="handled"
                                                nestedScrollEnabled
                                                style={
                                                    styles.dropdownList
                                                }
                                            />
                                        ) : (
                                            <View
                                                style={
                                                    styles.emptyDropdown
                                                }>
                                                <Text
                                                    style={
                                                        styles.emptyText
                                                    }>
                                                    {specializationText
                                                        ? 'No specialty found'
                                                        : 'Start typing to search'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>

                            {/* ==================================
                                LOCATION
                            ================================== */}

                            <View
                                style={[
                                    styles.section,
                                    {
                                        zIndex: 20,
                                    },
                                ]}>
                                <Text
                                    style={
                                        styles.label
                                    }>
                                    Location
                                </Text>

                                {/* CITY SEARCH */}

                                {locationType ===
                                    'city' && (
                                        <View
                                            style={
                                                styles.citySearchWrapper
                                            }>
                                            <View
                                                style={
                                                    styles.inputContainer
                                                }>
                                                <Feather
                                                    name="map-pin"
                                                    size={17}
                                                    color="#1264F5"
                                                />

                                                <TextInput
                                                    value={
                                                        cityText
                                                    }
                                                    onChangeText={value => {
                                                        setCityText(
                                                            value,
                                                        );

                                                        setSelectedCity(
                                                            null,
                                                        );

                                                        setShowCityList(
                                                            value
                                                                .trim()
                                                                .length >=
                                                            2,
                                                        );
                                                    }}
                                                    placeholder="Search city"
                                                    placeholderTextColor="#9AA4B5"
                                                    style={
                                                        styles.input
                                                    }
                                                />

                                                {cityLoading ? (
                                                    <ActivityIndicator
                                                        size="small"
                                                        color="#1264F5"
                                                    />
                                                ) : cityText.length >
                                                    0 ? (
                                                    <TouchableOpacity
                                                        activeOpacity={
                                                            0.7
                                                        }
                                                        onPress={
                                                            clearCity
                                                        }>
                                                        <Feather
                                                            name="x-circle"
                                                            size={
                                                                18
                                                            }
                                                            color="#98A2B3"
                                                        />
                                                    </TouchableOpacity>
                                                ) : null}
                                            </View>

                                            {showCityList &&
                                                cityText
                                                    .trim()
                                                    .length >=
                                                2 && (
                                                    <View
                                                        style={
                                                            styles.cityDropdown
                                                        }>
                                                        {cities.length >
                                                            0 ? (
                                                            <FlatList
                                                                data={
                                                                    cities
                                                                }
                                                                keyExtractor={(
                                                                    item,
                                                                    index,
                                                                ) =>
                                                                    String(
                                                                        item?.id ??
                                                                        index,
                                                                    )
                                                                }
                                                                renderItem={
                                                                    renderCityItem
                                                                }
                                                                keyboardShouldPersistTaps="handled"
                                                                nestedScrollEnabled
                                                            />
                                                        ) : (
                                                            <View
                                                                style={
                                                                    styles.emptyDropdown
                                                                }>
                                                                <Text
                                                                    style={
                                                                        styles.emptyText
                                                                    }>
                                                                    No city
                                                                    found
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                )}
                                        </View>
                                    )}
                            </View>

                            {/* ==================================
                                POPULAR SEARCHES
                            ================================== */}

                            <View
                                style={
                                    styles.section
                                }>
                                <Text
                                    style={
                                        styles.label
                                    }>
                                    Popular Searches
                                </Text>

                                <View
                                    style={
                                        styles.chipsContainer
                                    }>
                                    {POPULAR_SEARCHES.map(
                                        item => {
                                            const active =
                                                search
                                                    .trim()
                                                    .toLowerCase() ===
                                                item.toLowerCase();

                                            return (
                                                <TouchableOpacity
                                                    key={
                                                        item
                                                    }
                                                    activeOpacity={
                                                        0.75
                                                    }
                                                    style={[
                                                        styles.chip,
                                                        active &&
                                                        styles.chipActive,
                                                    ]}
                                                    onPress={() =>
                                                        handlePopularSearch(
                                                            item,
                                                        )
                                                    }>
                                                    <Text
                                                        style={[
                                                            styles.chipText,
                                                            active &&
                                                            styles.chipTextActive,
                                                        ]}>
                                                        {
                                                            item
                                                        }
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        },
                                    )}
                                </View>
                            </View>
                        </ScrollView>

                        {/* ==================================
                            FOOTER
                        ================================== */}

                        <View
                            style={
                                styles.footer
                            }>
                            <TouchableOpacity
                                activeOpacity={
                                    0.85
                                }
                                style={
                                    styles.searchButton
                                }
                                onPress={
                                    handleSearch
                                }>
                                <Feather
                                    name="search"
                                    size={18}
                                    color="#FFFFFF"
                                />

                                <Text
                                    style={
                                        styles.searchButtonText
                                    }>
                                    Search Doctors
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor:
            'rgba(15, 23, 42, 0.42)',
    },

    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
    },

    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor:
            'rgba(15, 23, 42, 0.42)',
    },

    sheet: {
        backgroundColor: '#FFFFFF',

        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,

        maxHeight: '91%',
        minHeight: '76%',

        paddingTop: 10,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 16,

        elevation: 20,
    },

    dragHandle: {
        width: 34,
        height: 4,
        borderRadius: 10,

        backgroundColor: '#D5DAE2',

        alignSelf: 'center',

        marginBottom: 13,
    },

    header: {
        paddingHorizontal: 20,
        paddingBottom: 14,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    title: {
        fontFamily: fonts.bold,
        fontSize: 20,
        color: '#101828',
    },

    closeButton: {
        width: 36,
        height: 36,

        borderRadius: 18,

        backgroundColor: '#F3F5F7',

        alignItems: 'center',
        justifyContent: 'center',
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },

    section: {
        marginBottom: 18,
    },

    label: {
        fontFamily: fonts.semiBold,
        fontSize: 13,
        color: '#172033',
        marginBottom: 9,
    },

    inputContainer: {
        height: 48,

        borderWidth: 1,
        borderColor: '#DDE3EC',

        borderRadius: 11,

        paddingHorizontal: 13,

        flexDirection: 'row',
        alignItems: 'center',

        backgroundColor: '#FFFFFF',
    },

    input: {
        flex: 1,

        marginLeft: 9,

        paddingVertical: 0,

        fontFamily: fonts.regular,
        fontSize: 13,
        color: '#182230',
    },

    clearInput: {
        width: 21,
        height: 21,

        borderRadius: 11,

        backgroundColor: '#98A2B3',

        alignItems: 'center',
        justifyContent: 'center',
    },

    selectBox: {
        height: 48,

        borderWidth: 1,
        borderColor: '#DDE3EC',

        borderRadius: 11,

        paddingHorizontal: 12,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        backgroundColor: '#FFFFFF',
    },

    selectLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    selectIcon: {
        width: 28,
        height: 28,

        borderRadius: 8,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: '#EFF5FF',
    },

    selectText: {
        flex: 1,

        marginLeft: 9,

        fontFamily: fonts.medium,
        fontSize: 13,

        color: '#344054',
    },

    placeholderText: {
        color: '#8A95A6',
        fontFamily: fonts.regular,
    },

    dropdown: {
        marginTop: 7,

        borderWidth: 1,
        borderColor: '#E1E6EE',

        borderRadius: 12,

        backgroundColor: '#FFFFFF',

        overflow: 'hidden',

        elevation: 8,

        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,

        shadowOffset: {
            width: 0,
            height: 4,
        },
    },

    dropdownSearch: {
        height: 43,

        paddingHorizontal: 12,

        flexDirection: 'row',
        alignItems: 'center',

        borderBottomWidth: 1,
        borderBottomColor: '#EDF0F4',
    },

    dropdownInput: {
        flex: 1,

        marginLeft: 8,

        fontFamily: fonts.regular,
        fontSize: 13,

        color: '#182230',
    },

    dropdownList: {
        maxHeight: 190,
    },

    dropdownItem: {
        minHeight: 48,

        paddingHorizontal: 12,

        flexDirection: 'row',
        alignItems: 'center',

        borderBottomWidth: 1,
        borderBottomColor: '#F0F2F5',
    },

    dropdownItemSelected: {
        backgroundColor: '#F5F9FF',
    },

    dropdownIcon: {
        width: 28,
        height: 28,

        borderRadius: 8,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: '#EFF5FF',

        marginRight: 9,
    },

    dropdownItemText: {
        flex: 1,

        fontFamily: fonts.medium,
        fontSize: 13,

        color: '#344054',
    },

    emptyDropdown: {
        paddingVertical: 18,

        alignItems: 'center',
    },

    emptyText: {
        fontFamily: fonts.regular,
        fontSize: 12,

        color: '#8A95A6',
    },

    locationRow: {
        flexDirection: 'row',
        gap: 7,
    },

    locationOption: {
        flex: 1,

        minHeight: 70,

        borderWidth: 1,
        borderColor: '#E1E6EE',

        borderRadius: 10,

        paddingVertical: 9,
        paddingHorizontal: 7,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: '#FFFFFF',
    },

    locationOptionActive: {
        borderColor: '#1264F5',
        backgroundColor: '#F5F9FF',
    },

    radio: {
        width: 15,
        height: 15,

        borderRadius: 8,

        borderWidth: 1.5,
        borderColor: '#A6B0C0',

        alignItems: 'center',
        justifyContent: 'center',

        marginBottom: 5,
    },

    radioActive: {
        borderColor: '#1264F5',
    },

    radioDot: {
        width: 7,
        height: 7,

        borderRadius: 4,

        backgroundColor: '#1264F5',
    },

    locationTitle: {
        fontFamily: fonts.medium,
        fontSize: 10.5,

        color: '#526071',

        textAlign: 'center',
    },

    locationTitleActive: {
        color: '#1264F5',
        fontFamily: fonts.semiBold,
    },

    locationSub: {
        marginTop: 2,

        fontFamily: fonts.regular,
        fontSize: 8.5,

        color: '#9AA4B5',

        textAlign: 'center',
    },

    citySearchWrapper: {
        position: 'relative',
    },

    cityDropdown: {
        marginTop: 6,

        maxHeight: 170,

        borderWidth: 1,
        borderColor: '#E1E6EE',

        borderRadius: 11,

        backgroundColor: '#FFFFFF',

        overflow: 'hidden',

        elevation: 6,
    },

    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',

        gap: 7,
    },

    chip: {
        borderWidth: 1,
        borderColor: '#E6EAF0',

        backgroundColor: '#F7F9FC',

        borderRadius: 9,

        paddingHorizontal: 11,
        paddingVertical: 8,
    },

    chipActive: {
        borderColor: '#1264F5',
        backgroundColor: '#EFF5FF',
    },

    chipText: {
        fontFamily: fonts.medium,
        fontSize: 11,

        color: '#475467',
    },

    chipTextActive: {
        color: '#1264F5',
        fontFamily: fonts.semiBold,
    },

    footer: {
        paddingHorizontal: 20,

        paddingTop: 9,

        paddingBottom: 50,

        borderTopWidth: 1,
        borderTopColor: '#F0F2F5',

        backgroundColor: '#FFFFFF',
    },

    searchButton: {
        height: 51,

        borderRadius: 11,

        backgroundColor: '#1264F5',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        gap: 8,
    },

    searchButtonText: {
        fontFamily: fonts.semiBold,
        fontSize: 14,

        color: '#FFFFFF',
    },
});

export default AdvancedDoctorSearchModal;