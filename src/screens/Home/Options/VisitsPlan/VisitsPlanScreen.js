import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { RoundedContainer, SafeAreaView } from '@components/containers'
import { VerticalScrollableCalendar } from '@components/Calendar';
import { NavigationHeader } from '@components/Header';
import { AntDesign } from '@expo/vector-icons';
import { RulesModal } from '@components/Modal';
import { Button, FABButton } from '@components/common/Button';

const VisitsPlanScreen = ({ navigation }) => {

    const [isVisible, setIsVisible] = useState(false)

    const [date, setDate] = useState(new Date());

    return (
        <SafeAreaView>
            <NavigationHeader
                title="Visits Plan "
                onBackPress={() => navigation.goBack()}
                logo={false}
                icon={true}
                iconName='questioncircleo'
                iconPress={() => setIsVisible(!isVisible)}
            />
           
            <RoundedContainer>
                <View style={{ marginTop: 10 }} />
                <VerticalScrollableCalendar date={date} onChange={(newDate) => setDate(newDate)} />
            </RoundedContainer>
            <FABButton onPress={() => navigation.navigate('VisitPlanForm')} />
            <RulesModal isVisible={isVisible} onClose={() => setIsVisible(!isVisible)} />
        </SafeAreaView>
    )
}

export default VisitsPlanScreen