import React from 'react';
import { View } from 'react-native';

const ButtonContainer = ({ children }) => {
  return (
    <View style={{ marginHorizontal: '25%', marginVertical: 20 }}>
      {children}
    </View>
  );
};

export default ButtonContainer;
