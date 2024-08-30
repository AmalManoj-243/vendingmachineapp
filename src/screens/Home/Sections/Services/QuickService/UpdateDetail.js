import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from '@components/containers';
import NavigationHeader from '@components/Header/NavigationHeader';
import { RoundedScrollContainer } from '@components/containers';
import { DetailField } from '@components/common/Detail';
import { OverlayLoader } from '@components/Loader';
import { Button } from '@components/common/Button';
import SparePartsList from './SparePartsList';
import { formatDateTime } from '@utils/common/date';
import { showToastMessage } from '@components/Toast';
import { fetchServiceDetails } from '@api/details/detailApi';
import { COLORS, FONT_FAMILY } from '@constants/theme';
import AntDesign from '@expo/vector-icons/AntDesign';
import { post } from '@api/services/utils';
import { useAuthStore } from '@stores/auth';
import { showToast } from '@utils/common';

const UpdateDetails = ({ route, navigation }) => {
  const { id } = route.params || {};
  console.log("🚀 ~ file: UpdateDetail.js:22 ~ UpdateDetails ~ id:", id)
  const currentUser = useAuthStore((state) => state.user);
  const [details, setDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sparePartsItems, setSparePartsItems] = useState([]);
  console.log("🚀 ~ file: UpdateDetail.js:25 ~ UpdateDetails ~ sparePartsItems:", JSON.stringify(sparePartsItems, null, 2))

  const addSpareParts = (addedItems) => {
    setSparePartsItems(prevItems => [...prevItems, addedItems]);
  };

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const updatedDetails = await fetchServiceDetails(id);
      setDetails(updatedDetails[0] || {});
    } catch (error) {
      console.error('Error fetching service details:', error);
      showToastMessage('Failed to fetch service details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchDetails(id);
      }
    }, [id])
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log(hii);
    
    const requestPayload = {
      job_registration_id: id,
      proposed_action_id: null,
      proposed_action_name: null,
      status: "waiting for parts",
      created_by: null,
      created_by_name: "",
      assigned_to: "6650704c2e5cf73d84470013",
      assigned_to_name: "Abhijith Danat",
      warehouse_id: "66307fc0ceb8eb834bb25509",
      warehouse_name: "Danat Hub",
      sales_person_id: null,
      sales_person_name: "",
      done_by_id: currentUser?.related_profile?._id || null,
      done_by_name: currentUser?.related_profile?.name || '',
      parts_or_service_required: null,
      service_type: null,
      untaxed_total_amount: 12,  //
      service_charge: 100,  //
      total_amount: 112.6,  //
      parts: sparePartsItems.map((items) => ({
        product_id: items?.product.id,
        product_name: items?.product.label,
        description: items?.description,
        uom_id: items?.uom?.id,
        uom: items?.uom.label,
        unit_price: items.unitPrice,
        unit_cost: '',
        tax_type_name: "vat 5%",
        tax_type_id: "648d9b54ef9cd868dfbfa37b"
      }))
    }

    console.log("🚀 ~ file: UpdateDetail.js:86 ~ handleSubmit ~ requestPayload:", JSON.stringify(requestPayload, null, 2))
    try {
      const response = await post("/createJobApproveQuote", requestPayload);
      console.log("🚀 ~ submit ~ response:", response);
      if (response.success === 'true') {
        showToast({
          type: "success",
          title: "Success",
          message: response.message || "Spare Parts Request updated successfully",
        });
        navigation.navigate("QuickServiceScreen");
      } else {
        console.error("Spare Parts Request Failed:", response.message);
        showToast({
          type: "error",
          title: "ERROR",
          message: response.message || "Spare Parts Request updation failed",
        });
      }
    } catch (error) {
      console.error("Error Updating Spare Parts Request Failed:", error);
      showToast({
        type: "error",
        title: "ERROR",
        message: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationHeader
        title="Update Details"
        onBackPress={() => navigation.goBack()}
      />
      <RoundedScrollContainer>
        <DetailField
          label="Customer"
          value={details?.customer_name?.trim() || '-'}
          multiline
          numberOfLines={3}
          textAlignVertical={'top'}
        />
        <DetailField label="Mobile Number" value={details?.customer_mobile || '-'} />
        <DetailField label="Email" value={details?.customer_email || '-'} />
        <DetailField label="Warehouse Name" value={details?.warehouse_name || '-'} />
        <DetailField label="Created On" value={formatDateTime(details.date)} />
        <DetailField label="Created By" value={details?.assignee_name || '-'} />
        <DetailField label="Brand Name" value={details?.brand_name || '-'} />
        <DetailField label="Device Name" value={details?.device_name || '-'} />
        <DetailField label="Consumer Model" value={details?.consumer_model_name || '-'} />
        <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginVertical: 10 }}>
          <Text style={styles.label}>Add an Item</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('AddSpareParts', { id, addSpareParts })}>
            <AntDesign name="pluscircle" size={26} color={COLORS.orange} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={sparePartsItems}
          renderItem={({ item }) => (
            <SparePartsList item={item} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <Button
          title={'SUBMIT'}
          width={'50%'}
          alignSelf={'center'}
          backgroundColor={COLORS.primaryThemeColor}
          onPress={handleSubmit}
        />
      </RoundedScrollContainer>
      {isLoading && <OverlayLoader />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  label: {
    marginVertical: 5,
    fontSize: 16,
    color: COLORS.primaryThemeColor,
    fontFamily: FONT_FAMILY.urbanistSemiBold,
  },
});

export default UpdateDetails;
