// OtherDetails.js
import React, { useState } from 'react';
import { RoundedScrollContainer } from '@components/containers';
import { TextInput as FormInput } from '@components/common/TextInput';
import { CheckBox } from '@components/common/CheckBox';
import { fetchInvoiceDropdown } from '@api/dropdowns/dropdownApi';
import { DropdownSheet } from '@components/common/BottomSheets';

const OtherDetails = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSupplier, setIsSupplier] = useState(false);

  return (
    <RoundedScrollContainer>
      <FormInput
        label={"TRN :"}
        placeholder={"Enter TRN"}
        editable={true}
      />
      <FormInput
        label={"Customer Behaviour :"}
        placeholder={"Select Customer Behaviour"}
        dropIcon={"menu-down"}
        editable={true}
      />
      <CheckBox
        label="Is Active"
        checked={isActive}
        onPress={() => setIsActive(!isActive)}
      />
      <FormInput
        label={"Customer Attitude :"}
        placeholder={"Enter Customer Attitude"}
        dropIcon={"menu-down"}
        editable={true}
      />
      <FormInput
        label={"Language :"}
        placeholder={"Select Language"}
        dropIcon={"menu-down"}
        editable={true}
      />
      <FormInput
        label={"Currency :"}
        placeholder={"Select Currency"}
        dropIcon={"menu-down"}
        editable={true}
      />
      <CheckBox
        label="Is Supplier"
        checked={isSupplier}
        onPress={() => setIsSupplier(!isSupplier)}
      />
    </RoundedScrollContainer>
  );
};

export default OtherDetails;
