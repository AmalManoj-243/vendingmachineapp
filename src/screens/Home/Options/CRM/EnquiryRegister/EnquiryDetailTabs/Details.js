import React, { useState, useCallback } from 'react';
import { RoundedScrollContainer, SafeAreaView } from '@components/containers';
import { useFocusEffect } from '@react-navigation/native';
import { DetailField } from '@components/common/Detail';
import { formatDateTime } from '@utils/common/date';
import { showToastMessage } from '@components/Toast';
import { fetchEnquiryRegisterDetails } from '@api/details/detailApi';

const Details = ({ enquiryId, route }) => {
  const initialDetails = route?.params?.visitDetails || {};
  const [details, setDetails] = useState(initialDetails);

  const fetchDetails = async (enquiryId) => {
    try {
      const updatedDetails = await fetchEnquiryRegisterDetails(enquiryId);
      setDetails(updatedDetails[0]);
    } catch (error) {
      console.error('Error fetching enquiry details:', error);
      showToastMessage('Failed to fetch enquiry details. Please try again.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (enquiryId) {
        fetchDetails(enquiryId);
      }
    }, [enquiryId])
  );

  return (
      <RoundedScrollContainer>
        <DetailField label="Date & Time" value={formatDateTime(details.date)} />
        <DetailField label="Source" value={details?.source?.source_name || '-'} />
        <DetailField label="Name" value={details?.name || '-'} />
        <DetailField label="Company Name" value={details?.company_name || '-'} />
        <DetailField label="Phone" value={details?.mobile_no || '-'} />
        <DetailField label="Email" value={details?.email || '-'} />
        <DetailField label="Address" value={details?.address || '-'} />
        <DetailField 
          label="Enquiry Details" 
          value={details?.enquiry_details || '-'} 
          multiline 
          numberOfLines={5} 
        />
      </RoundedScrollContainer>
  );
};

export default Details;
