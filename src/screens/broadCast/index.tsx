import React, { useState } from 'react';
import {
    Button,
    View,
    StyleSheet,
    Text,
    Alert
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import {
    RTCView,
    MediaStream
} from 'react-native-webrtc';
import Conusma from 'react-native-conusma';
import { MeetingModel } from 'react-native-conusma/build/Models/meeting-model';
import { User } from 'react-native-conusma/build/user';
import { Meeting } from 'react-native-conusma/build/meeting';
export default class broadCast extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            localStream: MediaStream,
            setlocalstream: false
        };

    }
    conusmaClass: Conusma;
    meeting: MeetingModel;
    user: User;
    navigationListener:any = null;
    activeMeeting:Meeting;
    async start() {
        try {

            this.navigationListener =  this.props.navigation.addListener(
                'state',((navigationInfo:any)=>{
                   var Name = navigationInfo.data.state.routes.name;
                   if(Name != "Broadcast")
                   {
                       if(this.meeting != null)
                       {
                           this.activeMeeting.close();
                       }
                       this.navigationListener();
                   }
                })
                
              );
            this.conusmaClass = new Conusma("a2bdd634-4cf3-4add-9834-d938f626dd20", { apiUrl: "https://emscloudapi.com:7788" });
            this.user = await this.conusmaClass.createUser();
            this.meeting = await this.user.getProfileMeeting();
             this.activeMeeting = await this.user.joinMeeting(this.meeting);
            var stream = await this.activeMeeting.enableAudioVideo();
            await this.activeMeeting.open(stream);
            this.setState({ localStream: stream, setlocalstream: true });
        } catch (error) {
            console.error(error);
        }

    }
    copyMeetingIdAndPassword() {
        if(this.meeting != null)
        {
            var meetingString = "Meeting Id : " + this.meeting.MeetingId + "\n Meeting Password : " + this.meeting.Password ;
            Clipboard.setString(meetingString);
            Alert.alert("","Meeting id and password copied");
        }
     

    }
    copyMeetingInvCode() {
        if(this.meeting != null)
        {
            var meetingString =  this.meeting.InviteCode ;
            Clipboard.setString(meetingString);
            Alert.alert("","Meeting invite code copied");
        }
       
    }
    render() {
        return (
            <View style={[styles.container, {
                flexDirection: "column"
            }]}>
                <View style={styles.rtcView}>
                    {this.state.setlocalstream && (
                        <RTCView style={styles.rtc} streamURL={this.state.localStream.toURL()} />
                    )}
                </View>
                <View style={styles.info}>
                    <View style={{ paddingTop: "3%" }}>
                        <Button
                            onPress={(e) => this.start()}
                            title="Start BroadCast"
                            color="#007bff"
                        />
                    </View>
                    <View style={{ paddingTop: "3%" }}>
                        <Text style={{}}> {"Meeting id : " + this.meeting?.MeetingId}</Text>
                        <Text style={{}}> {"Meeting password :" + this.meeting?.Password}</Text>
                        <View style={styles.buttoncontainer}>
                            <View>
                                <Button
                                    onPress={(e) => this.copyMeetingIdAndPassword()}
                                    title="Copy Meeting Id And Password"
                                    color="#6c757d"
                                />
                            </View>
                            <View style={{ marginTop: "1%" }}>
                                <Button
                                    onPress={(e) => this.copyMeetingInvCode()}
                                    title="Copy Meeting invite code"
                                    color="#6c757d"
                                />
                            </View>
                        </View>


                    </View>
                </View>


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
    rtcView: {
        flex: 4,
        backgroundColor: "black",
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
    },
    rtc: {
        width: '100%',
        height: '100%',
    },
    info: {
        flex: 3,
    },
    buttoncontainer: {
        justifyContent: 'center',
        alignItems: 'center',
    }
});

