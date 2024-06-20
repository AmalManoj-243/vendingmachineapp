import React from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Image, StyleSheet, Platform } from 'react-native';
import { RoundedScrollContainer, SafeAreaView } from '@components/containers';
import { NavigationHeader } from '@components/Header';
import { DetailField } from '@components/common/Detail';
import { Button } from '@components/common/Button';
import { useProductStore } from '@stores/product';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { EmptyState } from '@components/common/empty';
import { COLORS } from '@constants/theme';
import styles from './styles';

const CustomerDetails = ({ navigation, route }) => {
  const { details } = route?.params || {};
  const products = useProductStore(state => state.products);
  const removeProduct = useProductStore(state => state.removeProduct);
  const addProduct = useProductStore(state => state.addProduct);

  const handleDelete = (productId) => {
    removeProduct(productId);
  };

  const handleQuantityChange = (productId, quantity) => {
    const updatedQuantity = Math.max(0, isNaN(parseInt(quantity)) ? 0 : parseInt(quantity));
    const product = products.find(p => p.id === productId);
    addProduct({ ...product, quantity: updatedQuantity });
  };

  const handlePriceChange = (productId, price) => {
    const updatedPrice = isNaN(parseFloat(price)) ? 0 : parseFloat(price);
    const product = products.find(p => p.id === productId);
    addProduct({ ...product, price: updatedPrice });
  };

  // Calculate amounts
  const calculateAmounts = () => {
    let untaxedAmount = 0;
    let totalQuantity = 0;

    products.forEach(product => {
      untaxedAmount += product.price * product.quantity;
      totalQuantity += product.quantity;
    });

    const taxRate = 0.05;
    const taxedAmount = untaxedAmount * taxRate;
    const totalAmount = untaxedAmount + taxedAmount;

    return { untaxedAmount, taxedAmount, totalAmount, totalQuantity };
  };

  const { untaxedAmount, taxedAmount, totalAmount, totalQuantity } = calculateAmounts();
  // console.log("🚀 ~ CustomerDetails ~ totalQuantity:", totalQuantity)

  const renderItem = ({ item }) => (
    <View style={styles.productContainer}>
      <View style={styles.row}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        </View>
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item?.name?.trim()}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={() => handleQuantityChange(item.id, item.quantity - 1)}>
              <AntDesign name="minus" size={20} color="black" />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Quantity"
              value={item.quantity.toString()}
              onChangeText={(text) => handleQuantityChange(item.id, text)}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={() => handleQuantityChange(item.id, item.quantity + 1)}>
              <AntDesign name="plus" size={20} color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Price"
              value={item.price.toString()}
              onChangeText={(text) => handlePriceChange(item.id, text)}
              keyboardType="numeric"
            />
            <Text style={styles.aedLabel}>AED</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>
    </View>
  );
  return (
    <SafeAreaView>
      <NavigationHeader title="Order Summary" onBackPress={() => navigation.goBack()} />
      <RoundedScrollContainer>
        <TouchableOpacity style={styles.itemContainer} activeOpacity={0.7}>
          <DetailField label="Customer Name" value={details.name} multiline={true} />
          <DetailField label="MOB" value={details.customer_mobile} />
        </TouchableOpacity>
        <Button
          title="Add Product(s)"
          width="50%"
          alignSelf="flex-end"
          marginTop={10}
          onPress={() => navigation.navigate('Products', { fromCustomerDetails: details })}
        />
        {products.length === 0 ? (
          <EmptyState imageSource={require('@assets/images/EmptyData/empty_cart.png')} message="Items are empty" />
        ) : (
          <View style={styles.itemContainer}>
            <Text style={styles.totalItemsText}>Total {products.length} item{products.length !== 1 ? 's' : ''}</Text>
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
            />
            {products.length > 0 && (
              <View style={styles.footerContainer}>
                <View style={styles.totalPriceContainer}>
                  <View style={styles.footerRow}>
                    <Text style={styles.footerLabel}>Untaxed Amount:</Text>
                    <Text style={styles.footerLabel}>{untaxedAmount.toFixed(2)} AED</Text>
                  </View>
                  <View style={styles.footerRow}>
                    <Text style={styles.footerLabel}>Taxed Amount:</Text>
                    <Text style={styles.footerLabel}>{taxedAmount.toFixed(2)} AED</Text>
                  </View>
                  <View style={styles.footerRow}>
                    <Text style={styles.totalPriceLabel}>Total Amount:</Text>
                    <Text style={styles.totalPriceLabel}>{totalAmount.toFixed(2)} AED</Text>
                  </View>
                </View>
                <Button backgroundColor={COLORS.primaryThemeColor} title={'Place Order'} />
              </View>
            )}
          </View>
        )}
      </RoundedScrollContainer>
    </SafeAreaView>
  );
};

export default CustomerDetails;
