import React, { useState } from 'react';
import { RoundedContainer, SafeAreaView } from '@components/containers';
import { NavigationHeader } from '@components/Header';
import { CalendarScreen } from '@components/Calendar';

const PunchingScreen = ({ navigation }) => {
    const handleDayPress = (day) => {
        console.log('Selected day', day);
    };
    return (
        <SafeAreaView>
            <NavigationHeader
                title="Punching"
                onBackPress={() => navigation.goBack()}
                logo={false}
            />
            <RoundedContainer>
                <CalendarScreen
                    onDayPress={handleDayPress}
                />
            </RoundedContainer>
        </SafeAreaView>
    );
};

export default PunchingScreen;
