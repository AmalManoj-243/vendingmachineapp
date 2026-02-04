import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { NavigationHeader } from '@components/Header';
import { useProductStore } from '@stores/product';
import { COLORS } from '@constants/theme';
import { createPosOrderOdoo } from '@api/services/generalApi';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from '@components/containers';

const TakeoutDelivery = ({ navigation, route }) => {
  const cart = useProductStore((s) => s.getCurrentCart()) || [];
  const { addProduct, removeProduct, clearProducts } = useProductStore();
  const [creatingOrder, setCreatingOrder] = useState(false);
  
  // map cart to items with qty and price
  const items = useMemo(() => cart.map(it => {
    const qty = Number(it.quantity ?? it.qty ?? 1);
    const unitPrice = Number(it.price_unit ?? it.price ?? 0);
    // If price_subtotal_incl or price_subtotal exists, use it directly (already includes qty)
    // Otherwise calculate: unit_price * qty
    const subtotal = (typeof it.price_subtotal_incl === 'number') 
      ? it.price_subtotal_incl 
      : (typeof it.price_subtotal === 'number') 
        ? it.price_subtotal 
        : (unitPrice * qty);
    
    return {
      id: String(it.id),
      qty,
      name: it.name || (it.product_id && it.product_id[1]) || 'Product',
      unit: unitPrice,
      subtotal,
      rawItem: it
    };
  }), [cart]);

  const total = useMemo(() => items.reduce((s, it) => s + (it.subtotal || (it.unit * it.qty)), 0), [items]);

  const handleIncrement = (item) => {
    const newQty = item.qty + 1;
    addProduct({ ...item.rawItem, quantity: newQty, qty: newQty });
  };

  const handleDecrement = (item) => {
    if (item.qty <= 1) {
      removeProduct(item.id);
    } else {
      const newQty = item.qty - 1;
      addProduct({ ...item.rawItem, quantity: newQty, qty: newQty });
    }
  };

  const handleNewOrder = () => {
    clearProducts();
    navigation.navigate('POSProducts');
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.length === 0) {
      Toast.show({ type: 'error', text1: 'Cart Empty', text2: 'Add products before placing order', position: 'bottom' });
      return;
    }

    setCreatingOrder(true);
    try {
      const lines = cart.map(item => ({
        product_id: item.remoteId || item.id,
        qty: item.quantity || item.qty || 1,
        price_unit: item.price_unit || item.price || 0,
        name: item.name || 'Product'
      }));

      const sessionId = route?.params?.sessionId;
      const posConfigId = route?.params?.registerId;
      const partnerId = null; // or get from route params if customer is selected

      console.log('[Place Order] Creating order with:', { lines, sessionId, posConfigId, partnerId });

      // Don't pass preset_id - let Odoo use default or omit if optional
      const resp = await createPosOrderOdoo({ 
        partnerId, 
        lines, 
        sessionId, 
        posConfigId
      });

      console.log('[Place Order] Response:', resp);

      if (resp && resp.error) {
        Toast.show({ 
          type: 'error', 
          text1: 'Order Error', 
          text2: resp.error.message || JSON.stringify(resp.error) || 'Failed to create order', 
          position: 'bottom' 
        });
        return;
      }

      const orderId = resp && resp.result ? resp.result : null;
      if (!orderId) {
        Toast.show({ type: 'error', text1: 'Order Error', text2: 'No order ID returned', position: 'bottom' });
        return;
      }

      Toast.show({ 
        type: 'success', 
        text1: 'Order Created', 
        text2: `Order ID: ${orderId}`, 
        position: 'bottom' 
      });

      // Navigate to payment or clear cart
      navigation.navigate('POSPayment', { 
        orderId, 
        sessionId, 
        registerId: posConfigId,
        totalAmount: total,
        products: cart
      });
    } catch (error) {
      console.error('[Place Order] Error:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Order Error', 
        text2: error?.message || 'Failed to create order', 
        position: 'bottom' 
      });
    } finally {
      setCreatingOrder(false);
    }
  };

  const renderLine = ({ item }) => (
    <View style={{ flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <Image 
          source={{ uri: item.rawItem?.image_url || item.rawItem?.image_128 || 'https://via.placeholder.com/60' }}
          style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: '#f5f5f5' }}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{item.name}</Text>
          <Text style={{ fontSize: 14, color: '#666' }}>${item.unit.toFixed(2)} each</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 8 }}>
          <TouchableOpacity onPress={() => handleDecrement(item)} style={{ padding: 8, paddingHorizontal: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>-</Text>
          </TouchableOpacity>
          <Text style={{ fontWeight: '700', paddingHorizontal: 8 }}>{item.qty}</Text>
          <TouchableOpacity onPress={() => handleIncrement(item)} style={{ padding: 8, paddingHorizontal: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={{ fontWeight: '800', marginLeft: 12 }}>${(item.subtotal || (item.unit * item.qty)).toFixed(2)}</Text>
    </View>
  );

  return (
    <SafeAreaView backgroundColor={'#fff'}>
      <NavigationHeader title="Register" onBackPress={() => navigation.goBack()} />
      <View style={{ flex: 1 }}>
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          renderItem={renderLine}
          ListEmptyComponent={<View style={{ padding: 24 }}><Text style={{ color: '#666' }}>No items</Text></View>}
          contentContainerStyle={{ paddingBottom: 200 }}
        />

        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '800' }}>Total</Text>
            <Text style={{ fontSize: 20, fontWeight: '900' }}>${total.toFixed(2)}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap', marginBottom: 12 }}>
            <TouchableOpacity style={{ backgroundColor: '#f3f4f6', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginRight: 8, marginBottom: 8 }}>
              <Text style={{ fontWeight: '800', color: '#6b21a8' }}>{route?.params?.userName || 'John Doe'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: '#f3f4f6', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginRight: 8, marginBottom: 8 }}>
              <Text style={{ fontWeight: '800', color: '#111' }}>Note</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('POSProducts', { sessionId: route?.params?.sessionId, registerId: route?.params?.registerId })} 
              style={{ 
                backgroundColor: '#10b981', 
                paddingVertical: 12, 
                paddingHorizontal: 20, 
                borderRadius: 10, 
                marginRight: 8, 
                marginBottom: 8,
                shadowColor: '#10b981',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6
              }}>
              <Text style={{ fontWeight: '900', color: '#fff', fontSize: 16 }}>➕ Add Products</Text>
            </TouchableOpacity>
            {/* preset button removed for ice cream shop (no Takeaway preset) */}
            {/* Course button removed for ice cream shop */}
            <TouchableOpacity style={{ backgroundColor: '#f3f4f6', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginRight: 8, marginBottom: 8 }}>
              <Text style={{ fontWeight: '800' }}>⋮</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={handleNewOrder} style={{ flex: 1, backgroundColor: '#f3f4f6', paddingVertical: 18, borderRadius: 8, marginRight: 8, alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', fontSize: 18 }}>New</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, flexDirection: 'column' }}>
              <TouchableOpacity 
                onPress={handlePlaceOrder} 
                disabled={creatingOrder}
                style={{ backgroundColor: '#10b981', paddingVertical: 18, borderRadius: 8, alignItems: 'center', opacity: creatingOrder ? 0.6 : 1 }}>
                {creatingOrder ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ fontWeight: '800', fontSize: 18, color: '#fff' }}>Place Order</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TakeoutDelivery;
