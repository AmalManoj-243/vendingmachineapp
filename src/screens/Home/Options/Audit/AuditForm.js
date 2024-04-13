import { View, StyleSheet } from 'react-native'
import React from 'react'
import { RoundedScrollContainer, SafeAreaView } from '@components/containers'
import { NavigationHeader } from '@components/Header'
import { TextInput as FormInput } from '@components/common/TextInput'
import { COLORS, FONT_FAMILY } from '@constants/theme'
import { Button } from '@components/common/Button'

const AuditForm = ({ navigation }) => {
   // Function to handle scanned data
   const handleScan = (data) => {
    console.log("🚀 ~ handleScan ~ data:", data)
    // setScannedData(data);
  };
  return (
    <SafeAreaView>
      <NavigationHeader
        title="New Transaction Audit"
        onBackPress={() => navigation.goBack()}
      />
      <RoundedScrollContainer  >
        <FormInput label={'Date'} editable={false} />
        <FormInput label={'Branch'} editable={false} />
        <FormInput label={'Collection Type'} placeholder={'Collection Type'} editable={false} />
        <View style={styles.dottedQrBorderContainer}>
          <FormInput label={'Customer'} placeholder={'Scan Customer Name'} editable={false} />
          <FormInput label={'Invoice Number'} placeholder={'Scan Invoice no'} editable={false} />
          <FormInput label={'Total Amount'} editable={false} placeholder={'Scan Total Amount'} />
          <View style={styles.buttonContainer}>
            <Button backgroundColor={COLORS.primaryThemeColor} title={'Scan'} onPress={() => navigation.navigate('Scanner', { onScan: handleScan })} />
          </View>
        </View>
        <FormInput label={'Remarks'} multiline={true} numberOfLines={5} />
        <Button backgroundColor={COLORS.primaryThemeColor} title={'SUBMIT'} />
      </RoundedScrollContainer>
    </SafeAreaView>
  )
}

export default AuditForm

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  dottedQrBorderContainer: {
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.primaryThemeColor,
    borderRadius: 18,
    borderStyle: 'dotted',
    marginTop: 15,
  },
  buttonContainer: {
    marginTop: 10,
    flex: 1,
  },
  qrCodeText: {
    fontFamily: FONT_FAMILY.urbanistSemiBold,
    fontSize: 16,
    color: COLORS.primaryThemeColor,
    flex: 3,
  },
});

