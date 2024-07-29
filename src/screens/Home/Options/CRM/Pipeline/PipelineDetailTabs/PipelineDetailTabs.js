import * as React from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { useState } from 'react';
import { SafeAreaView } from '@components/containers';
import { NavigationHeader } from '@components/Header';
import { CustomTabBar } from '@components/TabBar';
import FollowUp from './FollowUp';
import CustomerVisit from './CustomerVisit';
import EmailHistory from './EmailHistory';
import CallHistory from './CallHistory';
import WhatsAppHistory from './WhatsAppHistory';
import MeetingsTab from './MeetingsTab';

const PipelineDetailTabs = ({ navigation, route }) => {

  const { id } = route?.params || {};
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'Follow Up' },
    { key: 'second', title: 'Customer Visit' },
    { key: 'third', title: 'Email History' },
    { key: 'fourth', title: 'Call History' },
    { key: 'fifth', title: 'Whatsapp History' },
    { key: 'sixth', title: 'Meetings Tab' },
  ]);

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

  return (
    <SafeAreaView>
      <NavigationHeader
        title="Pipeline Details"
        onBackPress={() => navigation.goBack()}
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={props => <CustomTabBar {...props} />}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </SafeAreaView>
  );
};

export default PipelineDetailTabs;
