import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList, Modal, Pressable} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react'
import Svg, { Circle, } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import COLORS from '../../components/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CardTraining from '../../components/CardTraining'
import { useRouter, Link } from 'expo-router';
import { authenticatedRequest, IMAGE_BASE_URL } from '../Api/ApiManager';
import { formatDate } from '../../components/utils';
import CustomModal from '../../components/CustomModal';
import BackgroundHome from '../../components/backgroundhome';
import CardPilot from '../../components/CardPilot';
import profiles from '../../assets/profile.jpg';
export default function Page() {
    const router = useRouter();
    const [formattedDate, setFormattedDate] = useState('');
    const [formattedDay, setFormattedDay] = useState('');

    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [dataPending, setDataPending] = useState([]);
    const [binstructor, setBinstructor] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await authenticatedRequest('/api/v1/instructor/attendanceconfirmationdonebyinstructor', "GET");
                setData(response.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchDataPending = async () => {
            try {
                const response = await authenticatedRequest('/api/v1/instructor/attendancependingbyinstructor', "GET");
                setDataPending(response.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        };

        fetchDataPending();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await authenticatedRequest('/api/v1/public/getgradeinstructor', "GET");
                setBinstructor(response.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);



    useEffect(() => {
        const currentDate = new Date();
        const day = currentDate.getDate();
        const monthNumber = currentDate.getMonth();
        const year = currentDate.getFullYear();
        // Array yang berisi nama-nama bulan
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // Mengambil nama bulan dari array monthNames
        const monthName = monthNames[monthNumber];

        // Format tanggal ke dalam string
        const dateString = `${monthName} ${day}, ${year}`;

        const dayNames = [
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ];

        const dayOfWeek = currentDate.getDay();
        const dayName = dayNames[dayOfWeek];

        // Simpan hasilnya dalam state
        setFormattedDate(dateString);
        setFormattedDay(dayName);
    }, []);

    const getGreetingMessage = () => {
        const currentTime = new Date();
        const currentHour = currentTime.getHours();

        let greetingMessage = '';

        if (currentHour >= 5 && currentHour < 12) {
            greetingMessage = 'Good Morning';
        } else if (currentHour >= 12 && currentHour < 18) {
            greetingMessage = 'Good Day';
        } else if (currentHour >= 18 && currentHour < 22) {
            greetingMessage = 'Good Evening';
        } else {
            greetingMessage = 'Good Night';
        }

        return greetingMessage;
    };
    
    const renderItem = ({ item }) => {

        const handlePress = () => {
            router.push({ pathname: `instructor/historydetail/${item.id_attendance}`, params: { name: item.id_trainingclass.name } });
        };
        return (
            <CardTraining
                text={`${item.id_trainingclass.name} - ${formatDate(item.date)}`}
                onPress={handlePress}
            />
        );
    };

    const renderItemPending = ({ item }) => {

        const handlePress = () => {
            router.push({ pathname: `instructor/attendanceclass/${item.id_attendance}`, params: { name: item.id_trainingclass.name } });
        };

        return (
            <CardTraining
                text={`${item.id_trainingclass.name} - ${formatDate(item.date)}`}
                subtext={item.room}
                onPress={handlePress}
            />
        );
    };

    const renderItemInstructor = ({ item }) => {

        const handlePress = () => {
            router.push({ pathname: `cpts/pilotcrew/${item[0]}`, params: { name: item[2] } });
        };

        return (
            <CardPilot
                text={item[2]}
                subtext={`${item[3]} / 5`}
                onPress={handlePress}
                 images={item[1] ? { uri: IMAGE_BASE_URL + 'profile/' + item[1] } : profiles}

            />
        );
    };



    return (
        <View style={styles.container}>
            <StatusBar style='light' />
            <BackgroundHome />
            <ScrollView style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', paddingTop: 40 }}>
                    <View style={{ flex: 5 }}>
                        <Text style={{ color: COLORS.white, fontSize: 22, fontWeight: 'bold' }}>Hi, CPTS Nesty!</Text>
                        <Text style={{ color: COLORS.white, fontSize: 17 }}>{getGreetingMessage()}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', paddingVertical: 20 }}>
                    <View style={{ flex: 1 }}>
                        <Icon name="calendar-month-outline" style={{ fontSize: 45, color: COLORS.white }} />
                    </View>
                    <View style={{ flex: 5 }}>
                        <Text style={{ color: COLORS.white, fontSize: 14 }}>{formattedDay},</Text>
                        <Text style={{ color: COLORS.white, fontSize: 14 }}>{formattedDate}</Text>
                    </View>
                </View>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>Overview</Text>
                <View style={{ flexDirection: 'row', paddingTop: 10}}>
                    <View style={{ flex:1,  flexDirection: 'column', paddingVertical: 20, paddingHorizontal: 10, backgroundColor: COLORS.white, marginRight: 10, borderRadius:10}}>
                        <Text style={{ fontSize: 14 }}>Valid Pilots</Text>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>205/304</Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'column', paddingVertical: 20, paddingHorizontal: 10, backgroundColor: COLORS.white, borderRadius: 10, marginLeft: 10, }}>
                        <Text style={{ fontSize: 14 }}>Completing Training</Text>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>40</Text>
                    </View>
                </View>

                <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20 }}>Best Instructor</Text>
                <FlatList
                    scrollEnabled={false}
                    data={binstructor}
                    renderItem={renderItemInstructor}
                    keyExtractor={(item) => item[0].toString()}
                />
                

               
            </ScrollView>
           
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    box: {
        position: 'absolute'
    },
    icon: {
        fontSize: 30,
        color: 'white',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
})
