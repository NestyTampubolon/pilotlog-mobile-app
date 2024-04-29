import { View, Text, StatusBar, Button, Platform, Dimensions, StyleSheet, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'expo-camera';
import COLORS from '../../components/colors';

import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
const deviceHeight = Dimensions.get("window").height;
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Input from '../../components/Input';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BackgroundDefault from '../../components/background';
import { router } from 'expo-router';
import { authenticatedRequest } from '../Api/ApiManager';
import CustomModal from '../../components/CustomModal';
import Loader from '../../components/Loader';

export default function Page() {
    const { width, height } = Dimensions.get('window');
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const bottomSheetModalRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const snapPoints = ["35%", "48%"];
    function handleKeyModal() {
        bottomSheetModalRef.current?.present();
    }

    const [inputs, setInputs] = React.useState({
        codeKey: ''
    });

    const [errors, setErrors] = React.useState({
        codeKey: ''
    });


    const [modalVisible, setModalVisible] = useState(false);
    const [modeModal, setModeModal] = useState();
    const [messageModal, setMessageModal] = useState();


    const openModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };


    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = async ({ type, data }) => {
        setScanned(true);
        console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
        try {
            const response = await authenticatedRequest('/api/v1/trainee/enrollattendance', "POST", { keyAttendance: data });
            if (response.data.status == "success") {
                router.replace('trainee/signatureattendance')
            } else if (response.data.status == "failed") {
                console.log("Failed:", response.data.message);
                setModalVisible(true);
                setModeModal("failed");
                setMessageModal(response.data.message);
            } else if (response.data.status == "warning") {
                console.log("Warning:", response.data.message);
                setModalVisible(true);
                setModeModal("warning");
                setMessageModal(response.data.message);
            } else {
                console.error('Error fetching datass:');
            }
        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    const handleButton = async () => {
        try {
            setLoading(true);
            const response = await authenticatedRequest('/api/v1/trainee/enrollattendance', "POST", { keyAttendance : inputs.codeKey});
            if (response.data.status == "success") {
                router.replace(`trainee/signatureattendance/${response.data.attendanceDetailId}`)
            } else if (response.data.status == "failed") {
                console.log("Failed:", response.data.message);
                setModalVisible(true);
                setModeModal("failed");
                setMessageModal(response.data.message);
            } else if (response.data.status == "warning") {
                console.log("Warning:", response.data.message);
                setModalVisible(true);
                setModeModal("warning");
                setMessageModal(response.data.message);
            } else {
                console.error('Error fetching datass:');
            }
        } catch (error) {
            console.error('Error fetching data:', error.message);
        } finally {
            setLoading(false);
        }


    };

    const handleOnChange = (text, input) => {
        setInputs(prevState => ({ ...prevState, [input]: text }));
    };

    const handleError = (errorMessage, input) => {
        setErrors(prevState => ({ ...prevState, [input]: errorMessage }));
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Loader visible={loading} />
            <BottomSheetModalProvider>
                <View style={{ backgroundColor: COLORS.white, height: '100%' }}>
                    <StatusBar style='light' />
                    <BackgroundDefault />
                    <View style={{ paddingHorizontal: 20, paddingTop: 50 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Icon name="chevron-left" style={{ fontSize: 25, color: COLORS.white }} />
                            </TouchableOpacity>
                            <Text style={{ color: COLORS.white, fontSize: 17, textAlign: "center", paddingBottom: 40, fontWeight: 'bold' }}>Scan Barcode</Text>
                            <Text style={{ color: COLORS.white, fontSize: 17, textAlign: "center", paddingBottom: 40, fontWeight: 'bold' }}></Text>
                        </View>

                        <View style={{ alignItems: 'center' }}>
                            <Camera
                                style={{ width: width * 0.8, height: width * 1.2 }}
                                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                                type={Camera.Constants.Type.back}
                            />
                            {/* {scanned && <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />} */}
                            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', width: '100%', marginHorizontal: 50 }}>
                                <TouchableOpacity style={[styles.inputContainer, { borderColor: COLORS.darkBlue, marginTop: 12 }]} onPress={handleKeyModal}>
                                    <Text style={{ color: COLORS.darkBlue, fontSize: 12, fontWeight: 'bold' }}>Code Key</Text>
                                </TouchableOpacity>
                                {scanned && 
                                <TouchableOpacity style={[styles.inputContainer, { backgroundColor: COLORS.darkBlue, marginTop: 12 }]}  onPress={() => setScanned(false)} >
                                    <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: 'bold' }}>Scan Again</Text>
                                </TouchableOpacity>}
                                
                            </View>
                        </View>
                    </View>

                    {/* Modal */}
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                         <BottomSheetModal
                        ref={bottomSheetModalRef}
                        index={0}
                        snapPoints={snapPoints}
                        backgroundStyle={{ borderRadius: 50 }}
                        avoidKeyboard={true}
                    >
                        <View style={{ backgroundColor: 'white', padding: 16 }}>
                            <Text style={{ fontWeight: 'bold', justifyContent: 'center', textAlign: 'center' }}>Code Key</Text>
                            <Input placeholder="Enter your code key" iconName="qrcode-plus" label="Code Key"
                                onChangeText={text => handleOnChange(text, 'codeKey')}
                                error={errors.codeKey}
                                onFocus={() => {
                                    handleError(null, 'codeKey');
                                }}
                            />
                            <TouchableOpacity style={[styles.inputContainer, { backgroundColor: COLORS.darkBlue, marginTop: 12, textAlign: 'center' }]} onPress={handleButton}>
                                <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>Submit</Text>
                            </TouchableOpacity>
                            
                        </View>
                    </BottomSheetModal>
                    </KeyboardAvoidingView>
                    <CustomModal modeModal={modeModal} isVisible={modalVisible} onClose={closeModal} message={messageModal}/>
                </View>


            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        marginHorizontal: 20,
        height: 55,
        flexDirection: 'row',
        paddingHorizontal: 35,
        borderWidth: 0.5,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        maxHeight: deviceHeight * 0.4,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        width: '100%',
        padding: 20,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        alignItems: 'center',

    },
});