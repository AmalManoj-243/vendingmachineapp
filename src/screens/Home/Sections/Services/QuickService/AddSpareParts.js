import React, { useEffect, useState } from 'react';
import { RoundedScrollContainer, SafeAreaView } from '@components/containers';
import { TextInput as FormInput } from '@components/common/TextInput';
import { fetchProductsDropdown, fetchUnitOfMeasureDropdown } from '@api/dropdowns/dropdownApi';
import { DropdownSheet } from '@components/common/BottomSheets';
import { NavigationHeader } from '@components/Header';
import { Button } from '@components/common/Button';
import { COLORS } from '@constants/theme';
import { Keyboard } from 'react-native';
import { validateFields } from '@utils/validation';
import { CheckBox } from '@components/common/CheckBox';

const AddSpareParts = ({ navigation, route }) => {
    const { id, addSpareParts } = route?.params || {};

    const [selectedType, setSelectedType] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    const [dropdown, setDropdown] = useState({
        products: [],
        unitofmeasure: []
    });

    const [formData, setFormData] = useState({
        product: '',
        description: '',
        quantity: '1',
        uom: '',
        unitPrice: '',
        serviceCharge: '100', // Initial service charge value
        isInclusive: false,
        tax: 'VAT 5%',
        subTotal: '',
    });

    const [errors, setErrors] = useState({});

    const calculateSubTotal = (unitPrice, quantity) => {
        return unitPrice && quantity ? (parseFloat(unitPrice) * parseFloat(quantity)).toFixed(2) : '';
    };

    const calculateTotalAmount = (subTotal, serviceCharge, isInclusive) => {
        if (isInclusive) {
            return subTotal ? subTotal : '';
        } else {
            return subTotal && serviceCharge ? (parseFloat(subTotal) + parseFloat(serviceCharge)).toFixed(2) : '';
        }
    };

    const handleFieldChange = (field, value) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            [field]: value,
        }));

        if (errors[field]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [field]: null,
            }));
        }
    };

    const handleProductSelection = (selectedProduct) => {
        const unitPrice = selectedProduct.unitPrice ? selectedProduct.unitPrice.toString() : '0';
        const description = selectedProduct.productDescription || '';
        const defaultQuantity = '1';
        const calculatedSubTotal = calculateSubTotal(unitPrice, defaultQuantity);

        setFormData(prevFormData => ({
            ...prevFormData,
            product: selectedProduct,
            description,
            unitPrice,
            quantity: defaultQuantity,
            subTotal: calculatedSubTotal,
        }));
    };

    const handleQuantityChange = (value) => {
        handleFieldChange('quantity', value);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const ProductsData = await fetchProductsDropdown();
                setDropdown(prevDropdown => ({
                    ...prevDropdown,
                    products: ProductsData.map(data => ({
                        id: data._id,
                        label: data.product_name?.trim(),
                        unitPrice: data.sale_price,
                        productDescription: data.product_description,
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
                    })),
                }));
            } catch (error) {
                console.error('Error fetching Unit Of Measure dropdown data:', error);
            }
        };

        fetchUnitOfMeasure();
    }, []);

    const toggleBottomSheet = (type) => {
        setSelectedType(isVisible ? null : type);
        setIsVisible(!isVisible);
    };

    const validateForm = (fieldsToValidate) => {
        Keyboard.dismiss();
        const { isValid, errors } = validateFields(formData, fieldsToValidate);
        setErrors(errors);
        return isValid;
    };

    const handleAddItems = async () => {
        const fieldsToValidate = ['product', 'tax'];
        if (validateForm(fieldsToValidate)) {
            const spareItem = {
                product: formData.product || '',
                description: formData.description || '',
                quantity: formData.quantity || '',
                uom: formData.uom || '',
                unitPrice: formData.unitPrice || '',
                tax: formData.tax || '',
                serviceCharge: formData.serviceCharge || '',
                subTotal: formData.subTotal || '',
            };
            addSpareParts(spareItem);
            navigation.navigate('UpdateDetail', { id });
        }
    };

    const renderBottomSheet = () => {
        let items = [];
        let fieldName = '';

        switch (selectedType) {
            case 'Spare Name':
                items = dropdown.products;
                fieldName = 'product';
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
                    if (selectedType === 'Spare Name') {
                        handleProductSelection(value);
                    } else {
                        handleFieldChange(fieldName, value);
                    }
                }}
            />
        );
    };

    return (
        <SafeAreaView>
            <NavigationHeader
                title="Add Spare Parts"
                onBackPress={() => navigation.goBack()}
            />
            <RoundedScrollContainer>
                <FormInput
                    label="Spare Name"
                    placeholder="Select Product Name"
                    dropIcon="menu-down"
                    multiline
                    required
                    editable={false}
                    validate={errors.product}
                    value={formData.product?.label?.trim()}
                    onPress={() => toggleBottomSheet('Spare Name')}
                />
                <FormInput
                    label="Description"
                    placeholder="Enter Description"
                    value={formData.description}
                    onChangeText={(value) => handleFieldChange('description', value)}
                />
                <FormInput
                    label="Quantity"
                    placeholder="Enter Quantity"
                    keyboardType="numeric"
                    value={formData.quantity}
                    onChangeText={(value) => handleQuantityChange(value)}
                />
                <FormInput
                    label="UOM"
                    placeholder="Select Unit Of Measure"
                    dropIcon="menu-down"
                    editable={false}
                    value={formData.uom?.label}
                    onPress={() => toggleBottomSheet('UOM')}
                />
                <FormInput
                    label="Unit Price"
                    placeholder="Enter Unit Price"
                    editable={false}
                    keyboardType="numeric"
                    value={formData.unitPrice}
                />
                <CheckBox
                    checked={formData.isInclusive}
                    onPress={() => handleFieldChange('isInclusive', !formData.isInclusive)}
                    label="Set Inclusive"
                />
                <FormInput
                    label="Taxes"
                    placeholder="Enter Tax"
                    dropIcon="menu-down"
                    required
                    keyboardType="numeric"
                    value={formData.tax}
                    onChangeText={(value) => handleFieldChange('tax', value)}
                />
                <FormInput
                    label="Subtotal"
                    editable={false}
                    value={formData.subTotal}
                />
                <Button
                    title={'SAVE'}
                    width={'50%'}
                    alignSelf={'center'}
                    backgroundColor={COLORS.primaryThemeColor}
                    onPress={handleAddItems}
                />
            </RoundedScrollContainer>
            {renderBottomSheet()}
        </SafeAreaView>
    );
};

export default AddSpareParts;