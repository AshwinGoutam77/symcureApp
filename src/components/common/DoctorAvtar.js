/* eslint-disable react-native/no-inline-styles */
import { useState } from "react";
import { StyleSheet } from "react-native";
import { Image } from "react-native";
import { Text } from "react-native";
import { View } from "react-native";
import { colors, fonts } from '../../theme';

export const DoctorAvatar = ({ doctor, size = 48 }) => {
    console.log(doctor);
    
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

const styles = StyleSheet.create({
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
})