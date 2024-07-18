import { View, Text } from 'react-native'
import React, { useState, useEffect } from 'react'
import { NavigationHeader } from '@components/Header'
import { RoundedScrollContainer, SafeAreaView } from '@components/containers'
import { TextInput as FormInput } from '@components/common/TextInput'
import { formatDate } from '@utils/common/date'
import { LoadingButton } from '@components/common/Button'
import { DropdownSheet } from '@components/common/BottomSheets'
import * as Location from 'expo-location';
import { fetchCustomersDropdown } from '@api/dropdowns/dropdownApi'

const VisitForm = ({ navigation }) => {

  const [selectedType, setSelectedType] = useState(null);
  const [errors, setErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    customer: '',
    visitedBy: '',
    dateAndTime: new Date(),
    visitPurpose: '',
    visitDuration: '',
    remarks: '',
    longitude: null,
    latitude: null
  })

  console.log("🚀 ~ VisitForm ~ formData:", formData)
  const [dropdowns, setDropdowns] = useState({
    customers: [],
    visitPurpose: [],
    visitDuration: [],
  })

  useEffect(() => {
    (async () => {
        // Request permission to access location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }

        // Get current location
        let location = await Location.getCurrentPositionAsync({});
        setFormData({
            ...formData,
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
        });
    })();
}, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customersDropdown = await fetchCustomersDropdown();
        // const visitPurposeDropdown = await fetchDepartmentsDropdown();
        // const visitDuration = await fetchBrandsDropdown();
        setDropdowns({
          customers: customersDropdown.map((data) => ({
            id: data._id,
            label: data.name,
          })),
          // visitPurpose: visitPurposeDropdown.map((data) => ({
          //   id: data._id,
          //   label: data.department_name,
          // })),
          // visitDuration: visitDuration.map((data) => ({
          //   id: data._id,
          //   label: data.brand_name,
          // })),
        });
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchData();
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: null,
      }));
    }
  };

  const toggleBottomSheet = (type) => {
    setSelectedType(type);
    setIsVisible(!isVisible);
  };

  const renderBottomSheet = () => {
    let items = [];
    let fieldName = '';

    switch (selectedType) {
      case 'Customers':
        items = dropdowns.customers;
        fieldName = 'customer';
        break;
      case 'Visit Purpose':
        items = dropdowns.visitPurpose;
        fieldName = 'assignedTo';
        break;
      case 'Visit Duration':
        items = dropdowns.visitDuration;
        fieldName = 'brand';
        break;
      default:
        return null;
    }
    return (
      <DropdownSheet
        isVisible={isVisible}
        items={items}
        title={selectedType}
        onClose={() => setIsVisible(false)}
        onValueChange={(value) => handleFieldChange(fieldName, value)}
      />
    );
  };

  return (
    <SafeAreaView>
      <NavigationHeader
        title="New Customer Visit"
        onBackPress={() => navigation.goBack()}
      />
      <RoundedScrollContainer>
        <FormInput
          label={"Customer Name"}
          placeholder={"Select Customer"}
          dropIcon={"menu-down"}
          editable={false}
        // validate={errors.customer}
        onPress={() => toggleBottomSheet('Customers')}
        />
        <FormInput
          label={"Visited By"}
          placeholder={"Visited By"}
          dropIcon={"menu-down"}
          editable={false}
        // validate={errors.customer}
        />
        <FormInput
          label={"Date & Time"}
          dropIcon={"calendar"}
          editable={false}
          value={formatDate(formData.dateAndTime, 'dd-MM-yyyy hh:mm:ss')}
        />
        <FormInput
          label={"Visit Purpose"}
          placeholder={"Select purpose of Visit"}
          dropIcon={"menu-down"}
          editable={false}
        // validate={errors.customer}
        // onPress={() => toggleBottomSheet('')}
        />
        <FormInput
          label={"Visit Duration(mins)"}
          placeholder={"Select visit duration"}
          dropIcon={"menu-down"}
          editable={false}
        // validate={errors.customer}
        // onPress={() => toggleBottomSheet('')}
        />
        <FormInput
          label={"Remarks"}
          placeholder={"Enter Remraks"}
          multiline={true}
          numberOfLines={5}
          value={formData.remarks}
          onChangeText={(value)=> handleFieldChange('remarks', value)}
        />
        {renderBottomSheet()}

        <LoadingButton title='SUBMIT'  />
      </RoundedScrollContainer>
    </SafeAreaView>
  )
}

export default VisitForm