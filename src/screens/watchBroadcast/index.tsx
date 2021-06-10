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
import { GuestUser } from 'react-native-conusma/build/guest-user';
import { Meeting } from 'react-native-conusma/build/meeting';
export default class watchBroadcast extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            localStream: MediaStream,
            setlocalstream: false,
        };

    }
    conusmaClass: Conusma;
    meeting: Meeting;
    user: GuestUser;
    meetingId: string = "";
    meetingPassword: string = "";
    meetingInviteCode: string = "";
    navigationListener:any = null;
    async watchBroadcast() {
        this.navigationListener =  this.props.navigation.addListener(
            'state',((navigationInfo:any)=>{
               var Name = navigationInfo.data.state.routes.name;
               if(Name != "WatchBroadcast")
               {
                   console.log("changee state");
                   if(this.meeting != null)
                   {
                       this.meeting.close();
                   }
                   this.navigationListener();
               }
            })
            
          );

        try {
            if (this.meetingInviteCode != "") {

                this.conusmaClass = new Conusma("a2bdd634-4cf3-4add-9834-d938f626dd20", { apiUrl: "https://emscloudapi.com:7788" });
                this.user = await this.conusmaClass.createGuestUser();
                this.meeting = await this.user.joinMeetingByInviteCode(this.meetingInviteCode);
                console.log("okk");
                //var stream = await activeMeeting.enableAudioVideo();
                //this.setState({ localStream: stream, setlocalstream: true });

            } else {
                if (this.meetingId != "" && this.meetingPassword != "") {

                }
            }
        } catch (error) {
            console.error(error);
            Alert.alert(error);
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
                    <View style={{}}>
                        <View>
                            <TextInput
                                style={{ borderWidth: 1, color: "#007bff" }}
                                placeholder="Meeting Id"
                                placeholderTextColor="black"
                                keyboardType="numeric"
                                onChangeText={(text) => { this.meetingId = text }}
                            />
                            <TextInput
                                style={{ borderWidth: 1, color: "#007bff" }}
                                placeholder="Meeting Password"
                                placeholderTextColor="black"
                                keyboardType="numeric"
                                onChangeText={(text) => { this.meetingPassword = text }}
                            />
                        </View>
                        <View style={styles.OR}>
                            <Text style={{ fontSize: 20 }}> {"OR"}</Text>
                        </View>
                        <View>
                            <TextInput
                                style={{ borderWidth: 1, color: "#007bff" }}
                                placeholder="Meeting Invite Code"
                                placeholderTextColor="black"
                                keyboardType="default"
                                onChangeText={(text) => { this.meetingInviteCode = text }}
                            />
                        </View>
                        <View style={{
                            marginTop: "1%"
                        }}>
                            <Button
                                onPress={(e) => this.watchBroadcast()}
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
    OR: {
        justifyContent: 'center',
        alignItems: 'center',
    },


});

