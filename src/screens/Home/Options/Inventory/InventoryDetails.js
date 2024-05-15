import React from 'react'
import { RoundedContainer, SafeAreaView } from '@components/containers'
import { NavigationHeader } from '@components/Header'
import Text from '@components/Text'
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { FONT_FAMILY } from '@constants/theme';
import { truncateString } from '@utils/common';

const InventoryDetails = () => {
  return (
   <SafeAreaView>
    <NavigationHeader
    title={'Inventory Details'}
    />
    <RoundedContainer>
  <Text>Inventory Box</Text>
  <Text>Location</Text>
  <Text>Date</Text>

  <Text>Items</Text>

    </RoundedContainer>
   </SafeAreaView>
  )
}



 const InventoryList = ({ item, onPress }) => {

  return (
    <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
      <View style={styles.leftColumn}>
        <Text style={styles.head}>{item?.boxes?.name || '-'}</Text>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row', flex: 1 }}>
          <Text style={styles.content}>{item?.reason || '-'}</Text>
          <Text style={[styles.contentRight, {color: 'red'}]}>{item?.quantity || '-'}</Text>
        </View>
        <Text style={styles.content}>{item?.box_status || '-'}</Text>
      </View>
      <View style={styles.rightColumn}></View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    marginHorizontal: 5,
    marginVertical: 5,
    backgroundColor: 'white',
    borderRadius: 15,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
      },
    }),
    padding: 20,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  head: {
    fontFamily: FONT_FAMILY.urbanistBold,
    fontSize: 17,
    marginBottom: 5,
  },
  content: {
    color: '#666666',
    marginBottom: 5,
    fontSize:14,
    fontFamily: FONT_FAMILY.urbanistSemiBold,
    textTransform:'capitalize'
  },
 
  contentRight: {
    color: '#666666',
    fontFamily: FONT_FAMILY.urbanistSemiBold,
    fontSize:14,
  },
});


export default InventoryDetails