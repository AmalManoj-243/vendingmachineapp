import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@stores/auth';
import { DEFAULT_ODOO_DB, DEFAULT_ODOO_BASE_URL } from '@api/config/odooConfig';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  ActivityIndicator,
  Dimensions,
  Linking,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Determine if device is tablet or mobile
const isTablet = width >= 768;
const isMobile = width < 768;

// UPI App configurations
const UPI_APPS = [
  {
    id: 'gpay',
    name: 'Google Pay',
    icon: require('../../../../../assets/icons/modal/google-pay-logo-transparent-free-png.png'),
    packageName: 'com.google.android.apps.nbu.paisa.user',
    urlScheme: 'gpay://',
    color: '#4285F4',
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    icon: require('../../../../../assets/icons/modal/phonepe.png'),
    packageName: 'com.phonepe.app',
    urlScheme: 'phonepe://',
    color: '#5F259F',
  },
  {
    id: 'bhim',
    name: 'BHIM',
    icon: require('../../../../../assets/icons/modal/bhim.png'),
    packageName: 'in.org.npci.upiapp',
    urlScheme: 'bhim://',
    color: '#00BFA5',
  },
  {
    id: 'paytm',
    name: 'PAYTM',
    icon: require('../../../../../assets/icons/modal/paytm.png'),
    packageName: 'net.one97.paytm',
    urlScheme: 'paytm://',
    color: '#00BAF2',
  },
  {
    id: 'amazonpay',
    name: 'Amazon Pay',
    icon: require('../../../../../assets/icons/modal/ampay.png'),
    packageName: 'in.amazon.mShop.android.shopping',
    urlScheme: 'amazonpay://',
    color: '#FF9900',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: require('../../../../../assets/icons/modal/wppay.png'),
    packageName: 'com.whatsapp',
    urlScheme: 'whatsapp://',
    color: '#25D366',
  },
];

// Custom Icon Components
const StoreIcon = () => (
  <View style={styles.storeIconContainer}>
    <View style={styles.storeIconRoof} />
    <View style={styles.storeIconBody}>
      <View style={styles.storeIconDoor} />
    </View>
  </View>
);

const BackIcon = () => (
  <View style={styles.backIconContainer}>
    <View style={styles.backIconArrow} />
  </View>
);

const CloseIcon = () => (
  <Text style={styles.closeIconText}>×</Text>
);

const CheckIcon = () => (
  <View style={styles.checkIconContainer}>
    <Text style={styles.checkIconText}>✓</Text>
  </View>
);

const FailIcon = () => (
  <View style={styles.failIconContainer}>
    <Text style={styles.failIconText}>✕</Text>
  </View>
);

// QR Code Component
const QRCodeDisplay = ({ value, size = 150 }) => {
  const generateQRPattern = () => {
    const cells = [];
    const cellCount = 21;
    const cellSize = size / cellCount;
    
    const seed = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    for (let row = 0; row < cellCount; row++) {
      for (let col = 0; col < cellCount; col++) {
        const isTopLeftCorner = row < 7 && col < 7;
        const isTopRightCorner = row < 7 && col >= cellCount - 7;
        const isBottomLeftCorner = row >= cellCount - 7 && col < 7;
        
        let isFilled = false;
        
        if (isTopLeftCorner || isTopRightCorner || isBottomLeftCorner) {
          const localRow = row >= cellCount - 7 ? row - (cellCount - 7) : row;
          const localCol = col >= cellCount - 7 ? col - (cellCount - 7) : col;
          
          if (localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6) {
            isFilled = true;
          } else if (localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4) {
            isFilled = true;
          }
        } else {
          isFilled = ((seed * (row + 1) * (col + 1)) % 3) === 0;
        }
        
        if (isFilled) {
          cells.push(
            <View
              key={`${row}-${col}`}
              style={{
                position: 'absolute',
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize,
                height: cellSize,
                backgroundColor: '#000',
              }}
            />
          );
        }
      }
    }
    return cells;
  };

  return (
    <View style={[styles.qrCodeContainer, { width: size, height: size }]}>
      <View style={[styles.qrCodeInner, { width: size, height: size }]}>
        {generateQRPattern()}
      </View>
    </View>
  );
};

// Main Payment Screen Component
const PaymentScreen = (props) => {
  const { route = {}, navigation } = props;
  const params = route.params || {};

  const initialAmount = props.amount ?? params.amount ?? 1799;
  const initialInvoice = props.invoiceNumber ?? params.invoiceNumber ?? null;
  const initialInvoiceId = props.invoiceId ?? params.invoiceId ?? null;
  const merchantName = props.merchantName ?? 'Merchant Store';
  const merchantUpiId = props.merchantUpiId ?? 'merchant@upi';
  const onPaymentSuccess = props.onPaymentSuccess;
  const onPaymentFailure = props.onPaymentFailure;
  const onBack = props.onBack ?? (() => navigation?.goBack?.());
  const testModeApiEndpoint = props.testModeApiEndpoint ?? 'https://api.example.com/test-payment';
  const qrGenerateApiEndpoint = props.qrGenerateApiEndpoint ?? 'https://api.example.com/generate-qr';

  // State Management
  const [amount, setAmount] = useState(initialAmount);
  const [invoiceNumber, setInvoiceNumber] = useState(initialInvoice || `INV11_${Date.now()}`);
  const [invoiceId, setInvoiceId] = useState(initialInvoiceId || null);
  const authUser = useAuthStore((s) => s.user);
  const apiToken = authUser?.api_token || (Array.isArray(authUser?.api_keys) ? authUser.api_keys[0] : null);
  const [qrData, setQrData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [showGetButton, setShowGetButton] = useState(false);
  const [isGetLoading, setIsGetLoading] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    if (!initialInvoice) {
      const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
      setInvoiceNumber(`INV11_${timestamp}`);
    }
  }, []);

  const generateQRCode = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(qrGenerateApiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          invoice_number: invoiceNumber,
          merchant_upi_id: merchantUpiId,
          merchant_name: merchantName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQrData(data.qr_string || generateUPIString());
      } else {
        setQrData(generateUPIString());
      }
    } catch (error) {
      console.log('QR API Error, using fallback:', error);
      setQrData(generateUPIString());
    } finally {
      setIsLoading(false);
    }
  }, [amount, invoiceNumber, merchantUpiId, merchantName]);

  const generateUPIString = () => {
    const upiString = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${invoiceNumber}&cu=INR`;
    return upiString;
  };

  const handleTestMode = async () => {
    setIsTestMode(true);
    setIsLoading(true);
    
    try {
      const response = await fetch(testModeApiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          invoice_number: invoiceNumber,
          test_mode: true,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setTransactionId(data.transaction_id || `TXN${Date.now()}`);
        setPaymentStatus('success');
        setShowSuccessModal(true);
        onPaymentSuccess?.({
          amount,
          invoiceNumber,
          transactionId: data.transaction_id,
          status: 'success',
        });
      } else {
        setPaymentStatus('failed');
        setShowFailureModal(true);
        onPaymentFailure?.({
          amount,
          invoiceNumber,
          error: data.error || 'Payment failed',
          status: 'failed',
        });
      }
    } catch (error) {
      console.log('Test Mode API Error:', error);
      setPaymentStatus('failed');
      setShowFailureModal(true);
      onPaymentFailure?.({
        amount,
        invoiceNumber,
        error: error.message || 'Network error',
        status: 'failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUPIPayment = async (app) => {
    const upiString = qrData || generateUPIString();

    let paymentUrl = upiString;

    if (app.id === 'gpay') {
      paymentUrl = `tez://upi/pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${invoiceNumber}&cu=INR`;
    } else if (app.id === 'phonepe') {
      paymentUrl = `phonepe://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${invoiceNumber}&cu=INR`;
    } else if (app.id === 'paytm') {
      paymentUrl = `paytmmp://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${invoiceNumber}&cu=INR`;
    }

    try {
      const canOpen = await Linking.canOpenURL(paymentUrl);
      if (canOpen) {
        await Linking.openURL(paymentUrl);
        return true;
      }

      const genericUPI = generateUPIString();
      const canOpenGeneric = await Linking.canOpenURL(genericUPI);
      if (canOpenGeneric) {
        await Linking.openURL(genericUPI);
        return true;
      }

      console.warn(`${app.name} not available and no UPI handler found.`);
      return false;
    } catch (error) {
      console.warn('UPI launch error', error);
      return false;
    }
  };

  const handleStartUPI = async (app) => {
    try {
      setShowGetButton(false);
      setIsLoading(true);
      await handleUPIPayment(app);

      setTimeout(() => {
        setIsLoading(false);
        setShowGetButton(true);
      }, 2500);
    } catch (err) {
      console.warn('handleStartUPI error', err);
      setTimeout(() => {
        setIsLoading(false);
        setShowGetButton(true);
      }, 2500);
    }
  };

  const formatAmount = (value) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const renderUPIApp = (app) => {
    const largeIds = ['gpay','paytm','phonepe','bhim','amazonpay','whatsapp'];
    const isLarge = largeIds.includes(app.id);
    const isAmazon = app.id === 'amazonpay';
    const isGpay = app.id === 'gpay';
    const imageSource = typeof app.icon === 'number' || (app.icon && typeof app.icon === 'object') ? app.icon : { uri: app.icon };
    
    // Responsive sizing
    const iconSize = isMobile ? (isLarge ? 60 : 40) : (isLarge ? 88 : 48);
    const containerSize = isMobile ? (isLarge ? 68 : 48) : (isLarge ? 96 : 48);
    
    const containerStyle = isLarge ? 
      { ...styles.upiAppIconContainerLarge, width: containerSize, height: containerSize, borderRadius: containerSize / 2 } : 
      { ...styles.upiAppIconContainer, width: containerSize, height: containerSize, borderRadius: containerSize / 2 };
    
    const containerStyleFinal = isAmazon ? 
      { ...styles.upiAppIconContainerAmazon, width: containerSize - 8, height: containerSize - 8, borderRadius: (containerSize - 8) / 2 } : 
      (isGpay ? { ...styles.upiAppIconContainerLarge, width: containerSize, height: containerSize, borderRadius: containerSize / 2 } : containerStyle);
    
    const containerOverride = app.id === 'phonepe' ? { backgroundColor: '#FFFFFF' } : {};
    const imageStyle = isGpay ? 
      { ...styles.upiAppIconGpay, width: iconSize, height: iconSize } : 
      (isAmazon ? { ...styles.upiAppIconAmazon, width: iconSize - 8, height: iconSize - 8 } : 
      (isLarge ? { ...styles.upiAppIconLarge, width: iconSize, height: iconSize } : 
      { ...styles.upiAppIcon, width: iconSize * 0.6, height: iconSize * 0.6 }));

    return (
      <TouchableOpacity
        key={app.id}
        style={styles.upiAppButton}
        onPress={() => handleStartUPI(app)}
        activeOpacity={0.7}
      >
        <View style={[containerStyleFinal, containerOverride, { marginBottom: isMobile ? 4 : 8 }]}>
          <Image
            source={imageSource}
            style={imageStyle}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.upiAppName, isMobile && { fontSize: 10 }]}>{app.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderSuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSuccessModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.successIconWrapper}>
            <CheckIcon />
          </View>
          <Text style={styles.modalTitle}>Payment Successful!</Text>
          <Text style={styles.modalAmount}>{formatAmount(amount)}</Text>
          <View style={styles.modalDetails}>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Transaction ID</Text>
              <Text style={styles.modalDetailValue}>{transactionId}</Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Invoice Number</Text>
              <Text style={styles.modalDetailValue}>{invoiceNumber}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setShowSuccessModal(false);
              onBack?.();
            }}
          >
            <Text style={styles.modalButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderFailureModal = () => (
    <Modal
      visible={showFailureModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFailureModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.failIconWrapper}>
            <FailIcon />
          </View>
          <Text style={styles.modalTitle}>Payment Failed</Text>
          <Text style={styles.modalSubtitle}>
            Your payment could not be processed. Please try again.
          </Text>
          <View style={styles.modalDetails}>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Amount</Text>
              <Text style={styles.modalDetailValue}>{formatAmount(amount)}</Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Invoice Number</Text>
              <Text style={styles.modalDetailValue}>{invoiceNumber}</Text>
            </View>
          </View>
          <View style={styles.modalButtonGroup}>
            <TouchableOpacity
              style={[styles.modalButton, styles.retryButton]}
              onPress={() => {
                setShowFailureModal(false);
                handleTestMode();
              }}
            >
              <Text style={styles.modalButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowFailureModal(false);
                onBack?.();
              }}
            >
              <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderLoadingOverlay = () => (
    <Modal visible={isLoading} transparent animationType="fade">
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      </View>
    </Modal>
  );

  // Left Panel Content (reusable for both layouts)
  const renderLeftPanelContent = () => (
    <>
      <View style={styles.amountSection}>
        <Text style={styles.totalPayableLabel}>Total Payable</Text>
        <TouchableOpacity style={styles.amountContainer}>
          <Text style={styles.amountText}>{formatAmount(amount)}</Text>
          <Text style={styles.amountDropdown}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.secureCheckout}>
        <View style={styles.payuLogo}>
          <Text style={styles.payuText}>pay</Text>
          <View style={styles.payuU}>
            <Text style={styles.payuUText}>U</Text>
          </View>
        </View>
        <Text style={styles.secureText}>Secure Checkout</Text>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedIcon}>✓</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.showInvoicesButton}
        onPress={() => {
          if (typeof onShowInvoices === 'function') {
            onShowInvoices();
          } else {
            Alert.alert('Invoices', 'Show invoices');
          }
        }}
      >
        <Text style={styles.showInvoicesButtonText}>Show Invoices</Text>
      </TouchableOpacity>

      {apiToken && (
        <View style={[styles.transactionInfo, { marginTop: 8 }]}>
          <Text style={styles.transactionLabel}>API Token:</Text>
          <View style={styles.tokenBox}>
            <Text style={styles.tokenText} numberOfLines={1} ellipsizeMode="middle">{apiToken}</Text>
          </View>
        </View>
      )}
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionLabel}>Transaction Id:</Text>
        <View style={styles.invoiceBox}>
          <Text style={styles.invoiceText}>{invoiceNumber}</Text>
        </View>
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionLabel}>Invoice Id:</Text>
        <View style={styles.invoiceBox}>
          <Text style={styles.invoiceText}>{invoiceId || '—'}</Text>
        </View>
      </View>
    </>
  );

  // Right Panel Header
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.testModeLabel}>Test Mode</Text>
      
      <TouchableOpacity
        style={styles.testModeButton}
        onPress={handleTestMode}
      >
        <View style={styles.testModeIcon}>
          <Text style={styles.testModeIconText}>⊕</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Payment options content
  const renderPaymentContent = () => (
    <>
      {/* BHIM UPI Section */}
      <View style={styles.bhimHeader}>
        <Image source={require('../../../../../assets/icons/modal/Bhim-logo.png')} style={styles.bhimLogoImg} resizeMode="contain" />
        <View style={styles.upiLogoContainer}>
          <Image source={require('../../../../../assets/icons/modal/upi.png')} style={styles.upiLogoImg} resizeMode="contain" />
        </View>
      </View>

      {/* QR Code Section */}
      <View style={styles.qrSection}>
        <Text style={styles.qrTitle}>SCAN QR & PAY</Text>
        <View style={[styles.qrContent, isMobile && { flexDirection: 'column', alignItems: 'center' }]}>
          <View style={[styles.qrInfo, isMobile && { paddingRight: 0, marginBottom: 12, alignItems: 'center' }]}>
            <Text style={[styles.qrInfoTitle, isMobile && { textAlign: 'center', fontSize: 14 }]}>Pay instantly by QR code</Text>
            <Text style={[styles.qrInfoSubtitle, isMobile && { textAlign: 'center', fontSize: 11 }]}>Scan & Pay using your preferred UPI App</Text>
            <View style={styles.upiPoweredBy}>
              <Text style={styles.poweredByText}>POWERED BY</Text>
              <View style={styles.upiSmallLogo}>
                <Image
                  source={require('../../../../../assets/icons/modal/360_F_560501607_x7crxqBWbmbgK2k8zOL0gICbIbK9hP6y.png')}
                  style={styles.upiSmallLogoImg}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          <View style={styles.qrCodeWrapper}>
            <Image
              source={require('../../../../../assets/icons/modal/Qr-Code-Transparent-PNG.png')}
              style={[styles.qrStaticImg, isMobile && { width: 100, height: 100 }]}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* UPI Apps Header */}
      <View style={styles.upiAppsSection}>
        <View style={styles.upiAppsHeader}>
          <View style={styles.upiLogoSmall}><Text style={styles.upiLogoText}>UPI</Text></View>
          <Text style={[styles.upiAppsTitle, isMobile && { fontSize: 10 }]}>PAY USING ANY UPI APP</Text>
        </View>
      </View>

      {/* UPI Apps Grid */}
      <View style={styles.upiAppsGrid}>
        {UPI_APPS.map(app => renderUPIApp(app))}
      </View>

      {/* Partners Section */}
      <View style={styles.partnersSection}>
        <View style={styles.partnerLogos}>
          <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png' }} style={styles.partnerLogo} resizeMode="contain" />
          <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png' }} style={styles.partnerLogo} resizeMode="contain" />
          <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/RuPay.svg/200px-RuPay.svg.png' }} style={styles.partnerLogo} resizeMode="contain" />
        </View>
        {showGetButton && (
          <TouchableOpacity
            style={[styles.getButton, isGetLoading ? styles.getButtonDisabled : null]}
            onPress={async () => {
              if (isGetLoading) return;
              const handle = async () => {
                setIsGetLoading(true);
                try {
                  const db = DEFAULT_ODOO_DB;
                  const token = apiToken;
                  const invoice_id = invoiceId || '';
                  if (!token || !invoice_id) {
                    Alert.alert('Error', 'Missing token or invoice id');
                    return;
                  }
                  const reqPayload = { db, token, invoice_id };
                  console.log('[GET API] Request:', JSON.stringify(reqPayload, null, 2));
                  const response = await fetch(`${DEFAULT_ODOO_BASE_URL}api/vending/process`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reqPayload),
                  });
                  const respText = await response.text();
                  let data;
                  try {
                    data = JSON.parse(respText);
                  } catch (e) {
                    data = respText;
                  }
                  console.log('[GET API] Response:', typeof data === 'string' ? data : JSON.stringify(data, null, 2));
                  if (Array.isArray(data) && data.length && data[0].product_id) {
                    setProductImages(data);
                    setShowProductModal(true);
                    setTimeout(() => {
                      setShowProductModal(false);
                      try { navigation.navigate('Home'); } catch (e) { console.warn('Navigation to Home failed', e); }
                    }, 2500);
                  } else {
                    console.log('[GET API] Non-array response:', typeof data === 'string' ? data : JSON.stringify(data, null, 2));
                    try { navigation.navigate('Home'); } catch (e) { console.warn('Navigation to Home failed', e); }
                  }
                } catch (err) {
                  console.error('[GET API] Error:', err.message || err);
                  try { navigation.navigate('Home'); } catch (e) { console.warn('Navigation to Home failed', e); }
                } finally {
                  setIsGetLoading(false);
                }
              };
              handle();
            }}
            activeOpacity={0.8}
          >
            <View style={styles.getButtonInner}>
              <View style={styles.getButtonIcon}>
                <Text style={styles.getButtonIconText}>⇣</Text>
              </View>
              {isGetLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginLeft: 10 }} />
              ) : (
                <Text style={styles.getButtonText}>Get</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  // Render tablet layout (side by side)
  if (isTablet) {
    return (
      <View style={styles.container}>
        {/* Left Panel */}
        <View style={styles.leftPanel}>
          {renderLeftPanelContent()}
        </View>

        {/* Right Panel */}
        <View style={styles.rightPanel}>
          {renderHeader()}
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderPaymentContent()}
          </ScrollView>
        </View>

        {/* Modals */}
        {renderSuccessModal()}
        {renderFailureModal()}
        {renderLoadingOverlay()}
        {showProductModal && (
          <Modal
            visible={showProductModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowProductModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { width: '80%', paddingVertical: 16 }]}>
                <Text style={styles.modalTitle}>Dispensed</Text>
                <View style={{ maxHeight: 180, marginVertical: 8 }}>
                  {productImages && productImages.length > 0 ? (
                    productImages.map((it, idx) => (
                      <View key={idx} style={{ paddingVertical: 6 }}>
                        <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600' }}>{it.product_name || it.name || `Product ${it.product_id || idx}`}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{ textAlign: 'center' }}>No products</Text>
                  )}
                </View>
              </View>
            </View>
          </Modal>
        )}
        {isGetLoading && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContent}>
                <ActivityIndicator size="large" color="#FF6B00" />
                <Text style={styles.loadingText}>Dispensing...</Text>
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  }

  // Render mobile layout (stacked)
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.mobileContainer}
        contentContainerStyle={styles.mobileScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mobile Header with amount */}
        <View style={styles.mobileHeader}>
          {renderHeader()}
          <View style={styles.mobileAmountSection}>
            <Text style={styles.totalPayableLabel}>Total Payable</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.amountText}>{formatAmount(amount)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Content */}
        <View style={styles.mobilePaymentSection}>
          {renderPaymentContent()}
        </View>

        {/* Transaction Info - Bottom */}
        <View style={styles.mobileInfoSection}>
          <View style={styles.secureCheckout}>
            <View style={styles.payuLogo}>
              <Text style={styles.payuText}>pay</Text>
              <View style={styles.payuU}>
                <Text style={styles.payuUText}>U</Text>
              </View>
            </View>
            <Text style={styles.secureText}>Secure Checkout</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.showInvoicesButton}
            onPress={() => {
              if (typeof onShowInvoices === 'function') {
                onShowInvoices();
              } else {
                Alert.alert('Invoices', 'Show invoices');
              }
            }}
          >
            <Text style={styles.showInvoicesButtonText}>Show Invoices</Text>
          </TouchableOpacity>

          {apiToken && (
            <View style={[styles.transactionInfo, { marginTop: 8 }]}>
              <Text style={styles.transactionLabel}>API Token:</Text>
              <View style={styles.tokenBox}>
                <Text style={styles.tokenText} numberOfLines={1} ellipsizeMode="middle">{apiToken}</Text>
              </View>
            </View>
          )}
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionLabel}>Transaction Id:</Text>
            <View style={styles.invoiceBox}>
              <Text style={styles.invoiceText}>{invoiceNumber}</Text>
            </View>
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionLabel}>Invoice Id:</Text>
            <View style={styles.invoiceBox}>
              <Text style={styles.invoiceText}>{invoiceId || '—'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      {renderSuccessModal()}
      {renderFailureModal()}
      {renderLoadingOverlay()}
      {showProductModal && (
        <Modal
          visible={showProductModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowProductModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { width: '90%', paddingVertical: 16 }]}>
              <Text style={styles.modalTitle}>Dispensed</Text>
              <View style={{ maxHeight: 180, marginVertical: 8 }}>
                {productImages && productImages.length > 0 ? (
                  productImages.map((it, idx) => (
                    <View key={idx} style={{ paddingVertical: 6 }}>
                      <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600' }}>{it.product_name || it.name || `Product ${it.product_id || idx}`}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ textAlign: 'center' }}>No products</Text>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
      {isGetLoading && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#FF6B00" />
              <Text style={styles.loadingText}>Dispensing...</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: isTablet ? 'row' : 'column',
    backgroundColor: '#F5F5F5',
  },
  
  // Mobile specific styles
  mobileContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mobileScrollContent: {
    paddingBottom: 24,
  },
  mobileHeader: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  mobileAmountSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  mobilePaymentSection: {
    paddingHorizontal: 20,
  },
  mobileInfoSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 24,
  },
  
  // Left Panel Styles (Tablet)
  leftPanel: {
    width: width * 0.35,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  storeIconWrapper: {
    width: 60,
    height: 60,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  storeIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeIconRoof: {
    width: 28,
    height: 8,
    backgroundColor: '#333',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  storeIconBody: {
    width: 24,
    height: 16,
    backgroundColor: '#333',
    marginTop: 2,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  storeIconDoor: {
    width: 8,
    height: 10,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  amountSection: {
    marginBottom: isMobile ? 16 : 40,
    marginTop: isMobile ? 0 : 72,
  },
  totalPayableLabel: {
    fontSize: isMobile ? 12 : 14,
    color: '#666',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: isMobile ? 12 : 16,
    paddingVertical: isMobile ? 10 : 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  amountText: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: '700',
    color: '#2E7D32',
  },
  amountDropdown: {
    fontSize: 12,
    color: '#2E7D32',
    marginLeft: 8,
  },
  secureCheckout: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  payuLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payuText: {
    fontSize: isMobile ? 12 : 14,
    fontWeight: '600',
    color: '#333',
  },
  payuU: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginLeft: 1,
  },
  payuUText: {
    fontSize: isMobile ? 10 : 12,
    fontWeight: '700',
    color: '#FFF',
  },
  secureText: {
    fontSize: isMobile ? 10 : 12,
    color: '#666',
    marginLeft: 8,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  verifiedIcon: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '700',
  },
  transactionInfo: {
    marginTop: isMobile ? 12 : 'auto',
  },
  transactionLabel: {
    fontSize: isMobile ? 11 : 12,
    color: '#666',
    marginBottom: 6,
  },
  invoiceBox: {
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  invoiceText: {
    fontSize: isMobile ? 10 : 12,
    color: '#F44336',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  tokenBox: {
    borderWidth: 1,
    borderColor: '#6B7280',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    maxWidth: '100%',
  },
  tokenText: {
    fontSize: isMobile ? 10 : 12,
    color: '#374151',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  showInvoicesButton: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: isMobile ? 8 : 10,
    paddingHorizontal: isMobile ? 12 : 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignSelf: 'flex-start',
  },
  showInvoicesButtonText: {
    fontSize: isMobile ? 12 : 14,
    color: '#333',
    fontWeight: '600',
  },

  // Right Panel Styles
  rightPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: isMobile ? 12 : 16,
    borderBottomWidth: isMobile ? 0 : 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  testModeLabel: {
    fontSize: isMobile ? 20 : 36,
    color: '#D32F2F',
    fontWeight: '900',
    marginLeft: isMobile ? 0 : 12,
    alignSelf: 'center',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: isMobile ? 8 : 20,
  },
  backIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconArrow: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#333',
    transform: [{ rotate: '45deg' }],
  },
  testModeButton: {
    width: isMobile ? 32 : 36,
    height: isMobile ? 32 : 36,
    borderRadius: isMobile ? 16 : 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  testModeIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testModeIconText: {
    fontSize: isMobile ? 16 : 20,
    color: '#666',
  },
  
  // BHIM UPI Header
  bhimHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isMobile ? 12 : 20,
  },
  bhimText: {
    fontSize: isMobile ? 18 : 24,
    fontWeight: '700',
    color: '#00695C',
    marginRight: 8,
  },
  bhimLogoImg: {
    width: isMobile ? 48 : 64,
    height: isMobile ? 21 : 28,
    marginRight: 8,
  },
  upiLogoContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: isMobile ? 6 : 8,
    paddingVertical: isMobile ? 3 : 4,
    borderRadius: 4,
  },
  upiText: {
    fontSize: isMobile ? 12 : 14,
    fontWeight: '700',
    color: '#FFF',
  },

  // QR Section
  qrSection: {
    backgroundColor: '#FAFAFA',
    borderRadius: isMobile ? 8 : 12,
    padding: isMobile ? 12 : 20,
    marginBottom: isMobile ? 16 : 24,
  },
  qrTitle: {
    fontSize: isMobile ? 10 : 12,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1,
    marginBottom: isMobile ? 12 : 16,
    textAlign: isMobile ? 'center' : 'left',
  },
  qrContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  qrInfo: {
    flex: 1,
    paddingRight: 16,
  },
  qrInfoTitle: {
    fontSize: isMobile ? 14 : 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  qrInfoSubtitle: {
    fontSize: isMobile ? 11 : 13,
    color: '#666',
    marginBottom: isMobile ? 12 : 16,
  },
  upiPoweredBy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: isMobile ? 'center' : 'flex-start',
  },
  poweredByText: {
    fontSize: 8,
    color: '#999',
    letterSpacing: 0.5,
    marginRight: 6,
  },
  upiSmallLogo: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  upiSmallText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
  },
  upiSmallLogoImg: {
    width: isMobile ? 36 : 48,
    height: isMobile ? 12 : 16,
  },
  upiLogoImg: {
    width: isMobile ? 48 : 64,
    height: isMobile ? 18 : 24,
  },
  qrCodeWrapper: {
    alignItems: 'center',
  },
  qrCodeContainer: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  qrCodeInner: {
    position: 'relative',
    backgroundColor: '#FFF',
  },
  generateQRPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  qrPlaceholderIcon: {
    opacity: 0.3,
  },
  qrPlaceholderText: {
    fontSize: 48,
    color: '#999',
  },
  generateQRButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  generateQRText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 0.5,
  },
  generateQRArrow: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },

  // UPI Apps Section
  upiAppsSection: {
    marginBottom: isMobile ? 12 : 24,
  },
  upiAppsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isMobile ? 12 : 16,
  },
  upiLogoSmall: {
    backgroundColor: '#00695C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 10,
  },
  upiLogoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  upiAppsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 0.5,
  },
  upiAppsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  upiAppButton: {
    width: isMobile ? `${100/3 - 2}%` : `${100/3 - 2}%`,
    alignItems: 'center',
    paddingVertical: isMobile ? 12 : 16,
    marginBottom: isMobile ? 8 : 12,
    backgroundColor: '#FFFFFF',
    borderRadius: isMobile ? 8 : 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  upiAppIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  upiAppIcon: {},
  upiAppIconLarge: {},
  upiAppIconContainerLarge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  upiAppIconContainerAmazon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  upiAppIconAmazon: {},
  upiAppIconContainerGpay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  upiAppIconGpay: {},
  
  upiAppName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  qrStaticImg: {
    width: 140,
    height: 140,
  },

  // Partners Section
  partnersSection: {
    paddingVertical: isMobile ? 12 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  partnerLogos: {
    flexDirection: 'row',
    justifyContent: isMobile ? 'center' : 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  getButton: {
    marginTop: 18,
    alignSelf: isMobile ? 'center' : 'flex-end',
    backgroundColor: '#2563EB',
    paddingVertical: isMobile ? 10 : 12,
    paddingHorizontal: isMobile ? 18 : 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  getButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getButtonIcon: {
    width: isMobile ? 24 : 28,
    height: isMobile ? 24 : 28,
    borderRadius: isMobile ? 12 : 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  getButtonIconText: {
    color: '#FFF',
    fontSize: isMobile ? 12 : 14,
    fontWeight: '700',
  },
  getButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 14 : 15,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  getButtonDisabled: {
    opacity: 0.7,
  },
  partnerLogo: {
    width: isMobile ? 32 : 40,
    height: isMobile ? 20 : 24,
    marginLeft: isMobile ? 8 : 12,
    marginVertical: isMobile ? 4 : 0,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isMobile ? 20 : 0,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: isMobile ? 16 : 20,
    padding: isMobile ? 24 : 32,
    width: isMobile ? '100%' : (width * 0.85),
    maxWidth: 400,
    alignItems: 'center',
  },
  successIconWrapper: {
    width: isMobile ? 64 : 80,
    height: isMobile ? 64 : 80,
    borderRadius: isMobile ? 32 : 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isMobile ? 16 : 24,
  },
  checkIconContainer: {
    width: isMobile ? 40 : 48,
    height: isMobile ? 40 : 48,
    borderRadius: isMobile ? 20 : 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconText: {
    fontSize: isMobile ? 24 : 28,
    color: '#FFF',
    fontWeight: '700',
  },
  failIconWrapper: {
    width: isMobile ? 64 : 80,
    height: isMobile ? 64 : 80,
    borderRadius: isMobile ? 32 : 40,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isMobile ? 16 : 24,
  },
  failIconContainer: {
    width: isMobile ? 40 : 48,
    height: isMobile ? 40 : 48,
    borderRadius: isMobile ? 20 : 24,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  failIconText: {
    fontSize: isMobile ? 24 : 28,
    color: '#FFF',
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: isMobile ? 18 : 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: isMobile ? 13 : 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: isMobile ? 16 : 24,
    lineHeight: 20,
  },
  modalAmount: {
    fontSize: isMobile ? 28 : 32,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: isMobile ? 16 : 24,
  },
  modalDetails: {
    width: '100%',
    backgroundColor: '#F8F8F8',
    borderRadius: isMobile ? 8 : 12,
    padding: isMobile ? 12 : 16,
    marginBottom: isMobile ? 16 : 24,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalDetailLabel: {
    fontSize: isMobile ? 12 : 13,
    color: '#666',
  },
  modalDetailValue: {
    fontSize: isMobile ? 12 : 13,
    fontWeight: '600',
    color: '#333',
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    paddingVertical: isMobile ? 14 : 16,
    borderRadius: isMobile ? 8 : 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: isMobile ? 15 : 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalButtonGroup: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#FF6B00',
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
  },

  // Loading Overlay
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: '#FFF',
    padding: isMobile ? 24 : 32,
    borderRadius: isMobile ? 12 : 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: isMobile ? 14 : 16,
    color: '#333',
    fontWeight: '500',
  },

  // Close Icon
  closeIconText: {
    fontSize: 28,
    color: '#999',
    fontWeight: '300',
  },
});

export default PaymentScreen;