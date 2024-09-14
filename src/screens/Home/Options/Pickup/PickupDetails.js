import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from '@components/containers';
import NavigationHeader from '@components/Header/NavigationHeader';
import { RoundedScrollContainer } from '@components/containers';
import { DetailField } from '@components/common/Detail';
import { showToastMessage } from '@components/Toast';
import { fetchPickupDetails } from '@api/details/detailApi';
import { OverlayLoader } from '@components/Loader';

const PickupDetails = ({ navigation, route }) => {
    const { id: pickupId } = route?.params || {};
    const [details, setDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            const updatedDetails = await fetchPickupDetails(pickupId);
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
            if (pickupId) {
                fetchDetails(pickupId);
            }
        }, [pickupId])
    );

    return (
        <SafeAreaView>
            <NavigationHeader
                title= {details?.sequence_no || 'Pickup Details'}
                onBackPress={() => navigation.goBack()}
                logo={false}
                iconOneName='edit'
                iconOnePress={() => navigation.navigate('EditPickup', { pickupId: id })}
            />
            <RoundedScrollContainer>
                <DetailField label="Customer"
                    value={details?.customer_name ? details.customer_name.trim() : '-'} 
                    multiline
                    numberOfLines={3}
                    textAlignVertical={'top'} />
                <DetailField label="Brand Name" value={details?.brand_name || '-'} />
                <DetailField label="Device Name" value={details?.device_name || '-'} />
                <DetailField label="Consumer Model" value={details?.consumer_model_name || '-'} />
                <DetailField label="Sequence No" value={details?.customer_mobile || '-'} />
                <DetailField label="Mobile Number" value={details?.customer_mobile || '-'} />
                <DetailField label="Date" value={formatDate(details.date)} />
                <DetailField label="Email" value={details?.customer_email || '-'} />
                <DetailField label="SalesPerson Name" value={''} />
                <DetailField label="Warehouse Name" value={details?.warehouse_name || '-'} />
                <DetailField label="Contact Name" value={''} />
                <DetailField label="Contact No" value={''} />
                <DetailField label="Contact Email" value={''} />
                <DetailField label="PickUp Scheduled Time" value={''} />
                <DetailField label="Assignee Namer" value={''} />
                <DetailField label="Serial No" value={''} />
                <DetailField label="Remarks"
                    value={details?.remarks || '-'}
                    multiline
                    numberOfLines={2}
                    textAlignVertical={'top'} />
                <DetailField label="Customer Address"
                    value={details?.pre_condition || '-'}
                    multiline
                    numberOfLines={2}
                    textAlignVertical={'top'} />
                <DetailField label="Customer Signature" value={''} />
                <DetailField label="Driver Signature" value={''} />
                <DetailField label="Coordinator Signature" value={''} />

                <OverlayLoader visible={isLoading || isSubmitting} />
            </RoundedScrollContainer>
        </SafeAreaView>
    );
};

export default PickupDetails;