import React, { useCallback, useState } from 'react';
import {
    ScrollView,
    RefreshControl,
} from 'react-native';

import { colors } from '../../theme';

export default function RefreshableScrollView({
    children,
    onRefresh,
    contentContainerStyle,
    ...props
}) {
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        if (!onRefresh) {
            return;
        }

        setRefreshing(true);

        try {
            await onRefresh();
        } catch (error) {
            console.log('REFRESH ERROR:', error);
        } finally {
            setRefreshing(false);
        }
    }, [onRefresh]);

    return (
        <ScrollView
            {...props}
            contentContainerStyle={contentContainerStyle}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                />
            }>
            {children}
        </ScrollView>
    );
}