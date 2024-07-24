import React, { useState, useEffect } from 'react';
import { useWindowDimensions, KeyboardAvoidingView, Platform, Keyboard, View } from 'react-native';
import { SafeAreaView } from '@components/containers';
import { NavigationHeader } from '@components/Header';
import { COLORS, FONT_FAMILY } from '@constants/theme';
import { LoadingButton } from '@components/common/Button';
import { showToast } from '@utils/common';
import { post } from '@api/services/utils';
import { RoundedScrollContainer } from '@components/containers';
import { TextInput as FormInput } from '@components/common/TextInput';
import { DropdownSheet } from '@components/common/BottomSheets';
import { fetchSourceDropdown } from '@api/dropdowns/dropdownApi';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

const EnquiryRegisterView = ({ navigation }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date');

  const [formData, setFormData] = useState({
    dateTime: '',
    source: '',
    name: '',
    companyName: '',
    phoneNumber: '',
    emailAddress: '',
    address: '',
    enquiryDetails: '',
  });

  const [errors, setErrors] = useState({});

  const [dropdown, setDropdown] = useState({
    source: [],
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const sourceData = await fetchSourceDropdown();
        setDropdown(prevDropdown => ({
          ...prevDropdown,
          source: sourceData.map(data => ({
            id: data._id,
            label: data.name,
          })),
        }));
      } catch (error) {
        console.error('Error fetching source dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  const toggleBottomSheet = (type) => {
    setSelectedType(type);
    setIsVisible(!isVisible);
  };

  const handleDateConfirm = (date) => {
    const formattedDate = moment(date).format('DD-MM-YYYY');
    handleFieldChange('dateTime', formattedDate);
    setDatePickerVisibility(false);
  };

  const renderBottomSheet = () => {
    let items = [];
    let fieldName = '';

    switch (selectedType) {
      case 'Source':
        items = dropdown.source;
        fieldName = 'source';
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

  const validate = () => {
    Keyboard.dismiss();
    let isValid = true;
    let errors = {};

    const requiredFields = {
      name: 'Please enter the Name',
      phoneNumber: 'Please enter Phone Number'
    };

    Object.keys(requiredFields).forEach(field => {
      if (!formData[field]) {
        errors[field] = requiredFields[field];
        isValid = false;
      }
    });

    if (formData.emailAddress && !/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      errors.emailAddress = 'Please enter a valid email address';
      isValid = false;
    }

    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const submit = async () => {
    if (validate()) {
      const enquiryData = {
        image_url: null,
        date : formData?.dateTime || null,
        source_id: formData?.source?.id,
        name: formData?.name || null,
        company_name: formData?.companyName || null,
        mobile_no: formData?.phoneNumber || null,
        email: formData?.emailAddress || null,
        address: formData?.address || null,
        enquiry_details: formData?.enquiryDetails || null,
      };

      console.log("🚀 ~ submit ~ enquiryData:", JSON.stringify(enquiryData, null, 2))
      try {
        const response = await post("/createEnquiryRegister", enquiryData);
        if (response.success) {
          showToast({
            type: "success",
            title: "Success",
            message: response.message || "Enquiry Register created successfully",
          });
          navigation.navigate("EnquiryRegisterScreen");
        } else {
          console.error("Enquiry Register Failed:", response.message);
          showToast({
            type: "error",
            title: "ERROR",
            message: response.message || "Enquiry Registration failed",
          });
        }
      } catch (error) {
        console.error("Error creating Enquiry Register Failed:", error);
        showToast({
          type: "error",
          title: "ERROR",
          message: "An unexpected error occurred. Please try again later.",
        });
      }
    }
  };

  return (
    <SafeAreaView>
      <NavigationHeader
        title="Add Enquiry Register"
        onBackPress={() => navigation.goBack()}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
        <RoundedScrollContainer>
          <FormInput
            label={"Date Time"}
            dropIcon={"calendar"}
            editable={false}
            value={formData.dateTime}
            onPress={() => {
              setDatePickerMode('date');
              setDatePickerVisibility(true);
            }}
          />
          <FormInput
            label={"Source"}
            placeholder={"Select Source"}
            dropIcon={"menu-down"}
            editable={false}
            validate={errors.source}
            value={formData.source?.label}
            onPress={() => toggleBottomSheet('Source')}
          />
          <FormInput
            label={"Name"}
            placeholder={"Enter Name"}
            editable={true}
            validate={errors.name}
            onChangeText={(value) => handleFieldChange('name', value)}
          />
          <FormInput
            label={"Company Name"}
            placeholder={"Enter Company Name"}
            editable={true}
            onChangeText={(value) => handleFieldChange('companyName', value)}
          />
          <FormInput
            label={"Phone"}
            placeholder={"Enter Phone Number"}
            editable={true}
            keyboardType="numeric"
            validate={errors.phoneNumber}
            onChangeText={(value) => handleFieldChange('phoneNumber', value)}
          />
          <FormInput
            label={"Email"}
            placeholder={"Enter Email"}
            editable={true}
            validate={errors.emailAddress}
            onChangeText={(value) => handleFieldChange('emailAddress', value)}
          />
          <FormInput
            label={"Address"}
            placeholder={"Enter Address"}
            editable={true}
            validate={errors.address}
            onChangeText={(value) => handleFieldChange('address', value)}
          />
          <FormInput
            label={"Enquiry Details"}
            placeholder={"Enter Enquiry Details"}
            editable={true}
            multiline={true}
            numberOfLines={5}
            textAlignVertical="top"
            onChangeText={(value) => handleFieldChange('enquiryDetails', value)}
          />
          {renderBottomSheet()}
          <View style={{ backgroundColor: 'white', paddingHorizontal: 50 }}>
            <LoadingButton
              title={"Save"}
              onPress={submit}
            />
          </View>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode={datePickerMode}
            onConfirm={handleDateConfirm}
            onCancel={() => setDatePickerVisibility(false)}
          />
        </RoundedScrollContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EnquiryRegisterView;
