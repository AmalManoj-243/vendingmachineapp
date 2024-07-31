import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { FABButton } from '@components/common/Button';
import { RoundedContainer } from '@components/containers';
import { useNavigation } from '@react-navigation/native';

const CustomerVisit = ({ pipelineId }) => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.safeArea}>
            <RoundedContainer style={styles.container}>
                <FABButton
                    onPress={() => navigation.navigate('VisitForm', { pipelineId: pipelineId })}
                    style={styles.fabButton}
                />
            </RoundedContainer>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
    },
});

export default CustomerVisit;
