import React from 'react'
import { RoundedScrollContainer } from '@components/containers'
import { TextInput as FormInput } from '@components/common/TextInput'

const Details = () => {
  return (
    <RoundedScrollContainer>
      <FormInput
        label={"Customer Type :"}
        placeholder={"Select Customer Type"}
        dropIcon={"menu-down"}
        editable={true}
        // onPress={() => toggleBottomSheet('Employees')}
      />
      <FormInput
        label={"Customer Name"}
        placeholder={"Enter Customer Name"}
        editable={true}
        // onPress={() => toggleBottomSheet('Employees')}
      />
      <FormInput
        label={"Customer Title :"}
        placeholder={"Select Customer Title"}
        dropIcon={"menu-down"}
        editable={true}
        // onPress={() => toggleBottomSheet('Employees')}
      />
      <FormInput
        label={"Email Address :"}
        placeholder={"Enter Customer Name"}
        editable={true}
        // onPress={() => toggleBottomSheet('Employees')}
      />
      <FormInput
        label={"Sales Person :"}
        placeholder={"Select Sales Person"}
        dropIcon={"menu-down"}
        editable={true}
        // onPress={() => toggleBottomSheet('Employees')}
      />
      <FormInput
        label={"Collection Agent :"}
        placeholder={"Enter Collection Agent"}
        editable={true}
        // onPress={() => toggleBottomSheet('Employees')}
      />
      <FormInput
        label={"MOP (Mode Of Payment) :"}
        placeholder={"Select MOP"}
        dropIcon={"menu-down"}
        editable={true}
        // onPress={() => toggleBottomSheet('Employees')}
      />
      <FormInput
        label={"Mobile Number :"}
        placeholder={"Enter Mobile Number"}
        editable={true}
        keyboardType="numeric"
        // onPress={() => toggleBottomSheet('Employees')}
      />
      <FormInput
        label={"Whatsapp Number :"}
        placeholder={"Enter Whatsapp Number"}
        editable={true}
        keyboardType="numeric"
        // onPress={() => toggleBottomSheet('Employees')}
      />
      <FormInput
        label={"Landline Number :"}
        placeholder={"Enter Landline Number"}
        editable={true}
        keyboardType="numeric"
        // onPress={() => toggleBottomSheet('Employees')}
      />
      <FormInput
        label={"Fax :"}
        placeholder={"Enter Fax"}
        editable={true}
        // onPress={() => toggleBottomSheet('Employees')}
      />
    </RoundedScrollContainer>
  )
}

export default Details