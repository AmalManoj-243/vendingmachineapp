import React, { useState, useEffect, useCallback } from 'react';
import { Keyboard, View } from 'react-native';
import { SafeAreaView } from '@components/containers';
import { NavigationHeader } from '@components/Header';
import { LoadingButton } from '@components/common/Button';
import { showToast } from '@utils/common';
import { put } from '@api/services/utils';
import { RoundedScrollContainer } from '@components/containers';
import { TextInput as FormInput } from '@components/common/TextInput';
import { DropdownSheet } from '@components/common/BottomSheets';
import { fetchAssigneeDropdown, fetchCustomerNameDropdown, fetchDeviceDropdown, fetchBrandDropdown,
fetchConsumerModelDropdown, fetchWarehouseDropdown, fetchSalesPersonDropdown } from '@api/dropdowns/dropdownApi';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { formatDate } from '@utils/common/date';
import { validateFields } from '@utils/validation';
import { fetchPickupDetails } from '@api/details/detailApi';
import { useFocusEffect } from '@react-navigation/native';
import { OverlayLoader } from '@components/Loader';

const EditPickup = ({ navigation, route }) => {

  const { pickupId } = route?.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDropdownType, setSelectedDropdownType] = useState(null);
  const [isDropdownSheetVisible, setIsDropdownSheetVisible] = useState(false);
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({});
  const [dropdown, setDropdown] = useState({
    customerName: [],
    device: [],
    brand: [],
    consumerModel: [],
    warehouse: [],
    assignee: [],
    salesPerson: []
  });

  const fetchDetails = async (pickupId) => {
    setIsLoading(true);
    try {
      const [detail] = await fetchPickupDetails(pickupId);
      setFormData((prevFormData) => ({
        ...prevFormData,
        date: detail?.date || new Date(),
        customerName: detail?.customer_Name || '',
        device: detail?.device || '',
        brand: detail?.brand || '',
        consumerModel: detail?.consumer_Model || '',
        serialNumber: detail?.serial_Number || '',
        warehouse: detail?.consumer_Model || '',
        pickupScheduledTime: detail?.pickup_scheduled_time || null,
        assignee: detail?.assignee_name || '',
        salesPerson: detail?.sales_person || '',
        remarks: detail?.remarks || '',
      }));
    } catch (error) {
      console.error('Error fetching enquiry details:', error);
      showToast({ type: 'error', title: 'Error', message: 'Failed to fetch enquiry details. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (pickupId) {
        fetchDetails(pickupId);
      }
    }, [pickupId])
  );

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const customerNameDropdown = await fetchCustomerNameDropdown();
        const deviceDropdown = await fetchDeviceDropdown();
        const brandDropdown = await fetchBrandDropdown();
        const consumerModelDropdown = await fetchConsumerModelDropdown();
        const warehouseDropdown = await fetchWarehouseDropdown();
        const assigneeDropdown = await fetchAssigneeDropdown();
        const salesPersonDropdown = await fetchSalesPersonDropdown();

        setDropdown({
          customerNameDropdown: customerNameDropdown.map(data => ({ id: data._id, label: data.name })),
          deviceDropdown: deviceDropdown.map(data => ({ id: data._id, label: data.model_name })),
          brandDropdown: brandDropdown.map(data => ({ id: data._id, label: data.brand_name })),
          consumerModelDropdown: consumerModelDropdown.map(data => ({ id: data._id, label: data.model_name })),
          warehouseDropdown: warehouseDropdown.map(data => ({ id: data._id, label: data.warehouse_name })),
          assigneeDropdown: assigneeDropdown.map(data => ({ id: data._id, label: data.name })),
          salesPerson: salesPersonDropdown.map(data => ({ id: data._id, label: data.name })),
        });
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData((prevFormData) => ({ ...prevFormData, [field]: value }));
    if (errors[field]) {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: null }));
    }
  };

  const toggleDropdownSheet = (type) => {
    setSelectedDropdownType(type);
    setIsDropdownSheetVisible(!isDropdownSheetVisible);
  };

  const handleDateConfirm = (date) => {
    const formattedDate = formatDate(date, 'yyyy-MM-dd');
    handleFieldChange('pickupScheduledTime', formattedDate);
    setIsDatePickerVisible(false);
  };

  const renderBottomSheet = () => {
    let items = [];
    let fieldName = '';

    switch (selectedDropdownType) {
      case 'Customer Name':
        items = dropdown.customerName;
        fieldName = 'customerName';
        break;
      case 'Device':
        items = dropdown.device;
        fieldName = 'device';
        break;
      case 'Brand':
        items = dropdown.brand;
        fieldName = 'brand';
        break;
      case 'Consumer Model':
        items = dropdown.consumerModel;
        fieldName = 'consumerModel';
        break;
      case 'Warehouse':
        items = dropdown.warehouse;
        fieldName = 'warehouse';
        break;
      case 'Assignee':
        items = dropdown.assignee;
        fieldName = 'assignee';
        break;
      case 'Sales Person':
        items = dropdown.salesPerson;
        fieldName = 'salesPerson';
        break;
      default:
        return null;
    }
    return (
      <DropdownSheet
        isVisible={isDropdownSheetVisible}
        items={items}
        title={selectedDropdownType}
        onClose={() => setIsDropdownSheetVisible(false)}
        onValueChange={(value) => handleFieldChange(fieldName, value)}
      />
    );
  };

  const validateForm = (fieldsToValidate) => {
    Keyboard.dismiss();
    const { isValid, errors } = validateFields(formData, fieldsToValidate);
    setErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    const fieldsToValidate = ['device', 'brand'];
    if (validateForm(fieldsToValidate)) {
      setIsSubmitting(true);
      const pickupData = {
        //pickup_id: pickupId,
        //BODYYY OF
      };
      try {
        const response = await put("/updatePickup", pickupData);
        if (response.success) {
          showToast({
            type: "success", title: "Success",
            message: response.message || "Pickup Created Successfully"
          });
          navigation.goBack();
        } else {
          showToast({
            type: "error", title: "Error",
            message: response.message || "Pickup Creation failed"
          });
        }
      } catch (error) {
        showToast({
          type: "error", title: "Error",
          message: "An unexpected error occurred. Please try again later."
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <SafeAreaView>
      <NavigationHeader title="Edit Pickup" onBackPress={() => navigation.goBack()} />
      <RoundedScrollContainer>
        <FormInput
          label="Date"
          dropIcon="calendar"
          editable={false}
          value={formatDate(formData.date)}
        />
        <FormInput
          label={"Customer Name"}
          placeholder={"Select Customer Name"}
          dropIcon={"menu-down"}
          editable={false}
          validate={errors.customerName}
          value={formData.customerName?.label}
          onPress={() => toggleDropdownSheet('Customer Name')}
        />
        <FormInput
          label={"Device"}
          placeholder={"Select Device"}
          dropIcon={"menu-down"}
          editable={false}
          required
          validate={errors.device}
          value={formData.device?.label}
          onPress={() => toggleDropdownSheet('Device')}
        />
        <FormInput
          label={"Brand"}
          placeholder={"Select Brand"}
          dropIcon={"menu-down"}
          editable={false}
          required
          validate={errors.brand}
          value={formData.brand?.label}
          onPress={() => toggleDropdownSheet('Brand')}
        />
        <FormInput
          label={"Consumer Model"}
          placeholder={"Select Consumer Model"}
          dropIcon={"menu-down"}
          editable={false}
          validate={errors.consumerModel}
          value={formData.consumerModel?.label}
          onPress={() => toggleDropdownSheet('Consumer Model')}
        />
        <FormInput
          label={"Serial Number"}
          placeholder={"Enter Serial Number"}
          editable={true}
          keyboardType="numeric"
          validate={errors.serialNumber}
          onChangeText={(value) => handleFieldChange('serialNumber', value)}
        />
        <FormInput
          label={"Warehouse"}
          placeholder={"Select Warehouse"}
          dropIcon={"menu-down"}
          editable={false}
          validate={errors.warehouse}
          value={formData.warehouse?.label}
          onPress={() => toggleDropdownSheet('Warehouse')}
        />
        <FormInput
          label={"Pickup Scheduled Time"}
          placeholder={"Select Pickup Scheduled Time"}
          editable={false}
          value={formData.pickupScheduledTime ? formatDate(formData.pickupScheduledTime) : ''}
          dropIcon={"clock-outline"}
          validate={errors.pickupScheduledTime}
          onPress={() => setIsDatePickerVisible(true)}
        />
        <FormInput
          label={"Assignee"}
          placeholder={"Select Assignee"}
          dropIcon={"menu-down"}
          editable={false}
          validate={errors.assignee}
          value={formData.assignee?.label}
          onPress={() => toggleDropdownSheet('Assignee')}
        />
        <FormInput
          label={"Sales Person"}
          placeholder={"Select Sales Person"}
          dropIcon={"menu-down"}
          editable={false}
          validate={errors.salesPerson}
          value={formData.salesPerson?.label}
          onPress={() => toggleDropdownSheet('Sales Person')}
        />
        <FormInput
          label={"Remarks"}
          placeholder={"Enter Remarks"}
          editable={true}
          onChangeText={(value) => handleFieldChange('remarks', value)}
        />
        {renderBottomSheet()}
        <LoadingButton title="SAVE" onPress={handleSubmit} marginTop={10} loading={isSubmitting} />
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setIsDatePickerVisible(false)}
        />
        <View style={{ marginBottom: 10 }} />
        <OverlayLoader visible={isLoading} />
      </RoundedScrollContainer>
    </SafeAreaView>
  );
};

export default EditPickup;