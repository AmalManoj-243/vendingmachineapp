import React from 'react'
import { FlatList } from 'react-native'
import { NavigationHeader } from '@components/Header';
import { RoundedContainer, SafeAreaView } from '@components/containers'
import { ListItem } from '@components/Options';
import { formatData } from '@utils/formatters';
import { EmptyItem } from '@components/common/empty';
import { COLORS } from '@constants/theme';

const AttendanceScreen = ({ navigation }) => {

    const options =
        [
            { title: 'Punching', image: require('@assets/images/Home/options/attendance/punching.png'), onPress: () => navigation.navigate('PunchingScreen') },
            { title: 'Leave Request', image: require('@assets/images/Home/options/attendance/leave_request.png'), onPress: () => navigation.navigate('LeaveRequestScreen') },
            { title: 'Attendance Requests', image: require('@assets/images/Home/options/attendance/attendance_requests.png'), onPress: () => navigation.navigate('') },
            { title: 'Leave Requests', image: require('@assets/images/Home/options/attendance/leave_request.png'), onPress: () => navigation.navigate('') },
            { title: 'Dashboard', image: require('@assets/images/Home/options/attendance/dashboard.png'), onPress: () => navigation.navigate('') },

        ]

    const renderItem = ({ item }) => {
        if (item.empty) {
            return <EmptyItem />;
        }
        return <ListItem title={item.title} image={item.image} onPress={item.onPress} />;
    };


    return (
        <SafeAreaView backgroundColor={COLORS.white}>
            <NavigationHeader
                title="Attendance"
                color={COLORS.black}
                backgroundColor={COLORS.white}
                onBackPress={() => navigation.goBack()}
            />
            <RoundedContainer backgroundColor={COLORS.primaryThemeColor}>
                <FlatList
                    data={formatData(options, 2)}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 15 }}
                    renderItem={renderItem}
                    numColumns={2}
                    keyExtractor={(item, index) => index.toString()}
                />
            </RoundedContainer>
        </SafeAreaView>
    )
}

export default AttendanceScreen