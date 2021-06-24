import React, { useState } from 'react';
import {
    Button,
    View,
    StyleSheet,
    Text,
    Alert,
    ScrollView,
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
import RtcView from '../../component/viewStream';
import { MeetingUserModel } from 'react-native-conusma/build/Models/meeting-user-model';
import { ConusmaException } from 'react-native-conusma/build/Exceptions/conusma-exception';
import { Connection } from 'react-native-conusma/build/connection';

export default class broadCast extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            localStream: MediaStream,
            setlocalstream: false,
            startButtonText: "Start BroadCast",
            muteMicButtonText: "Mute Mic",
            startStopButtonText: "Stop CAM",
            startButtonDisable: false
        };

    }

    conusmaClass: Conusma;
    meeting: MeetingModel;
    user: User;
    navigationListener: any = null;
    activeMeeting: Meeting;
    connections: Connection[] = [];
    myConnection:Connection;
    speakerEnablePlayer:boolean = false;
    async start() {
        try {
            this.setState({ startButtonDisable: true, startButtonText: "Please Wait" });
            this.navigationListener = this.props.navigation.addListener(
                'state', ((navigationInfo: any) => {
                    var Name = navigationInfo.data.state.routes.name;
                    if (Name != "Broadcast") {
                        if (this.activeMeeting != null) {
                            this.activeMeeting.close(true);
                            this.connections = [];
                            this.setState({ startButtonDisable: false, startButtonText: "Start BroadCast" });
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
            this.activeMeeting.open();
            this.activeMeeting.setSpeaker(true);
            var connection = await this.activeMeeting.produce(stream);
            this.connections.push(connection);
            this.myConnection = connection;
            this.setState({ startButtonDisable: true, startButtonText: "Live", localStream: stream, setlocalstream: true });
            var produermeetingUsers: MeetingUserModel[] = await this.activeMeeting.getProducerUsers();
            await this.connectUsers(produermeetingUsers);
            this.activeMeeting.conusmaWorker.meetingWorkerEvent.on('meetingUsers', async () => {
                var produermeetingUsers: MeetingUserModel[] = await this.activeMeeting.getProducerUsers();
                await this.connectUsers(produermeetingUsers);
                await this.deleteUsers(produermeetingUsers);
            });
        } catch (error) {
            if(error instanceof ConusmaException)
            {
                Alert.alert("error",error.message);
            }
            console.log(JSON.stringify(error));
        }
    }
    async connectUsers(produermeetingUsers: MeetingUserModel[]) {
        try {
            for (var user of produermeetingUsers) {
                if (this.connections.find(us => us.user.Id == user.Id) == null) {
                    var conenction = await this.activeMeeting.consume(user);
                    this.connections.push(conenction);
                    this.setState({ remoteStream: conenction.stream, setRemoteStream: true });
                }
            }
        } catch (error) {
            if(error instanceof ConusmaException)
            {
               // Alert.alert("error",error.message);
            }
            console.log(JSON.stringify(error));
        }
      
    }
    async deleteUsers(produermeetingUsers: MeetingUserModel[]) {
        try {
            for (var user_it = 0 ; user_it < this.connections.length;user_it++) {
                var deleteUser = this.connections[user_it].user;
                if (produermeetingUsers.find(us => us.Id == deleteUser.Id) == null) {
                    this.connections.splice(user_it, 1);
                    this.setState({});
                    this.activeMeeting.closeConsumer(this.connections[user_it]);
                }
            }
        }catch (error) {
            console.log(JSON.stringify(error));
        }
      
    }
    async SwitchCamera() {
        try {
            if (this.myConnection != null) {
                await this.myConnection.switchCamera();
                this.setState({ localStream: this.myConnection.stream, setlocalstream: true });
            }
        }catch (error) {
            if(error instanceof ConusmaException)
            {
                Alert.alert("error",error.message);
            }
            console.log(JSON.stringify(error));
        }
    }
    async StartStopCamera() {
        try {
            if (this.myConnection != null) {
                var state = await this.myConnection.toggleVideo();
                if (this.myConnection.isVideoActive) {
                    this.setState({ startStopButtonText: "Stop CAM" });
                }
                else {
                    this.setState({ startStopButtonText: "Start CAM" });

                }
                this.setState({ localStream: this.myConnection.stream, setlocalstream: true });
            }
        } catch (error) {
            if(error instanceof ConusmaException)
            {
                Alert.alert("error",error.message);
            }
            console.log(JSON.stringify(error));
        }
    }
    async StartStopMic() {
        try {
            if (this.myConnection != null) {
                 await this.myConnection.toggleAudio();
                if (this.myConnection.isAudioActive) {
                    this.setState({ muteMicButtonText: "Mute Mic" });
                }
                else {
                    this.setState({ muteMicButtonText: "Start Mic" });
                }
                this.setState({ localStream: this.myConnection.stream, setlocalstream: true });
            }
        } catch (error) {
            if(error instanceof ConusmaException)
            {
                Alert.alert("error",error.message);
            }
            console.log(JSON.stringify(error));
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
    changeSpeaker() {
        try {
            if (this.activeMeeting != null && this.state.setRemoteStream) {
                this.speakerEnablePlayer = !this.speakerEnablePlayer;
                this.activeMeeting.setSpeaker(this.speakerEnablePlayer);
            }

        } catch (error) {
            console.error(error);
        }
    }
    render() {
        return (
            <View style={[styles.container, {
                flexDirection: "column"
            }]}>

                <View style={styles.videoElementArea}>
                    <ScrollView horizontal={true}>
                        {this.connections.map((item:Connection, key) => (
                            <RTCView key={key} objectFit='cover' style={styles.childRtcView} streamURL={item.stream.toURL()} />
                        )
                        )}
                    </ScrollView>
                </View>
                <View style={styles.mainVideoArea}>
                    <View style={styles.rtcMainVideo}>
                        {this.state.setlocalstream && (
                            <RTCView style={styles.rtc} streamURL={this.state.localStream.toURL()} />
                        )}
                    </View>
                    <View style={{
                        position: "absolute",
                        right: 0,
                        bottom: 0,
                        zIndex: 2
                    }}>
                        <Button
                            onPress={(e) => this.changeSpeaker()}
                            title="change speaker"
                            color="#007bff"
                        />
                    </View>
                </View>

                <View style={styles.info}>
                    <View style={{ paddingTop: "3%" }}>
                        <Button
                            onPress={(e) => this.start()}
                            disabled={this.state.startButtonDisable}
                            title={this.state.startButtonText}
                            color="#007bff"
                        />

                    </View>
                    <View style={styles.row}>

                        <View style={styles.cameramicbutton}>
                            <Button
                                onPress={(e) => this.StartStopMic()}
                                title={this.state.muteMicButtonText}
                                color="#007bff"
                            />
                        </View>
                        <View style={styles.cameramicbutton}>
                            <Button
                                onPress={(e) => this.StartStopCamera()}
                                title={this.state.startStopButtonText}
                                color="#007bff"
                            />
                        </View>
                        <View style={styles.cameramicbutton}>
                            <Button
                                onPress={(e) => this.SwitchCamera()}
                                title="Switch Cam"
                                color="#007bff"
                            />
                        </View>


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
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingTop: "1%"
    },
    cameramicbutton: {
        paddingLeft: "1%",
        paddingRight: "1%"
    },
    mainVideoArea: {
        flex: 4,
        backgroundColor: "blue"
    },
    videoElementArea: {
        flex: 1,
        backgroundColor: "black",
        borderColor: "white", borderWidth: 1
    },
    childRtcView: {
        backgroundColor: 'black', width: 100, marginLeft: 10
    },
    rtcMainVideo: {
        backgroundColor: "black",
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
    }
});

