// CheckBox.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Checkbox } from 'react-native-paper';
import Text from '@components/Text';
import { COLORS, FONT_FAMILY } from '@constants/theme';

const CheckBox = ({ label, checked, onPress }) => {
  return (
    <View style={styles.container}>
        <Checkbox
          status={checked ? 'checked' : 'unchecked'}
          onPress={() => onPress(!checked)}
          color={COLORS.primaryThemeColor}
        />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

export default CheckBox;


const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    flex: 1,
    marginVertical: 8,
    fontSize: 14,
    color: '#2e2a4f',
    fontFamily: FONT_FAMILY.urbanistBold,
  },
 
});
