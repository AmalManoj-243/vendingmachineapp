import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { NavigationHeader } from '@components/Header';

const CreateInvoicePreview = ({ navigation, route }) => {
  const { items = [], subtotal = 0, tax = 0, service = 0, total = 0, orderId } = route?.params || {};
  
  const discount = 0; // Add discount logic if needed
  const grandTotal = total - discount;
  const totalQty = items.reduce((sum, item) => sum + (item.qty || item.quantity || 0), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <NavigationHeader title="Invoice Preview" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.invoiceBox}>
          <View style={{ height: 8 }} />
          
          {/* Invoice Info */}
          <Text style={styles.invoiceNo}>No: {String(orderId || '000002').padStart(6, '0')}</Text>
          <Text style={styles.cashier}>Cashier: Admin</Text>
          
          {/* Product Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 2.5 }]}>Product Name{'\n'}اسم المنتج</Text>
              <Text style={[styles.headerCell, { flex: 0.8 }]}>Qty{'\n'}كمية</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Unit Price{'\n'}سعر الوحدة</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Total{'\n'}المجموع</Text>
            </View>
            
            {items.map((item, idx) => {
              const itemQty = item.qty || item.quantity || 1;
              const itemPrice = item.price || item.unit || item.price_unit || 0;
              const itemTotal = item.subtotal || (itemPrice * itemQty);
              
              return (
                <View key={idx} style={styles.productItem}>
                  <Text style={styles.productNumber}>{idx + 1}.</Text>
                  <View style={styles.productRow}>
                    <Text style={[styles.productCell, { flex: 2.5 }]}>{item.name || 'Product'}</Text>
                    <Text style={[styles.productCell, { flex: 0.8, textAlign: 'center' }]}>{itemQty}</Text>
                    <Text style={[styles.productCell, { flex: 1, textAlign: 'right' }]}>{itemPrice.toFixed(3)}</Text>
                    <Text style={[styles.productCell, { flex: 1, textAlign: 'right' }]}>{itemTotal.toFixed(3)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
          
          <View style={styles.divider} />
          
          {/* Totals */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal / المجموع الفرعي</Text>
            <Text style={styles.totalValue}>{Number(subtotal || total).toFixed(3)} ر.ع.</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount / خصم:</Text>
            <Text style={styles.totalValue}>{discount.toFixed(3)} ر.ع.</Text>
          </View>
          
          <View style={styles.dividerThick} />
          
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total / الإجمالي:</Text>
            <Text style={styles.grandTotalValue}>{grandTotal.toFixed(3)} ر.ع.</Text>
          </View>
          
          <View style={styles.dividerThick} />
          
          {/* Payment Details */}
          <Text style={styles.paymentTitle}>Payment Details / تفاصيل الدفع</Text>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Cash:</Text>
            <Text style={styles.paymentValue}>{grandTotal.toFixed(3)} ر.ع.</Text>
          </View>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Change / الباقي:</Text>
            <Text style={styles.paymentValue}>0.000 ر.ع.</Text>
          </View>
          
          <View style={styles.divider} />
        </View>

        <View style={{ marginTop: 16 }}>
          <TouchableOpacity 
            onPress={() => console.log('Print invoice')} 
            style={{ backgroundColor: '#111827', paddingVertical: 14, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>Print / Share Invoice</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  invoiceBox: { 
    backgroundColor: '#fff', 
    borderRadius: 4,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  companyArabic: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  companyDetails: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 2,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 8,
  },
  dividerThick: {
    height: 2,
    backgroundColor: '#000',
    marginVertical: 10,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  invoiceNo: {
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 4,
  },
  cashier: {
    fontSize: 13,
    textAlign: 'left',
    marginBottom: 8,
  },
  tableContainer: {
    marginTop: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 6,
    marginBottom: 8,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productItem: {
    marginBottom: 12,
  },
  productNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productCell: {
    fontSize: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 13,
  },
  totalValue: {
    fontSize: 13,
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
    textDecorationLine: 'underline',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  paymentLabel: {
    fontSize: 13,
  },
  paymentValue: {
    fontSize: 13,
    textAlign: 'right',
  },
  totalQtyText: {
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 6,
  },
  footer: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  footerArabic: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default CreateInvoicePreview;
