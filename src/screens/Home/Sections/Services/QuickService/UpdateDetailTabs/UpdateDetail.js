import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useWindowDimensions, StyleSheet, FlatList, View, Text } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from '@components/containers';
import NavigationHeader from '@components/Header/NavigationHeader';
import { RoundedScrollContainer } from '@components/containers';
import { TextInput as FormInput } from '@components/common/TextInput';
import { DropdownSheet } from '@components/common/BottomSheets';
import { DetailField } from '@components/common/Detail';
import { Button } from '@components/common/Button';
import { OverlayLoader } from '@components/Loader';
import SparePartsList from './SparePartsList';
import { formatDateTime } from '@utils/common/date';
import { showToastMessage } from '@components/Toast';
import { fetchServiceDetails } from '@api/details/detailApi';
import { fetchProductsDropdown, fetchUnitOfMeasureDropdown } from '@api/dropdowns/dropdownApi';
import { COLORS, FONT_FAMILY } from '@constants/theme';

const UpdateDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params || {};

    const [details, setDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [spareName, setSpareName] = useState(null);
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [uom, setUom] = useState(null);
    const [tax, setTax] = useState('');
    const [serviceCharge, setServiceCharge] = useState('');
    const [subTotal, setSubTotal] = useState('');
    const [savedItems, setSavedItems] = useState([]);
    const [dropdown, setDropdown] = useState({ products: [], unitofmeasure: [] });
    const [selectedType, setSelectedType] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const ProductsData = await fetchProductsDropdown();
                setDropdown(prevDropdown => ({
                    ...prevDropdown,
                    products: ProductsData.map(data => ({
                        id: data._id,
                        label: data.product_name?.trim(),
                        unit_price: data.sale_price,
                        product_description: data.product_description,
                    })),
                }));
            } catch (error) {
                console.error('Error fetching Products dropdown data:', error);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchUnitOfMeasure = async () => {
            try {
                const UnitOfMeasureData = await fetchUnitOfMeasureDropdown();
                setDropdown(prevDropdown => ({
                    ...prevDropdown,
                    unitofmeasure: UnitOfMeasureData.map(data => ({
                        id: data._id,
                        label: data.uom_name,
                        product_description: data.product_description,
                    })),
                }));
            } catch (error) {
                console.error('Error fetching Unit Of Measure dropdown data:', error);
            }
        };

        fetchUnitOfMeasure();
    }, []);

    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            const updatedDetails = await fetchServiceDetails(id);
            setDetails(updatedDetails[0] || {});
        } catch (error) {
            console.error('Error fetching service details:', error);
            showToastMessage('Failed to fetch service details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (id) {
                fetchDetails(id);
            }
        }, [id])
    );

    const toggleBottomSheet = (type) => {
        setSelectedType(type);
        setIsVisible(!isVisible);
    };

    const handleSubmit = () => {
        if (!spareName || !tax || !serviceCharge) {
            showToastMessage('Please select Spare Name, Service Charge, and Tax to proceed.');
            return;
        }
        const spareItem = {
            spareName: spareName?.label || '',
            description: description || '',
            quantity: quantity || '',
            uom: uom?.label || '',
            unitPrice: unitPrice || '',
            tax: tax || '',
            serviceCharge: serviceCharge || '',
            subTotal: subTotal || '',
        };
        setSavedItems([...savedItems, spareItem]);
        setSpareName(null);
        setDescription('');
        setQuantity('');
        setUom(null);
        setUnitPrice('');
        setTax('');
        setServiceCharge('');
        setSubTotal('');
        setShowForm(false);
    };

    const calculateSubTotal = (unitPrice, quantity) => {
        return unitPrice && quantity ? (parseFloat(unitPrice) * parseFloat(quantity)).toFixed(2) : '';
    };

    const handleProductSelection = (selectedProduct) => {
        setSpareName(selectedProduct);
        const unitPrice = selectedProduct.unit_price ? selectedProduct.unit_price.toString() : '0';
        setUnitPrice(unitPrice);
        const defaultQuantity = '1';
        setQuantity(defaultQuantity);
        const calculatedSubTotal = calculateSubTotal(unitPrice, defaultQuantity);
        setSubTotal(calculatedSubTotal);
        setDescription(selectedProduct.product_description || '');
    };

    const handleQuantityChange = (value) => {
        setQuantity(value);
        const calculatedSubTotal = calculateSubTotal(unitPrice, value);
        setSubTotal(calculatedSubTotal);
    };

    const renderBottomSheet = () => {
        let items = [];
        let fieldName = '';

        switch (selectedType) {
            case 'SpareName':
                items = dropdown.products;
                fieldName = 'spareName';
                break;
            case 'UOM':
                items = dropdown.unitofmeasure;
                fieldName = 'uom';
                break;
            default:
                return null;
        }

        return (
            <DropdownSheet
                isVisible={isVisible}
                items={items}
                title={selectedType}
                onClose={() => setIsVisible(false)}
                onValueChange={(value) => {
                    if (fieldName === 'spareName') handleProductSelection(value);
                    else if (fieldName === 'uom') setUom(value);
                }}
            />
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <NavigationHeader
                title="Update Details"
                onBackPress={() => navigation.goBack()}
            />
            <RoundedScrollContainer>
                <DetailField
                    label="Customer"
                    value={details?.customer_name?.trim() || '-'}
                    multiline
                    numberOfLines={3}
                    textAlignVertical={'top'}
                />
                <DetailField label="Mobile Number" value={details?.customer_mobile || '-'} />
                <DetailField label="Email" value={details?.customer_email || '-'} />
                <DetailField label="Warehouse Name" value={details?.warehouse_name || '-'} />
                <DetailField label="Created On" value={formatDateTime(details.date)} />
                <DetailField label="Created By" value={details?.assignee_name || '-'} />
                <DetailField label="Brand Name" value={details?.brand_name || '-'} />
                <DetailField label="Device Name" value={details?.device_name || '-'} />
                <DetailField label="Consumer Model" value={details?.consumer_model_name || '-'} />
                <Button onPress={() => setShowForm(!showForm)} title={'Add Item'} backgroundColor={COLORS.primaryThemeColor} width={'50%'} alignSelf={'center'} />
                {showForm && (
                    <>
                        <FormInput
                            label="Spare Name"
                            placeholder="Select Product Name"
                            dropIcon="menu-down"
                            multiline
                            required
                            editable={false}
                            items={dropdown.products}
                            value={spareName?.label?.trim()}
                            onPress={() => toggleBottomSheet('SpareName')}
                        />
                        <FormInput
                            label="Description"
                            placeholder="Enter Description"
                            editable={true}
                            value={description}
                            onChangeText={setDescription}
                        />
                        <FormInput
                            label="Quantity"
                            placeholder="Enter Quantity"
                            editable={true}
                            keyboardType="numeric"
                            value={quantity}
                            onChangeText={handleQuantityChange}
                        />
                        <FormInput
                            label="UOM"
                            placeholder="Select Unit Of Measure"
                            dropIcon="menu-down"
                            editable={false}
                            items={dropdown.unitofmeasure}
                            value={uom?.label}
                            onPress={() => toggleBottomSheet('UOM')}
                        />
                        <FormInput
                            label="Unit Price"
                            placeholder="Enter Unit Price"
                            editable={false}
                            keyboardType="numeric"
                            value={unitPrice}
                            onChangeText={setUnitPrice}
                        />
                        <FormInput
                            label="Taxes"
                            placeholder="Enter Tax"
                            editable={true}
                            required
                            keyboardType="numeric"
                            value={tax}
                            onChangeText={setTax}
                        />
                        <FormInput
                            label="Service Charge"
                            placeholder="Enter Service Charge"
                            editable={true}
                            keyboardType="numeric"
                            value={serviceCharge}
                            onChangeText={setServiceCharge}
                        />
                        <FormInput
                            label="Sub Total"
                            placeholder="Enter Sub Total"
                            editable={false}
                            keyboardType="numeric"
                            value={subTotal}
                            onChangeText={setSubTotal}
                        />
                        <Button
                            onPress={handleSubmit}
                            title="Save Item"
                            backgroundColor={COLORS.primaryThemeColor}
                            width="50%"
                            alignSelf="center"
                        />
                    </>
                )}

                <FlatList
                    data={savedItems}
                    renderItem={({ item }) => (
                        <SparePartsList item={item} />
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    ListHeaderComponent={() => savedItems.length > 0 && <Text style={styles.label}>Spare Parts</Text>}
                />
            </RoundedScrollContainer>
            {renderBottomSheet()}
            {isLoading && <OverlayLoader />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    label: {
        marginVertical: 5,
        fontSize: 16,
        color: COLORS.primaryThemeColor,
        fontFamily: FONT_FAMILY.urbanistSemiBold,
    },
});

export default UpdateDetails;