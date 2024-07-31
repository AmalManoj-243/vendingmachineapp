import React, { useState, useCallback } from 'react';
import { RoundedScrollContainer } from '@components/containers';
import { useFocusEffect } from '@react-navigation/native';
import { DetailField } from '@components/common/Detail';
import { formatDateTime } from '@utils/common/date';
import { showToastMessage } from '@components/Toast';
import { fetchVisitPlanDetails } from '@api/details/detailApi';
import { OverlayLoader } from '@components/Loader';

const Details = ({ visitPlanId }) => {
  const [details, setDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false)

  const fetchDetails = async (visitPlanId) => {
    setIsLoading(true);
    try {
      const updatedDetails = await fetchVisitPlanDetails(visitPlanId);
      setDetails(updatedDetails[0]);
    } catch (error) {
      console.error('Error fetching enquiry details:', error);
      showToastMessage('Failed to fetch enquiry details. Please try again.');
    } finally {
      setIsLoading(false)
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (visitPlanId) {
        fetchDetails(visitPlanId);
      }
    }, [visitPlanId])
  );

  return (
    <RoundedScrollContainer>
      <DetailField label="Visit Date" value={formatDateTime(details?.visit_date)} />
      <DetailField label="Customer Name" value={details?.customer_name?.trim() || '-'} />
      <DetailField label="Assigned To" value={details?.visit_employee_name || '-'} />
      <DetailField label="Created By" value={details?.sales_person_name || '-'} />
      <DetailField label="Approval Status" value={details?.approval_status || '-'} />
      <DetailField label="Visit Purpose" value={details?.purpose_of_visit_name || '-'} />
      <DetailField
        label="Remarks"
        value={details?.remarks || '-'}
        multiline
        numberOfLines={5}
        textAlignVertical={'top'}
      />
      <OverlayLoader visible={isLoading} />
    </RoundedScrollContainer>
  );
};

export default Details;
