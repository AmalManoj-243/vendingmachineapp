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

const { height } = Dimensions.get("window");

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
    return false; // Allow default back action
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
    // Show toast message when backPressCount changes to 1
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
      // Log product details from Odoo model 'product filling' but redact image URLs
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

  // Define different snap points based on screen height
  const snapPoints = useMemo(() => {
    // Increase the default (first) snap point so more product rows are visible
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


  return (
    <SafeAreaView backgroundColor={COLORS.primaryThemeColor}>
      {/* rounded border */}
      <RoundedContainer>
        {/* Header */}
        <Header />
        <View style={{ marginTop: -18, marginBottom: -8 }}>
          <CarouselPagination />
        </View>

        {/* Section */}
        {/* POS and Sales Order tiles removed as requested */}
        {/* Products section (Categories removed) */}
        <BottomSheet snapPoints={snapPoints}>
          <ListHeader title="Products" />
          <BottomSheetFlatList
            data={formatData(data, 3)}
            numColumns={3}
            initialNumToRender={9}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: "25%" }}
            onEndReached={handleLoadMore}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.2}
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
  itemInvisible: {
    backgroundColor: "transparent",
  },
  itemStyle: {
    flex: 1,
    alignItems: "center",
    margin: 6,
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: "white",
  },
});

export default HomeScreen;
