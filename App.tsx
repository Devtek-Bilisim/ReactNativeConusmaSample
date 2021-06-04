/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import Conusma from 'react-native-conusma';
import React, {useState} from 'react';
import {
   SafeAreaView,
   Button,
   View,
   StyleSheet,
   Alert
 } from 'react-native';
 import {
  RTCView,
  MediaStream
} from 'react-native-webrtc';

 const App = () => {
   var conusma = new Conusma("a2bdd634-4cf3-4add-9834-d938f626dd20", { apiUrl: "https://emscloudapi.com:7788" });

   const [localStream, setLocalStream] = useState<MediaStream>();
   const startLocalStream = async () => {
    var user = await conusma.createUser();
    console.log(user.userInfo);

   }
   return (
    <SafeAreaView style={styles.container}>
      <Button title="Kamerayı aç ve akışa başla" onPress={startLocalStream} />
      <View style={styles.rtcview}>
        {localStream && (
          <RTCView style={styles.rtc} streamURL={localStream.toURL()} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#333',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  rtcview: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: 'black',
  },
  rtc: {
    width: '100%',
    height: '100%',
  },
});

 export default App;
