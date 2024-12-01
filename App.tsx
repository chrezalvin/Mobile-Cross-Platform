import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Button, Image, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import { DownloadDirectoryPath, readFile, uploadFiles, writeFile } from 'react-native-fs';
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Geolocation, { GeolocationResponse } from "@react-native-community/geolocation";
import { addDoc, collection } from 'firebase/firestore';
import { firestoreDB, storage } from './fbConfig';
import { getDownloadURL, ref, uploadBytes, uploadString } from 'firebase/storage';
const noImage = require("./assets/no_img.jpg");

interface FBData {
  first: string;
  last: string;
  born: number;
  imageUrl?: string;
  lat?: number;
  long?: number;
}

export default function App() {
  const [uri, setUri] = useState<string | null>(null);
  const [coords, setCoords] = useState<GeolocationResponse["coords"] | null>(null);

  const addData = async() => {
    try{
      const data: FBData = {
        first: "Chrez",
        last: "Alvin",
        born: 2001,
      };

      // if uri is defined, add to storage first then use the download url
      if(uri){
        console.log("Uploading image to storage...");
        
        console.log(`reading file: ${uri}`);
        const ext = uri?.split(".").pop();
        const file = await fetch(uri);
        const fileBlob = await file.blob();
        
        const imgRef = ref(storage, `test-app/newImage.${ext}`);
        
        console.log("uploading file...");
        const imgUrl = await uploadBytes(imgRef, fileBlob, {contentType: `image/${ext}`});
        console.log("File uploaded to storage: " + imgUrl.ref.fullPath);
        
        data.imageUrl = await getDownloadURL(imgUrl.ref);

        console.log("Image uploaded to storage: " + data.imageUrl);
      }

      if(coords){
        data.lat = coords.latitude;
        data.long = coords.longitude;
      }

      const docRef = await addDoc(collection(firestoreDB, "users"), data);

      console.log("Document written with ID: ", docRef.id);
    }
    catch(err){
      console.error("Error adding document: ", err);
    }
  }
  
  const hasLocationPermission = async () => {
    // android below 23 doesn't need permission
    if(Platform.OS === "android" && Platform.Version < 23)
      return true;

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if(hasPermission)
      return true;

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if(status === PermissionsAndroid.RESULTS.GRANTED)
      return true;

    if(status === PermissionsAndroid.RESULTS.DENIED)
      console.log("Location Permission Denied by User");
    else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)
      console.log("Location Permission Revoked by User");

    return false;
  }
  
  const getLocation = async() => {
    const hasPermission = await hasLocationPermission();

    if(!hasPermission)
      return;

    Geolocation.setRNConfiguration({
      skipPermissionRequests: true,
    });

    Geolocation.getCurrentPosition((position) => {
      setCoords(position.coords);
    }, (error) => {
      console.error(`Code ${error.code}: ${error.message}`);
      console.log(error);
    }, {
      timeout: 15000,
      maximumAge: 10000,
      distanceFilter: 0,
      enableHighAccuracy: false,
    });

    // get location
  }

  const saveLocation = async (location: GeolocationResponse["coords"]) => {
    try{
      const path = `${DownloadDirectoryPath}/location.txt`;

      await writeFile(path, JSON.stringify(location), "utf8");

      console.log("Location saved to: " + path);
    }
    catch(e){
      console.error(e);
    }
  }

  const saveFile = async (filePath: string) => {
    try{
      // get image extension
      const ext = filePath?.split(".").pop();

      const path = `${DownloadDirectoryPath}/newImage.${ext}`;
      const file = await readFile(filePath, "base64");

      await writeFile(path, file, "base64");

      console.log("File saved to: " + path);
    }
    catch(e){
      console.error(e);
    }
  }

  const openImagePicker = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      },
      handleResponse
    )
  };

  const handleCameraLaunch = () => {
    launchCamera(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      },
      handleResponse
    );
  }

  const requestCameraPermission = async () => {
    try{
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera to take photos",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        
        if(granted === PermissionsAndroid.RESULTS.GRANTED){
          console.log("Camera Permission Granted");
          handleCameraLaunch();
        }
        else
          console.log("Camera Permission Denied");

    }
    catch(e){
      console.warn(e);
    }
  }

  const requestManageStoragePermission = async () => {

    try{
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "This app needs access to your storage to save images",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );

      if(uri){
        if(granted === PermissionsAndroid.RESULTS.GRANTED){
          console.log("Storage Permission Granted");
          await saveFile(uri);
        }
        else
          console.log("Storage Permission Denied");
      }

      if(coords){
        if(granted === PermissionsAndroid.RESULTS.GRANTED){
          console.log("Storage Permission Granted");
          await saveLocation(coords);
        }
        else
          console.log("Storage Permission Denied");
      }
    }
    catch(e){
      console.warn(e);
    }
  }

  const handleResponse = (response: ImagePickerResponse) => {
    if(response.didCancel)
      console.log("User cancelled image picker");
    else if(response.errorCode)
      console.log(`ImagePicker Error [${response.errorCode}]: ${response.errorMessage}`);
    else if(response.assets && response.assets.length > 0){
      const imgUri = response.assets[0].uri;

      if(imgUri){
        console.log("Image URI: " + imgUri);
        setUri(imgUri);
      }
      else
        console.log("No uri found in the response");
    }
    else
      console.log("No assets found in the response");
  }

  return (
    <View style={styles.container}>
      <Text>Chrealvin - 00000045606</Text>
      <Image source={uri ? {uri} : noImage} style={{width: 200, height: 200}}/>
      <Text>{coords ? `Lat: ${coords.latitude}, Long: ${coords.longitude}` : "No location"}</Text>
      <Button title="GET LOCATION" onPress={getLocation} />
      <Button title="OPEN CAMERA" onPress={requestCameraPermission} />
      <Button title="OPEN GALERY" onPress={openImagePicker} />
      <Button title="SAVE FILE" onPress={addData} />
      <Button title="CLEAR" onPress={() => setUri(null)} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
});
