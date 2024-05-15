import React, { useState, useEffect } from 'react';
import { FlashList } from '@shopify/flash-list';
import { formatData } from '@utils/formatters';
import { Loader } from '@components/Loader';
import { RoundedContainer, SafeAreaView, SearchContainer } from '@components/containers';
import { EmptyItem, EmptyState } from '@components/common/empty';
import { NavigationHeader } from '@components/Header';
import { FAB, Portal, Provider } from 'react-native-paper'; // Import FAB from react-native-paper
import { fetchInventoryBoxRequest } from '@api/services/generalApi';
import { useDataFetching, useDebouncedSearch } from '@hooks';
import InventoryList from './InventoryList';
import { COLORS, FONT_FAMILY } from '@constants/theme';
import { useIsFocused } from '@react-navigation/native';
import { InputModal } from '@components/Modal';

const InventoryScreen = ({ navigation }) => {
  const isFocused = useIsFocused();

  const [isVisible, setIsVisible] = useState(false);

  const toggleModal = () => setIsVisible(!isVisible)
 
  const { data, loading, fetchData, fetchMoreData } = useDataFetching(fetchInventoryBoxRequest);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLoadMore = () => {
    fetchMoreData();
  };

  const renderItem = ({ item }) => {
    if (item.empty) {
      return <EmptyItem />;
    }
    return (
      // console.log(item)
      <InventoryList item={item} />
    );
  };

  const renderEmptyState = () => (
    <EmptyState imageSource={require('@assets/images/EmptyData/empty_inventory_box.png')} message={''} />
  );

  const renderContent = () => (
    <FlashList
      data={formatData(data, 1)}
      numColumns={1}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{ padding: 10, paddingBottom: 50 }}
      onEndReached={handleLoadMore}
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.2}
      ListFooterComponent={loading && <Loader visible={loading} animationSource={require('@assets/animations/loading.json')} />}
      estimatedItemSize={100}
    />
  );

  const renderInventoryRequest = () => {
    if (data.length === 0 && !loading) {
      return renderEmptyState();
    }
    return renderContent();
  };

  const handleScan = async (scannedData) => {
    console.log("🚀 ~ handleScan ~ data:", scannedData)
   navigation.navigate('InventoryDetails', {scannedData})
  }

  const [fabOpen, setFabOpen] = useState(false);

  const onStateChange = ({ open }) => setFabOpen(open);

  return (
    <SafeAreaView>
      <NavigationHeader
        title="Inventory Management"
        onBackPress={() => navigation.goBack()}
      />
      <RoundedContainer >
        {renderInventoryRequest()}
        {isFocused && (
          <Portal>
            <FAB.Group
              fabStyle={{backgroundColor:COLORS.primaryThemeColor, borderRadius:30}}
              color={COLORS.white}
              backdropColor='transparent'
              open={fabOpen}
              visible={isFocused}
              icon={fabOpen ? 'arrow-up' : 'plus'}
              actions={[
                { icon: 'barcode-scan', label: 'Scan',  labelStyle: { fontFamily: FONT_FAMILY.urbanistSemiBold, color: COLORS.primaryThemeColor }, onPress: () => navigation.navigate('Scanner', { onScan: handleScan })},
                { icon: 'pencil', label: 'Box no', labelStyle: { fontFamily: FONT_FAMILY.urbanistSemiBold, color: COLORS.primaryThemeColor }, onPress: () => setIsVisible(true)},
                { icon: 'pencil', label: 'detail', labelStyle: { fontFamily: FONT_FAMILY.urbanistSemiBold, color: COLORS.primaryThemeColor }, onPress: () =>navigation.navigate('InventoryDetails')},

              ]}
              onStateChange={onStateChange}
              onPress={() => {
                if (fabOpen) {
                  // do something if the FAB group is open
                }
              }}
            />
          </Portal>
        )}
      </RoundedContainer>
      <InputModal
      isVisible={isVisible}
      onClose={toggleModal}
      onSubmit={text=>console.log(text)}
      />
    </SafeAreaView>
  );
}

export default InventoryScreen;
