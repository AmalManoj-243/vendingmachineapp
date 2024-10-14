import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Image, StyleSheet, FlatList, View, Text, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from '@components/containers';
import NavigationHeader from '@components/Header/NavigationHeader';
import { RoundedScrollContainer } from '@components/containers';
import { DetailField } from '@components/common/Detail';
import { showToastMessage } from '@components/Toast';
import { fetchKPIDashboardDetails } from '@api/details/detailApi';
import { OverlayLoader } from '@components/Loader';
import { Button } from '@components/common/Button';
import { COLORS, FONT_FAMILY } from '@constants/theme';
import AntDesign from '@expo/vector-icons/AntDesign';
import { put, post } from '@api/services/utils';
import { CompleteModal, ConfirmationModal, DocumentModal, PauseModal, ReAssignModal, UpdatesModal } from '@components/Modal';
import { useAuthStore } from '@stores/auth';
import { KPIUpdateList } from '@components/KPI';
import { formatDateTime } from '@utils/common/date';
import { TitleWithButton } from '@components/Header';

const KPIActionDetails = ({ navigation, route }) => {
  const { id } = route?.params || {};
  const currentUser = useAuthStore((state) => state.user);
  const [details, setDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [actionToPerform, setActionToPerform] = useState(null);
  const [isStartModalVisible, setIsStartModalVisible] = useState(false);
  const [isPauseModalVisible, setIsPauseModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [kpiUpdates, setKpiUpdates] = useState([]);
  const [kpiDocument, setKpiDocument] = useState([]);
  const [formData, setFormData] = useState({ documentUrls: [] });
  const [errors, setErrors] = useState({});

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const [updatedDetails] = await fetchKPIDashboardDetails(id);
      setDetails(updatedDetails || {});
      setKpiUpdates(updatedDetails?.kpiStatusUpdates || []);
      // Map through document uploads and the files
      const mappedDocuments = updatedDetails?.documentUploads?.map((upload) => ({
        files: upload.files || []
      })) || [];
      setKpiDocument(mappedDocuments);
    } catch (error) {
      console.error('Error fetching KPI details:', error);
      showToastMessage('Failed to fetch KPI details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchDetails();
      }
    }, [id])
  );

  const handleTaskAction = async (actionData, successMessage, modalSetter) => {
    setIsSubmitting(true);
    try {
      const response = await put('/updateKpiTasks', actionData);
      if (response.status === true) {
        showToastMessage(successMessage);
      } else {
        showToastMessage('Failed to perform action. Please try again.');
      }
    } catch (error) {
      console.error('API error:', error);
      showToastMessage('An error occurred. Please try again.');
    } finally {
      fetchDetails();
      setIsSubmitting(false);
      modalSetter(false);
    }
  };

  const handleStartTask = () => {
    const data = {
      _id: details._id || id,
      status: 'In progress',
      assignee_id: currentUser._id,
      assignee_name: currentUser?.related_profile?.name,
      progress_status: 'Ongoing',
      isDeveloper: false,
      estimatedTime: details.totalEstimation?.[0]?.estimated_time || 0,
      // time: new Date(),
    };
    console.log("Start Data", data)
    handleTaskAction(data, 'Task Started Successfully', setIsStartModalVisible);
  };

  const handlePauseTask = (pauseReason) => {
    const data = {
      pause_reason: pauseReason,
      progress_status: 'Pause',
      _id: details._id || id,
      isDeveloper: false,
      assignee_id: currentUser._id,
      assignee_name: currentUser?.related_profile?.name,
    };
    console.log("Pause Data", data)
    handleTaskAction(data, 'Task Paused Successfully', setIsPauseModalVisible);
  };

  const handleReAssignTask = (reAssignReason, selectedAssignee) => {
    // if (!selectedAssignee || !selectedAssignee._id) {
    //   console.error("Selected assignee is missing or invalid.");
    //   return;
    // }
    const data = {
      _id: details._id || id,
      assignee_id: currentUser._id,
      assignee_name: currentUser?.related_profile?.name,
      estimatedTime: details.totalEstimation?.[0]?.estimated_time || 0,
      // assignedToId: selectedAssignee._id,
      // assignedToName: selectedAssignee.name,
      // reassign_reason: ${currentUser?.related_profile?.name} reassigned the task to ${selectedAssignee.name} due to ${reAssignReason},
    };
    console.log("Reassign", data)
    handleTaskAction(data, 'Task Re-Assigned Successfully', setIsAssignModalVisible);
  };

  const handleCompleteTask = () => {
    const data = {
      _id: details._id || id,
      assignee_id: currentUser._id,
      assignee_name: currentUser?.related_profile?.name,
      progress_status: 'Completed',
      status: 'Completed',
    };
    handleTaskAction(data, 'Task Completed Successfully', setIsCompleteModalVisible);
  };

  // const handleUploadDocument = async (actionData, successMessage, modalSetter) => {
  //   setIsSubmitting(true);
  //   try {
  //     const response = await post('/fileUploadMultiple', actionData);
  //     if (response.success === true) {
  //       const updatedDocuments = response.data || [];
  //       showToastMessage(successMessage);
  //       setFormData((prevData) => ({
  //         ...prevData,
  //         documentUrls: updatedDocuments 
  //       }));
  //     } else {
  //       showToastMessage('Failed to perform action. Please try again.');
  //     }
  //   } catch (error) {
  //     console.error('API error:', error);
  //     showToastMessage('An error occurred. Please try again.');
  //   } finally {
  //     fetchDetails();
  //     setIsSubmitting(false);
  //     modalSetter(false);
  //   }
  // };

  const handleDocumentUploads = async (url) => {
    const data = {
      _id: details._id || id,
      documentUploads: [
        {
          assignee_id: currentUser._id,
          assignee_name: currentUser?.related_profile?.name,
          files: url || [],
        }
      ]
    };
    console.log('Uploading documents with data:', data);
    handleTaskAction(data, 'File Uploaded successfully');
  };

  const saveUpdates = async (updateText) => {
    const updateData = {
      _id: details._id || id,
      kpiStatusUpdates: [
        {
          isDeveloper: true,
          assignee_id: currentUser._id,
          assignee_name: currentUser?.related_profile?.name,
          file: documentUrls || [],
          updateText,
          time: new Date(),
        },
      ],
    };
    handleTaskAction(updateData, 'Update saved successfully', setIsModalVisible);
  };

  const UploadsContainer = ({ documentUrls, onDelete }) => {
    return (
      <FlatList
        data={documentUrls}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <ListAction document={item.files} index={index} onDelete={onDelete} />
        )}
      />
    );
  };

  const ListAction = ({ document, index }) => {
    const handleOpenDocument = (url) => {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (!supported) {
            Alert.alert('Error', 'Unable to open document');
          } else {
            return Linking.openURL(url);
          }
        })
        .catch((err) => console.error('Error opening document:', err));
    };

    return (
      <View style={styles.listContainer}>
        <TouchableOpacity onPress={() => handleOpenDocument(document[0])}>
          <Image
            source={require('@assets/icons/modal/file_upload.png')}
            style={styles.image}
          />
        </TouchableOpacity>
        <View style={styles.deleteIconContainer}>
          <TouchableOpacity onPress={() => handleDeleteDocument(index)}>
            <AntDesign name="delete" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleFieldChange = (field, value) => {
    setFormData((prevFormData) => ({ ...prevFormData, [field]: value }));
    if (errors[field]) {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: null }));
    }
  };

  const handleDeleteDocument = (index) => {
    const updatedDocuments = [...formData.documentUrls];
    updatedDocuments.splice(index, 1);
    handleFieldChange('documentUrls', updatedDocuments);
  };

  const isTaskStarted = details.progress_status === 'Ongoing';
  const isTaskPaused = details.progress_status === 'Pause';
  const isTaskCompleted = details.progress_status === 'Completed';

  return (
    <SafeAreaView>
      <NavigationHeader
        title={'KPI Action Details'}
        onBackPress={() => navigation.goBack()} />
      <RoundedScrollContainer>
        <DetailField label="Sequence No" value={details?.kpi_sequenceNo || '-'} />
        <DetailField label="Action Status" value={details?.status || '-'} />
        <DetailField
          label="KRA"
          value={details?.kra?.name || '-'}
          multiline
          numberOfLines={3}
          textAlignVertical={'top'}
        />
        <DetailField
          label="KPI Name"
          value={details?.kpi_name || '-'}
          multiline
          numberOfLines={3}
          textAlignVertical={'top'}
        />
        <DetailField label="Created By" value={details?.created_by?.name || '-'} />
        <DetailField label="User Group" value={details?.usergroup?.group_name || '-'} />
        <DetailField label="Person" value={details?.employee?.name || '-'} />
        <DetailField label="Action Screen Name" value={details?.action_screen_name || '-'} />
        <DetailField label="Next KPI Name" value={details?.next_kpi_name || '-'} />
        <DetailField
          label="KPI Description"
          value={details?.kpi_description || '-'}
          multiline
          numberOfLines={10}
          textAlignVertical={'top'}
        />
        <DetailField label="Is Mandatory" value={details?.is_mandatory ? 'Yes' : 'No' || '-'} />
        <DetailField label="Priority" value={details?.priority || '-'} />
        <DetailField label="Checklists" value={details?.remarks || '-'} />
        <DetailField label="Reference Document" value={details?.pre_condition || '-'} />
        <DetailField label="Estimated Time (HR)" value={details?.totalEstimation?.[0]?.estimated_time?.toString() || '-'} />
        <DetailField label="Deadline" value={formatDateTime(details?.deadline) || 'No data'} />
        {/* <DetailField label="Deadline" value={details?.deadline || 'No Data'} /> */}
        <DetailField label="KPI Points" value={details?.kpi_points || '-'} />
        <DetailField label="Warehouse" value={details?.warehouse?.[0]?.warehouse_name || '-'} />
        <DetailField label="Is Manager Review Needed" value={details?.is_manager_review_needed ? 'Needed' : 'Not Needed' || '-'} />
        <DetailField label="Is Customer Review Needed" value={details?.is_customer_review_needed ? 'Needed' : 'Not Needed' || '-'} />
        <DetailField label="Guidelines" value={details?.guide_lines?.join(', ') || '-'} />

        <TitleWithButton label={'Add Participants'} onPress={() => { navigation.navigate('AddParticipants', { id }) }} />

        <FlatList
          data={participants}
          renderItem={({ item }) => (
            <Text>{item.assignee_name}</Text>
          )}
          keyExtractor={(item, index) => item.assignee_id || index.toString()}
        />

        <TitleWithButton label={'Updates'} onPress={() => setIsModalVisible(true)} />

        <DocumentModal
          visible={isModalVisible}
          title="Files"
          onClose={() => setIsModalVisible(false)}
          setDocumentUrl={(url) => {
            handleDocumentUploads(url);
          }}
        />
        {kpiDocument && kpiDocument?.length > 0 && (
          <UploadsContainer
            documentUrls={kpiDocument || []}
            onDelete={handleDeleteDocument}
          />
        )}

        {/* Rendering updates */}
        <FlatList
          data={kpiUpdates}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <KPIUpdateList item={item} />
          )}
          showsVerticalScrollIndicator={false}
        />

        <View style={{ flexDirection: 'row', marginVertical: 5, padding: 1 }}>
          <Button
            width={'50%'}
            backgroundColor={COLORS.brightBlue}
            onPress={() => {
              setActionToPerform('start');
              setIsStartModalVisible(true);
            }}
            disabled={isTaskStarted || isTaskCompleted}
            title={(
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <AntDesign name="rightcircle" size={20} color={COLORS.white} />
                <Text style={{
                  marginLeft: 8,
                  fontSize: 16,
                  color: COLORS.white,
                  fontFamily: FONT_FAMILY.urbanistSemiBold,
                }}>Start</Text>
              </View>
            )}
          />
          <View style={{ width: 5 }} />
          <Button
            width={'50%'}
            backgroundColor={COLORS.yellow}
            onPress={() => {
              setActionToPerform('pause');
              setIsPauseModalVisible(true);
            }}
            disabled={!isTaskStarted || isTaskCompleted}
            title={(
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <AntDesign name="pausecircle" size={20} color={COLORS.white} />
                <Text style={{
                  marginLeft: 8,
                  fontSize: 16,
                  color: COLORS.white,
                  fontFamily: FONT_FAMILY.urbanistSemiBold,
                }}>Pause</Text>
              </View>
            )}
          />
        </View>

        <View style={{ flexDirection: 'row', marginVertical: 5, padding: 1 }}>
          <Button
            width={'50%'}
            backgroundColor={COLORS.brightBlue}
            onPress={() => {
              setActionToPerform('reAssign');
              setIsAssignModalVisible(true);
            }}
            disabled={details?.progress_status !== 'Ongoing'}
            title={(
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <AntDesign name="reload1" size={20} color={COLORS.white} />
                <Text style={{
                  marginLeft: 8,
                  fontSize: 16,
                  color: COLORS.white,
                  fontFamily: FONT_FAMILY.urbanistSemiBold,
                }}>Re-Assign</Text>
              </View>
            )}
          />
          <View style={{ width: 5 }} />
          <Button
            width={'50%'}
            backgroundColor={COLORS.green}
            onPress={() => {
              setActionToPerform('complete');
              setIsCompleteModalVisible(true);
            }}
            disabled={details?.progress_status !== 'Ongoing'}
            title={(
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <AntDesign name="checkcircleo" size={20} color={COLORS.white} />
                <Text style={{
                  marginLeft: 8,
                  fontSize: 16,
                  color: COLORS.white,
                  fontFamily: FONT_FAMILY.urbanistSemiBold,
                }}>Complete</Text>
              </View>
            )}
          />
        </View>

        {/* Modals */}
        <UpdatesModal
          isVisible={isModalVisible}
          header='Add Update'
          title={'Add Updates'}
          multiline
          numberOfLines={5}
          onClose={() => setIsModalVisible(!isModalVisible)}
          onSubmit={saveUpdates}
        />
        <ConfirmationModal
          isVisible={isStartModalVisible}
          onCancel={() => setIsStartModalVisible(false)}
          headerMessage='Please agree to the guidelines before starting this action, Do you agree?'
          onConfirm={handleStartTask}
        />
        <PauseModal
          isVisible={isPauseModalVisible}
          header='Pausing'
          title={'Reason'}
          multiline
          numberOfLines={2}
          onClose={() => setIsPauseModalVisible(!isPauseModalVisible)}
          onSubmit={handlePauseTask}
        />
        <ReAssignModal
          isVisible={isAssignModalVisible}
          header='Re-Assigning'
          onClose={() => setIsAssignModalVisible(!isAssignModalVisible)}
          onSubmit={handleReAssignTask}
        />
        <CompleteModal
          isVisible={isCompleteModalVisible}
          onCancel={() => setIsCompleteModalVisible(false)}
          headerMessage='Are you sure that you completed the task'
          onConfirm={handleCompleteTask}
        />
        <OverlayLoader visible={isLoading || isSubmitting} />
      </RoundedScrollContainer>
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
  listContainer: {
    position: 'relative',
    margin: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  pdf: {
    width: 100,
    height: 100,
  },
  deleteIconContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
});

export default KPIActionDetails;