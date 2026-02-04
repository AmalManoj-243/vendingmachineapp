import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import {
  CarouselPagination,
  ImageContainer,
  ListHeader,
  Header,
} from "@components/Home";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { fetchProductsOdoo } from "@api/services/generalApi";
import { RoundedContainer, SafeAreaView } from "@components/containers";
import { formatData } from "@utils/formatters";
import { COLORS } from "@constants/theme";
import { showToastMessage } from "@components/Toast";
import { ProductsList } from "@components/Product";
import { useDataFetching, useLoader } from "@hooks";
import { useProductStore } from '@stores/product';
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useAuthStore } from '@stores/auth';
import { fetchProductDetailsByBarcode } from "@api/details/detailApi";
import { OverlayLoader } from "@components/Loader";

const { height, width } = Dimensions.get("window");

// Responsive breakpoints
const isSmallPhone = width < 360; // Small phones (e.g., iPhone SE)
const isPhone = width < 768; // Regular phones
const isTablet = width >= 768 && width < 1024; // Tablets
const isLargeTablet = width >= 1024; // Large tablets/iPad Pro

// Determine number of columns based on screen width
const getNumColumns = () => {
  if (isLargeTablet) return 5;
  if (isTablet) return 4;
  if (isSmallPhone) return 2;
  return 3; // Default for regular phones
};

const NUM_COLUMNS = getNumColumns();

const HomeScreen = ({ navigation }) => {
  const [backPressCount, setBackPressCount] = useState(0);
  const isFocused = useIsFocused();
  const { data, loading, fetchData, fetchMoreData } =
    useDataFetching(fetchProductsOdoo);

  const handleBackPress = useCallback(() => {
    if (navigation.isFocused()) {
      if (backPressCount === 0) {
        setBackPressCount(1);
        return true;
      } else if (backPressCount === 1) {
        BackHandler.exitApp();
      }
    }
    return false;
  }, [backPressCount, navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  useEffect(() => {
    const backPressTimer = setTimeout(() => {
      setBackPressCount(0);
    }, 2000);

    return () => clearTimeout(backPressTimer);
  }, [backPressCount]);

  useEffect(() => {
    if (backPressCount === 1) {
      showToastMessage("Press back again to exit");
    }
  }, [backPressCount]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      try {
        const sanitized = data.map(({ image_url, ...rest }) => rest);
        console.log('Fetched products from Odoo (product filling):', sanitized);
      } catch (e) {
        console.log('Fetched products from Odoo (product filling): [unable to sanitize]');
      }
    }
  }, [data]);

  const handleLoadMore = () => {
    fetchMoreData();
  };

  const { addProduct, setCurrentCustomer } = useProductStore();
  const authUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (authUser) {
      const uid = authUser.uid || authUser.id || null;
      console.log('[AUTH] current user id:', uid, 'api_token:', authUser.api_token, 'api_keys:', authUser.api_keys);
    } else {
      console.log('[AUTH] no authenticated user');
    }
  }, [authUser]);

  const mapToStoreProduct = (p) => ({
    id: `filling_${p.id}`,
    remoteId: p.id,
    name: p.product_name || p.name || p.product_name || 'Product',
    product_name: p.product_name || p.name || p.product_name || 'Product',
    price: Number(p.price ?? p.list_price ?? 0),
    price_unit: Number(p.price ?? p.list_price ?? 0),
    quantity: Number(p.quantity ?? p.qty ?? 1),
    qty: Number(p.quantity ?? p.qty ?? 1),
    image_url: p.image_url || null,
    product_id: Array.isArray(p.product_id) ? p.product_id[0] : p.product_id || null,
    product_code: p.default_code || p.product_code || null,
  });

  const handleProductPress = (item) => {
    try {
      try { setCurrentCustomer('pos_guest'); } catch (e) { /* ignore */ }
      const storeItem = mapToStoreProduct(item);
      const { image_url, ...logSafeItem } = storeItem;
      console.log('[Home] Adding product to cart and opening cart:', logSafeItem);
      addProduct(storeItem);
      navigation.navigate('CartScreen');
    } catch (e) {
      console.error('Error adding product from Home to cart', e);
    }
  };

  const renderItem = ({ item }) => {
    if (item.empty) {
      return <View style={[styles.itemStyle, styles.itemInvisible]} />;
    }
    return (
      <ProductsList
        item={item}
        onPress={() => handleProductPress(item)}
        showQuickAdd={false}
      />
    );
  };

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  // Responsive snap points based on device type and screen height
  const snapPoints = useMemo(() => {
    // For large tablets - prevent overlap with slideshow
    if (isLargeTablet) {
      if (height < 900) {
        return ["55%", "88%"];
      }
      return ["58%", "90%"];
    }
    
    // For regular tablets - prevent overlap with slideshow
    if (isTablet) {
      if (height < 900) {
        return ["52%", "86%"];
      } else if (height < 1000) {
        return ["54%", "88%"];
      }
      return ["56%", "90%"];
    }
    
    // For small phones - less initial space
    if (isSmallPhone) {
      if (height < 600) {
        return ["40%", "75%"];
      }
      return ["45%", "80%"];
    }
    
    // For regular phones
    if (height < 700) {
      return ["45%", "79%"];
    } else if (height < 800) {
      return ["60%", "88%"];
    } else if (height < 810) {
      return ["60%", "88%"];
    } else {
      return ["65%", "90%"];
    }
  }, [height]);

  const [detailLoading, startLoading, stopLoading] = useLoader(false);

  const handleScan = async (code) => {
    startLoading();
    try {
      const productDetails = await fetchProductDetailsByBarcode(code);
      if (productDetails.length > 0) {
        const details = productDetails[0];
        navigation.navigate('ProductDetail', { detail: details })
      } else {
        showToastMessage("No Products found for this Barcode");
      }
    } catch (error) {
      showToastMessage(`Error fetching inventory details ${error.message}`);
    } finally {
      stopLoading();
    }
  };

  // Responsive padding bottom based on device type
  const contentPaddingBottom = useMemo(() => {
    if (isLargeTablet) return "20%";
    if (isTablet) return "22%";
    if (isSmallPhone) return "30%";
    return "25%";
  }, []);

  // Responsive initial render count
  const initialNumToRender = useMemo(() => {
    if (isLargeTablet) return 15; // 5 columns × 3 rows
    if (isTablet) return 12; // 4 columns × 3 rows
    if (isSmallPhone) return 6; // 2 columns × 3 rows
    return 9; // 3 columns × 3 rows (default)
  }, []);

  return (
    <SafeAreaView backgroundColor={COLORS.primaryThemeColor}>
      <RoundedContainer>
        {/* Header */}
        <Header />
        <View style={styles.carouselContainer}>
          <CarouselPagination />
        </View>

        {/* Products section with responsive BottomSheet */}
        <BottomSheet snapPoints={snapPoints}>
          <ListHeader title="Products" />
          <BottomSheetFlatList
            data={formatData(data, NUM_COLUMNS)}
            numColumns={NUM_COLUMNS}
            key={NUM_COLUMNS} // Force re-render when columns change
            initialNumToRender={initialNumToRender}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
            onEndReached={handleLoadMore}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.2}
            columnWrapperStyle={NUM_COLUMNS > 1 ? styles.columnWrapper : null}
            ListFooterComponent={
              loading && <ActivityIndicator size="large" color="#0000ff" />
            }
          />
        </BottomSheet>
        <OverlayLoader visible={detailLoading} />
      </RoundedContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginTop: isTablet ? -24 : -18,
    marginBottom: isTablet ? -12 : -8,
  },
  itemInvisible: {
    backgroundColor: "transparent",
  },
  itemStyle: {
    flex: 1,
    alignItems: "center",
    margin: isSmallPhone ? 4 : (isTablet ? 8 : 6),
    borderRadius: isTablet ? 10 : 8,
    marginTop: isSmallPhone ? 3 : 5,
    backgroundColor: "white",
    // Responsive min/max widths to prevent items from being too small or too large
    minWidth: isSmallPhone ? 140 : (isTablet ? 120 : 100),
    maxWidth: isLargeTablet ? 220 : (isTablet ? 200 : 180),
  },
  columnWrapper: {
    justifyContent: isTablet ? 'flex-start' : 'space-between',
    paddingHorizontal: isTablet ? 8 : 4,
  },
});

export default HomeScreen;