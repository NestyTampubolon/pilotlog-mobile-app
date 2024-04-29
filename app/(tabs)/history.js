import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import Svg, { Ellipse } from 'react-native-svg';
import COLORS from '../../components/colors';
import { StatusBar } from 'expo-status-bar';
import CardPilotClass from '../../components/CardPilotClass'
import BackgroundDefault from '../../components/background';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticatedRequest } from '../Api/ApiManager';
import { router } from 'expo-router';
import { formatDate, statusDate } from '../../components/utils';

export default function Page() {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [training, setTraining] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [mergedData, setMergedData] = useState([])

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await authenticatedRequest('/api/v1/trainee/getAllTraining', "GET");
  //       setData(response.data);
  //       setLoading(false);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   fetchData();
  // }, []);


  async function fetchUserInfo() {
    const storedUserInfo = await AsyncStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }
  useEffect(() => {
    fetchUserInfo();
  }, []);


  const fetchData = async () => {
    try {
      if (userInfo) {
        const response = await authenticatedRequest(`/api/v1/public/allattendance/${userInfo.id_users}`, "GET");
        setData(response.data);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const fetchValid = async () => {
    try {
      if (userInfo) {
        const response = await authenticatedRequest(`/api/v1/public/validation/${userInfo.id_users}`, "GET");
        setData(response.data);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchValid();
  }, [userInfo]);

  const fetchTraining = async () => {
    try {
      if (userInfo) {
        const response = await authenticatedRequest(`/api/v1/public/training`, "GET");
        setTraining(response.data); 
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchTraining();
  }, [userInfo]);


  useEffect(() => {
    // Lakukan penggabungan data di sini
    const mergedDataArray = [];
    training.forEach(trainingItem => {
      const matchingData = data.find(dataItem => dataItem.idAttendance.id_trainingclass.id_trainingclass === trainingItem.id_trainingclass);
      if (matchingData) {
        mergedDataArray.push({
          trainingShortName: trainingItem.short_name,
          trainingId: trainingItem.id_trainingclass,
          validTo: matchingData.idAttendance.valid_to
        });
      } else {
        mergedDataArray.push({
          trainingShortName: trainingItem.short_name,
          trainingId: trainingItem.id_trainingclass,
          validTo: null
        });
      }
    });
    setMergedData(mergedDataArray);
  }, [data, training]);

  useEffect(() => {
    console.log("daftar data");
    if (data && data.length > 0) {
      data.forEach((item) => {
        if (item.idAttendance.id_trainingclass) {
          console.log(item.idAttendance.id_trainingclass.id_trainingclass);
          console.log(item.idAttendance.id_trainingclass.name);
          console.log(item.idAttendance.valid_to);
          console.log(item.idAttendance.status);
        }
      });
    }
  }, [data]);

  useEffect(() => {
    if (training && training.length > 0) {
      console.log("daftar training");
      training.forEach((item) => {
        if (item.id_trainingclass) {
          console.log(item.id_trainingclass);
          console.log(item.name);
        }
      });
    }
  }, [training]);


  const renderItem = ({ item }) => {
    const handlePress = () => {
      router.push({ pathname: `trainee/classhistory/${item.trainingId}`, params: { name: item.trainingShortName } });
    };

    return (
      <CardPilotClass
        text={item.trainingShortName}
        subtext={item.validTo ? `${formatDate(item.validTo)}` : ''}
        status={`${statusDate(item.validTo)}`}
        showIcon={false}
        onPress={handlePress}
      />
    );
  };


  return (
    <View style={{ backgroundColor: COLORS.white, height: "100%" }}>
      <StatusBar style='light' />
      <BackgroundDefault />
      <ScrollView style={{ paddingHorizontal: 20, paddingTop: 50 }}>
        <Text style={{ color: COLORS.white, fontSize: 17, textAlign: "center", paddingBottom: 40, fontWeight: 'bold' }}>History Class</Text>
        <FlatList
          scrollEnabled={false}
          data={mergedData}
          renderItem={renderItem}
          keyExtractor={(item) => item.trainingId.toString()}
        />
        {/* <FlatList
          scrollEnabled={false}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_attendancedetail.toString()}
        /> */}
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
})
