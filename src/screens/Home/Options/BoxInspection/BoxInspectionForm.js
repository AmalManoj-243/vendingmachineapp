import React, { useState, useEffect, useCallback } from 'react';
import { Keyboard, View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from '@components/containers';
import { NavigationHeader } from '@components/Header';
import { LoadingButton } from '@components/common/Button';
import { showToast } from '@utils/common';
import { post } from '@api/services/utils';
import { RoundedScrollContainer } from '@components/containers';
import { TextInput as FormInput } from '@components/common/TextInput';
import { DropdownSheet } from '@components/common/BottomSheets';
import { fetchNonInspectedBox } from '@api/dropdowns/dropdownApi';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useAuthStore } from '@stores/auth';
import { formatDate } from '@utils/common/date';
import { validateFields } from '@utils/validation';
import { fetchInventoryDetails } from '@api/details/detailApi';
import NonInspectedBoxItems from './NonInspectedBoxItems';
import { COLORS, FONT_FAMILY } from '@constants/theme';
import { OverlayLoader } from '@components/Loader';
import { EmptyState } from '@components/common/empty';
import { showToastMessage } from '@components/Toast';
import Text from '@components/Text';

const BoxInspectionForm = ({ navigation }) => {
  const currentUser = useAuthStore(state => state.user);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDropdownType, setSelectedDropdownType] = useState(null);
  const [isDropdownSheetVisible, setIsDropdownSheetVisible] = useState(false);
  const [boxItems, setBoxItems] = useState([])

  const [formData, setFormData] = useState({
    date: new Date(),
    box: '',
    salesPerson: { id: currentUser?.related_profile?._id || '', label: currentUser?.related_profile?.name },
    warehouse: { id: currentUser?.warehouse?.warehouse_id || '', label: currentUser?.warehouse?.warehouse_name },
  });

  const [errors, setErrors] = useState({});
  const [dropdownOptions, setDropdownOptions] = useState({ box: [] });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const boxData = await fetchNonInspectedBox()
        setDropdownOptions({
          box: boxData.map(data => ({
            id: data.box_id,
            label: data.box_name,
          }))
        });
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to fetch dropdown data. Please try again later.',
        });
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (formData.box) {
      setLoading(true);
      const fetchInventoryBoxItems = async () => {
        try {
          const [boxItems] = await fetchInventoryDetails(formData.box.id)
          setBoxItems(boxItems?.items.map((item) => ({
            ...item,
            quantity: item.quantity,
            inspectedQuantity: 0
          })))

        } catch (error) {
          showToast({
            type: 'error',
            title: 'Error',
            message: 'Failed to fetch dropdown data. Please try again later.',
          });
        } finally {
          setLoading(false);
        }
      }
      fetchInventoryBoxItems()
    }
  }, [formData.box])

  const handleFieldChange = (field, value) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [field]: null,
      }));
    }
  };

  const toggleDropdownSheet = (type) => {
    setSelectedDropdownType(type);
    setIsDropdownSheetVisible(prevState => !prevState);
  };

  const handleDateConfirm = (date) => {
    handleFieldChange('date', date);
    setIsDatePickerVisible(false);
  };

  const renderDropdownSheet = () => {
    if (selectedDropdownType === 'Box Name') {
      return (
        <DropdownSheet
          isVisible={isDropdownSheetVisible}
          items={dropdownOptions.box}
          title={selectedDropdownType}
          onClose={() => setIsDropdownSheetVisible(false)}
          onValueChange={(value) => handleFieldChange('box', value)}
        />
      );
    }
    return null;
  };
  const renderEmptyState = () => (
    <EmptyState imageSource={require('@assets/images/EmptyData/empty_inventory_box.png')} message="Inspected items are empty" />
  );

  const handleQuantityChange = useCallback((id, text) => {
    const newQuantity = parseInt(text) || 0;

    setBoxItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id === id) {
          if (newQuantity > item.quantity) {
            showToastMessage('Inspected quantity cannot exceed available quantity.')
            return item;
          }
          return { ...item, inspectedQuantity: newQuantity };
        }
        return item;
      })
    );
  }, []);


  const renderContent = () => (
    <FlatList
      data={boxItems || []}
      ListHeaderComponent={(<View><Text style={styles.label}>Inspected Items</Text></View>)}
      numColumns={1}
      renderItem={({ item }) => (
        <NonInspectedBoxItems
          item={item}
          onQuantityChange={(id, text) => handleQuantityChange(id, text)}
        />
      )}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      estimatedItemSize={100}
    />
  );


  const validateForm = (fieldsToValidate) => {
    Keyboard.dismiss();
    const { isValid, errors } = validateFields(formData, fieldsToValidate);
    setErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    const fieldsToValidate = ['box', 'salesPerson'];
    if (validateForm(fieldsToValidate)) {
      setIsSubmitting(true);
      const boxInspectionData = {
        date: formData.date || null,
        box_id: formData.box?.id ?? null,
        sales_person_id: formData.salesPerson?.id || null,
        inspected_items: boxItems.map(item => ({
          product_id: item.product_id,
          product_name: item?.product_name,
          box_quantity: item?.quantity,
          inspected_quantity: item?.inspectedQuantity,
          uom_id: item?.uom_id || null,
          uom_name: item?.uom_name || ''
        })),
        warehouse_id: formData.warehouse?.id || null
      };
      try {
        const response = await post("/createBoxInspection", boxInspectionData);
        if (response.success) {
          showToast({
            type: 'success',
            title: 'Success',
            message: response.message || 'Box Inspection created successfully',
          });
          navigation.goBack();
        } else {
          showToast({
            type: 'error',
            title: 'Error',
            message: response.message || 'Box Inspection failed',
          });
        }
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'An unexpected error occurred. Please try again later.',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <SafeAreaView>
      <NavigationHeader
        title="Add Box Inspection"
        onBackPress={() => navigation.goBack()}
      />
      <RoundedScrollContainer>
        <FormInput
          label="Date"
          dropIcon="calendar"
          editable={false}
          value={formatDate(formData.date)}
          onPress={() => setIsDatePickerVisible(true)}
        />
        <FormInput
          label="Warehouse"
          dropIcon="menu-down"
          editable={false}
          required
          validate={errors.salesPerson}
          value={formData.warehouse?.label || ''}
          onPress={() => { }}
        />
        <FormInput
          label="Inspected By"
          dropIcon="menu-down"
          editable={false}
          required
          validate={errors.salesPerson}
          value={formData.salesPerson?.label || ''}
          onPress={() => { }}
        />
        <FormInput
          label="Box Name"
          required
          placeholder="Select Box Name"
          dropIcon="menu-down"
          editable={false}
          validate={errors.box}
          value={formData.box?.label || ''}
          onPress={() => toggleDropdownSheet('Box Name')}
        />
        {boxItems?.length === 0 ? renderEmptyState() : renderContent()}
        <OverlayLoader visible={loading} />
        <LoadingButton title="SAVE" onPress={handleSubmit} loading={isSubmitting} marginTop={10} />
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setIsDatePickerVisible(false)}
        />
        {renderDropdownSheet()}

      </RoundedScrollContainer>
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
})


export default BoxInspectionForm;
