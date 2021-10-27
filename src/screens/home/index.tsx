import React, { useState } from 'react';
import {
  SafeAreaView,
  Button,
  View,
  StyleSheet,
  Alert,
  Image,
  Text
} from 'react-native';

export default class home extends React.Component<any,any> {
    constructor(props: any) {
        super(props);
    }
    broadCastclick = () => {
        this.props.navigation.navigate('Broadcast');
    }
    watchClick = () => {
      this.props.navigation.navigate('WatchBroadcast');

    }
  render() {
    return (
        <View style={[styles.container, {
          // Try setting `flexDirection` to `"row"`.
          flexDirection: "column"
        }]}>
          <View style={{ flex: 0.1 }} />
          <View style={styles.logocontainer}>
            <Image
              style={styles.logo}
              source={require('../../../image/logo.png')}
            />
            <Text style={{fontSize:20,paddingTop:"5%"}}> {"CONUSMA"}</Text>
          </View>
          <View style={styles.buttoncontainer}>
            <View style={{}}>
            <Button
              onPress={this.broadCastclick}
              title="Start Meeting"
              color="#007bff"
            />
            </View>
            <View style={{paddingTop:"10%"}}>
            <Button
              onPress={this.watchClick}
              title="Join Meeting"
              color="#6c757d"
            />
            </View>
          
          </View>
          <View style={{ flex: 1 }} />
    
        </View>
      );
  }
}
const styles = StyleSheet.create({
    container: {
      backgroundColor: '#ffffff',
      justifyContent: 'space-between',
      height: '100%',
      flex: 1
    },
    logo: {
      alignItems:'center'
    },
    logocontainer: {
      flex:3,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttoncontainer: {
      flex:3,
      justifyContent: 'center',
      alignItems: 'center',
    }
  });
