import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { router, Stack, useLocalSearchParams, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import BackgroundDefault from '../../../components/background';
import COLORS from '../../../components/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CardTraining from '../../../components/CardTraining'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticatedRequest } from '../../Api/ApiManager';
import { formatDate } from '../../../components/utils';
import EmptyList from '../../../components/emptylist';

export default function classhistorypilot() {
  const { id, name, id_users } = useLocalSearchParams();
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      console.log(id_users);
      console.log(id, name, id_users);
      const response = await authenticatedRequest(`/api/v1/public/attendancedetailbyidtrainingclass/${id_users}/${id}`, "GET");
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderItem = ({ item }) => {


    return (
      <CardTraining
        text={` ${formatDate(item.idAttendance.date)} - ${formatDate(item.idAttendance.valid_to)}`}
        subtext={item.status}
        valid_to={item.idAttendance.valid_to}
        showIcon={false}
      />
    );
  };


  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style='light' />
      <BackgroundDefault />
      <View style={styles.contentContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ flex: 1 }}><Icon name="chevron-left" style={{ fontSize: 25, color: COLORS.white }} /></TouchableOpacity>
          <Text style={{ color: COLORS.white, fontSize: 17, textAlign: "center", paddingBottom: 40, fontWeight: 'bold', flex: 8 }}>{name}</Text>
          <Text style={{ flex: 1 }} ></Text>
        </View>  
        {data.length != 0 && <FlatList
          scrollEnabled={false}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_attendancedetail.toString()}
        />}  
        

        {data.length == 0 && <EmptyList/>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    height: '100%',
  },
  contentContainer: {
    paddingTop: 50,
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  box: {
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: COLORS.backColor,
    padding: 10,
    marginTop: 20,
    borderRadius: 10,
  },
  signatureContainer: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.black,
    marginTop: 20,
    overflow: 'hidden',
    zIndex: 1,
    borderStyle: 'dashed',
    padding: 10
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    zIndex: 1,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.darkBlue,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  preview: {
    width: 200,
    height: 114,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  previewText: {
    color: "#FFF",
    fontSize: 14,
    height: 40,
    lineHeight: 40,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#69B2FF",
    width: 120,
    textAlign: "center",
    marginTop: 10,
  },
});