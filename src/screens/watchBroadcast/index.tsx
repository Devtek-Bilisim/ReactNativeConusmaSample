import React, { useState } from 'react';
import {
    Button,
    View,
    StyleSheet,
    Text,
    Alert,
    TextInput
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import {
    RTCView,
    MediaStream
} from 'react-native-webrtc';
import Conusma from 'react-native-conusma';
import { MeetingModel } from 'react-native-conusma/build/Models/meeting-model';
import { User } from 'react-native-conusma/build/user';
export default class watchBroadcast extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            localStream: MediaStream,
            setlocalstream: false,
            meetingId: String,
            meetingPassword: String,
            meetingInvCode: String
        };

    }
    conusmaClass: Conusma;
    meeting: MeetingModel;
    user: User;
    meetingId: string = " Doldur";
    async start() {
        try {

            this.conusmaClass = new Conusma("a2bdd634-4cf3-4add-9834-d938f626dd20", { apiUrl: "https://emscloudapi.com:7788" });
            this.user = await this.conusmaClass.createUser();
            this.meeting = await this.user.getProfileMeeting();
            Clipboard.setString('hello world')
            var activeMeeting = await this.user.joinMeeting(this.meeting);
            var stream = await activeMeeting.enableAudioVideo();
            this.setState({ localStream: stream, setlocalstream: true });
        } catch (error) {
            console.error(error);
        }

    }
    copyMeetingIdAndPassword() {
        if (this.meeting != null) {
            var meetingString = "Meeting Id : " + this.meeting.MeetingId + "\n Meeting Password : " + this.meeting.Password;
            Clipboard.setString(meetingString);
            Alert.alert("", "Meeting id and password copied");
        }


    }
    copyMeetingInvCode() {
        if (this.meeting != null) {
            var meetingString = this.meeting.InviteCode;
            Clipboard.setString(meetingString);
            Alert.alert("", "Meeting invite code copied");
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
                    <View style={{ }}>
                        <View>
                            <TextInput
                                style={{ borderWidth: 1, color: "#007bff" }}
                                placeholder="Meeting Id"
                                placeholderTextColor="black"
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={{ borderWidth: 1, color: "#007bff" }}
                                placeholder="Meeting Password"
                                placeholderTextColor="black"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.OR}>
                        <Text style={{fontSize:20}}> {"OR"}</Text>
                        </View>
                        <View>
                            <TextInput
                                style={{ borderWidth: 1, color: "#007bff" }}
                                placeholder="Meeting Invite Code"
                                placeholderTextColor="black"
                                keyboardType="default"
                            />
                        </View>
                        <View style={{ marginTop: "1%" 
        }}>
                                <Button
                                    onPress={(e) => this.copyMeetingInvCode()}
                                    title="WATCH Broadcast"
                                    color="#007bff"
                                />
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
        flex: 3.7,
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
    OR:{
        justifyContent: 'center',
        alignItems: 'center',
    },
  

});

