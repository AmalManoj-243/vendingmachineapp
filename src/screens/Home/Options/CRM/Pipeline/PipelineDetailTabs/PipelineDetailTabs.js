import * as React from 'react';
import { useWindowDimensions, KeyboardAvoidingView, Platform, Keyboard, View } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { useState } from 'react';
import { SafeAreaView } from '@components/containers';
import { NavigationHeader } from '@components/Header';
import { COLORS, FONT_FAMILY } from '@constants/theme';
import FollowUp from './FollowUp';
import CustomerVisit from './CustomerVisit';
import EmailHistory from './EmailHistory';
import CallHistory from './CallHistory';
import WhatsAppHistory from './WhatsAppHistory';
import MeetingsTab from './MeetingsTab';

const CustomTabBar = (props) => {
  return (
    <TabBar
      scrollEnabled={true}
      {...props}
      style={{
        backgroundColor: COLORS.tabColor,
        justifyContent: 'center',
      }}
      indicatorStyle={{ backgroundColor: COLORS.tabIndicator, height: 3 }}
      labelStyle={{ color: COLORS.white, fontFamily: FONT_FAMILY.urbanistBold, fontSize: 13, textTransform: 'capitalize' }}
      pressColor='#2e294e'
      pressOpacity={0.5}
    />
  );
};

const PipelineDetailTabs = ({ navigation, route }) => {

  const  { id } = route?.params || {};
  const layout = useWindowDimensions();

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'first':
        return <FollowUp enquiryId={id} />;
      case 'second':
        return <CustomerVisit enquiryId={id} />;
      case 'third':
        return <EmailHistory enquiryId={id} />;
      case 'fourth':
        return <CallHistory enquiryId={id} />;
      case 'fifth':
        return <WhatsAppHistory enquiryId={id} />;
      case 'sixth':
        return <MeetingsTab enquiryId={id} />;
      default:
        return null;
    }
  };

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'Follow Up' },
    { key: 'second', title: 'Customer Visit' },
    { key: 'third', title: 'Email History' },
    { key: 'fourth', title: 'Call History' },
    { key: 'fifth', title: 'Whatsapp History' },
    { key: 'sixth', title: 'Meetings Tab' },
  ]);

  return (
    <SafeAreaView>
      <NavigationHeader
        title="Pipeline Details"
        onBackPress={() => navigation.goBack()}
      />
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={CustomTabBar}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
        />
    </SafeAreaView>
  );
};

export default PipelineDetailTabs;
