import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Share, Platform } from 'react-native';
import { SafeAreaView } from '@components/containers';
import { NavigationHeader } from '@components/Header';
import { Button } from '@components/common/Button';
import { COLORS } from '@constants/theme';
import { Alert } from 'react-native';
import { createInvoiceOdoo, linkInvoiceToPosOrderOdoo, fetchFieldSelectionOdoo, createAccountPaymentOdoo, fetchPaymentJournalsOdoo } from '@api/services/generalApi';
import { useAuthStore } from '@stores/auth';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const POSReceiptScreen = ({ navigation, route }) => {
  const { orderId, products = [], customer, amount, paymentMode, invoiceChecked, totalAmount, invoiceId } = route?.params || {};
  const authUser = useAuthStore((s) => s.user);
  const apiToken = authUser?.api_token || (Array.isArray(authUser?.api_keys) ? authUser.api_keys[0] : null);
  const [loading, setLoading] = useState(false);
  
  const total = totalAmount || products.reduce((s, p) => s + ((p.price || p.price_unit || 0) * (p.quantity || p.qty || 0)), 0);
  const discount = 0; // Add discount logic if needed
  const grandTotal = total - discount;
  const cashReceived = amount || grandTotal;
  const change = cashReceived - grandTotal;
  const totalQty = products.reduce((s, p) => s + (p.quantity || p.qty || 0), 0);

  const handlePrintReceipt = async () => {
    try {
      // Generate HTML for PDF
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              @page {
                size: 58mm auto;
                margin: 0;
              }
              body {
                font-family: 'Courier New', monospace;
                padding: 10px 5px;
                margin: 0;
                width: 58mm;
                color: #000;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header {
                text-align: center;
                margin-bottom: 25px;
              }
              .company-name {
                font-size: 16px;
                font-weight: 900;
                margin-bottom: 6px;
                color: #000;
              }
              .company-arabic {
                font-size: 13px;
                font-weight: bold;
                margin-bottom: 8px;
                color: #000;
              }
              .company-details {
                font-size: 11px;
                font-weight: bold;
                color: #000;
                margin: 3px 0;
              }
              .divider {
                border-bottom: 2px dashed #000;
                margin: 15px 0;
              }
              .divider-thick {
                border-bottom: 3px solid #000;
                margin: 15px 0;
              }
              .invoice-title {
                font-size: 14px;
                font-weight: 900;
                text-align: center;
                margin: 12px 0;
                color: #000;
              }
              .invoice-info {
                font-size: 11px;
                font-weight: bold;
                margin: 6px 0;
                color: #000;
              }
              .products-table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
              }
              .products-table th {
                border-bottom: 2px solid #000;
                padding: 8px 3px;
                font-size: 10px;
                font-weight: 900;
                text-align: center;
                color: #000;
              }
              .products-table td {
                padding: 8px 3px;
                font-size: 10px;
                font-weight: bold;
                color: #000;
                border-bottom: 1px solid #000;
              }
              .product-name {
                text-align: left;
              }
              .product-qty, .product-price, .product-total {
                text-align: right;
              }
              .totals {
                margin: 20px 0;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                margin: 6px 0;
                font-size: 12px;
                font-weight: bold;
                color: #000;
              }
              .grand-total {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                font-size: 14px;
                font-weight: 900;
                color: #000;
              }
              .payment-title {
                font-size: 13px;
                font-weight: 900;
                text-align: center;
                margin: 12px 0;
                text-decoration: underline;
                color: #000;
              }
              .footer {
                text-align: center;
                font-size: 12px;
                font-weight: bold;
                margin-top: 20px;
                color: #000;
              }
              .footer-arabic {
                font-size: 11px;
                font-weight: bold;
                margin-top: 6px;
                color: #000;
              }
            </style>
          </head>
          <body>
            <div style="height:8px"></div>

            <div class="invoice-info" style="text-align: right;">No: ${String(orderId || '000002').padStart(6, '0')}</div>
            <div class="invoice-info">Cashier: Admin</div>

            <table class="products-table">
              <thead>
                <tr>
                  <th class="product-name">Product Name<br/>اسم المنتج</th>
                  <th style="width: 60px;">Qty<br/>كمية</th>
                  <th style="width: 80px;">Unit Price<br/>سعر الوحدة</th>
                  <th style="width: 80px;">Total<br/>المجموع</th>
                </tr>
              </thead>
              <tbody>
                ${products.map((item, idx) => {
                  const qty = item.quantity || item.qty || 1;
                  const price = (item.price_unit || item.price || 0).toFixed(3);
                  const itemTotal = ((item.price_unit || item.price || 0) * qty).toFixed(3);
                  return `
                    <tr>
                      <td class="product-name"><strong>${idx + 1}.</strong> ${item.name || 'Product'}</td>
                      <td class="product-qty">${qty}</td>
                      <td class="product-price">${price}</td>
                      <td class="product-total">${itemTotal}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div class="divider"></div>

            <div class="totals">
              <div class="total-row">
                <span>Subtotal / المجموع الفرعي</span>
                <span>${total.toFixed(3)} ر.ع.</span>
              </div>
              <div class="total-row">
                <span>Discount / خصم:</span>
                <span>${discount.toFixed(3)} ر.ع.</span>
              </div>
            </div>

            <div class="divider-thick"></div>

            <div class="grand-total">
              <span>Grand Total / الإجمالي:</span>
              <span>${grandTotal.toFixed(3)} ر.ع.</span>
            </div>

            <div class="divider-thick"></div>

            <div class="payment-title">Payment Details / تفاصيل الدفع</div>

            <div class="totals">
              <div class="total-row">
                <span>Cash:</span>
                <span>${cashReceived.toFixed(3)} ر.ع.</span>
              </div>
              <div class="total-row">
                <span>Change / الباقي:</span>
                <span>${change.toFixed(3)} ر.ع.</span>
              </div>
            </div>

            <div style="height:8px"></div>
          </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html });
      console.log('PDF generated at:', uri);

      // Share/Save PDF
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF. Make sure expo-print is installed: npx expo install expo-print');
    }
  };

  const handleSaveInvoice = async () => {
    if (!products.length) {
      Alert.alert('No items', 'There are no items to invoice.');
      return;
    }
    setLoading(true);
    try {
      const partnerId = customer?.id || customer?.partner_id || 1;
      
      const invoiceProducts = products.map(it => {
        let productId = it.remoteId || it.id;
        if (typeof productId === 'string') productId = parseInt(productId, 10);
        if (isNaN(productId)) productId = null;
        
        let taxIds = Array.isArray(it.tax_ids) ? it.tax_ids.map(tid => typeof tid === 'string' ? parseInt(tid, 10) : tid).filter(Number.isInteger) : [];
        
        return {
          id: productId,
          name: it.name,
          quantity: Number(it.quantity ?? it.qty ?? 1),
          price_unit: Number(it.price_unit ?? it.price ?? 0),
          tax_ids: taxIds,
        };
      });

      console.log('[INVOICE DEBUG] Payload to Odoo:', { partnerId, products: invoiceProducts });
      
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const invoiceDate = `${yyyy}-${mm}-${dd}`;
      
      const result = await createInvoiceOdoo({ partnerId, products: invoiceProducts, invoiceDate });
      
      if (result && result.id) {
        console.log('✅ Invoice created:', result.id);
        
        // Register payment for the invoice to mark it as paid
        try {
          const journals = await fetchPaymentJournalsOdoo();
          const cashJournal = journals.find(j => j.type === 'cash') || journals.find(j => j.type === 'bank') || journals[0];
          
          if (cashJournal) {
            console.log('💰 Registering payment for invoice with journal:', cashJournal);
            const paymentResult = await createAccountPaymentOdoo({
              partnerId,
              journalId: cashJournal.id,
              amount: grandTotal,
              invoiceId: result.id
            });
            
            if (paymentResult && paymentResult.result) {
              console.log('✅ Payment registered successfully');
            }
          }
        } catch (paymentErr) {
          console.error('Payment registration error:', paymentErr);
        }
        
        setLoading(false);
        Alert.alert('Invoice Created & Paid', `Invoice #${result.id} has been created and marked as paid.`);
        
        // Link invoice to POS order if orderId exists
        if (orderId) {
          try {
            const invoiceState = result?.invoiceStatus?.state;
            let targetState = 'invoiced';
            if (invoiceState === 'posted') {
              const selectionValues = (await fetchFieldSelectionOdoo({ model: 'pos.order', field: 'state' })) || [];
              const available = selectionValues.map(s => s[0]);
              if (available.includes('done')) targetState = 'done';
              else targetState = 'invoiced';
            }
            await linkInvoiceToPosOrderOdoo({ orderId, invoiceId: result.id, setState: true, state: targetState });
          } catch (linkErr) {
            console.warn('[CREATE INVOICE] Failed to link invoice to order:', linkErr);
          }
        }
      } else {
        setLoading(false);
        Alert.alert('Error', 'Failed to save invoice.');
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', err.message || 'Failed to save invoice.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <NavigationHeader title="Receipt" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.receiptBox}>
          <View style={{ height: 8 }} />
          {/* Invoice info removed */}
          
          {/* Product Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 2.5 }]}>Product Name{'\n'}اسم المنتج</Text>
              <Text style={[styles.headerCell, { flex: 0.8 }]}>Qty{'\n'}كمية</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Unit Price{'\n'}سعر الوحدة</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Total{'\n'}المجموع</Text>
            </View>
            
            {products.map((item, idx) => (
              <View key={idx} style={styles.productItem}>
                <Text style={styles.productNumber}>{idx + 1}.</Text>
                <View style={styles.productRow}>
                  <Text style={[styles.productCell, { flex: 2.5 }]}>{item.name || 'Product'}</Text>
                  <Text style={[styles.productCell, { flex: 0.8, textAlign: 'center' }]}>{item.quantity || item.qty || 1}</Text>
                  <Text style={[styles.productCell, { flex: 1, textAlign: 'right' }]}>{(item.price_unit || item.price || 0).toFixed(3)}</Text>
                  <Text style={[styles.productCell, { flex: 1, textAlign: 'right' }]}>{((item.price_unit || item.price || 0) * (item.quantity || item.qty || 1)).toFixed(3)}</Text>
                </View>
              </View>
            ))}
          </View>
          
          <View style={styles.divider} />
          
          {/* Totals */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal / المجموع الفرعي</Text>
            <Text style={styles.totalValue}>{total.toFixed(3)} ر.ع.</Text>
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
          
          <View style={styles.divider} />
        </View>
        
        {/* Create Invoice button removed — showing API token instead */}
        <Button
          title="Pay"
          onPress={() => navigation.navigate('VendingPaymentGateway', { orderId, invoiceId, amount: grandTotal, products, customer })}
          style={{ marginTop: 12, backgroundColor: '#f59e0b' }}
        />
        {loading && <ActivityIndicator style={{ marginTop: 12 }} color="#10b981" />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  receiptBox: { 
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

export default POSReceiptScreen;
