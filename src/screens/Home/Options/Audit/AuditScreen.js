import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { RoundedContainer, SafeAreaView } from '@components/containers'
import { NavigationHeader } from '@components/Header';
import { FABButton } from '@components/common/Button';

const AuditScreen = ({ navigation }) => {
   
    return (
        <SafeAreaView>
            <NavigationHeader
                title="Transaction Auditing"
                onBackPress={() => navigation.goBack()}
            />
            <RoundedContainer>
                <FABButton onPress={()=> navigation.navigate('AuditForm')}/>
            </RoundedContainer>
        </SafeAreaView>
    )
}

export default AuditScreen