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
import { MeetingUserModel } from 'react-native-conusma/build/Models/meeting-user-model';
import { ScrollView } from 'react-native-gesture-handler';
import RtcView from '../../component/viewStream';
import { ConusmaException } from 'react-native-conusma/build/Exceptions/conusma-exception';
import { Connection } from 'react-native-conusma/build/connection';
export default class watchBroadcast extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            remoteStream: MediaStream,
            setRemoteStream: false,
            watchButtonText: "WATCH BROADCAST",
            watchButtonDisable: false,
            sendStreamDisable: true,
            sendStreamButtonText: "Send Local Stream",
            muteMicButtonText: "Mute Mic",
            startStopButtonText: "Stop CAM",
        };

    }
    myConnection: Connection;
    connections: Connection[] = [];
    speakerEnablePlayer = false;
    conusmaClass: Conusma;
    activeMeeting: Meeting;
    user: GuestUser;
    meetingId: string = "";
    meetingPassword: string = "";
    meetingInviteCode: string = "";
    navigationListener: any = null;
    async watchBroadcast() {
        this.navigationListener = this.props.navigation.addListener(
            'state', ((navigationInfo: any) => {
                var Name = navigationInfo.data.state.routes.name;
                if (Name != "WatchBroadcast") {
                    if (this.activeMeeting != null) {
                        this.activeMeeting.close(true);
                        this.connections = [];
                    }
                    this.navigationListener();
                }
            })
        );
        try {
            if (this.meetingInviteCode != "") {
                this.conusmaClass = new Conusma("a2bdd634-4cf3-4add-9834-d938f626dd20", { apiUrl: "https://emscloudapi.com:7788" });
                this.user = await this.conusmaClass.createGuestUser();
                this.activeMeeting = await this.user.joinMeetingByInviteCode(this.meetingInviteCode);

            } else {
                if (this.meetingId != "" && this.meetingPassword != "") {
                    this.conusmaClass = new Conusma("a2bdd634-4cf3-4add-9834-d938f626dd20", { apiUrl: "https://emscloudapi.com:7788" });
                    this.user = await this.conusmaClass.createGuestUser();
                    this.activeMeeting = await this.user.joinMeeting(this.meetingId, this.meetingPassword);
                }
            }
            if (this.activeMeeting != null) {
                this.setState({ watchButtonText: "WAIT", watchButtonDisable: true });

                if (await this.activeMeeting.isApproved()) {
                    this.activeMeeting.open();
                    this.activeMeeting.setSpeaker(true);
                    var produermeetingUsers: MeetingUserModel[] = await this.activeMeeting.getProducerUsers();
                    await this.connectUsers(produermeetingUsers);
                    this.setState({ watchButtonText: "LIVE", watchButtonDisable: true, sendStreamDisable: false });
                    this.activeMeeting.conusmaWorker.meetingWorkerEvent.on('meetingUsers', async () => {
                        var produermeetingUsers: MeetingUserModel[] = await this.activeMeeting.getProducerUsers();
                        await this.connectUsers(produermeetingUsers);
                        await this.deleteUsers(produermeetingUsers);

                    });
                    return;
                }

            }
            else {
                return;
            }
        } catch (error) {
            if (error instanceof ConusmaException) {
                Alert.alert("error", error.message);
            }
            this.setState({ watchButtonText: "WATCH BROADCAST", watchButtonDisable: false });
            console.log(JSON.stringify(error));
        }

    }
    async connectUsers(produermeetingUsers: MeetingUserModel[]) {
        for (var user of produermeetingUsers) {
            if (this.connections.find(us => us.user.Id == user.Id) == null) {
                try {
                    var conenction = await this.activeMeeting.consume(user);
                    this.connections.push(conenction);
                    this.setState({ remoteStream: conenction.stream, setRemoteStream: true });
                } catch (error) {
                    if (error instanceof ConusmaException) {
                        //Alert.alert("error",error.message);
                    }
                    console.log(JSON.stringify(error));
                }


            }
        }
    }
    async SwitchCamera() {
        try {
            if (this.myConnection != null) {
                await this.myConnection.switchCamera();
                this.setState({ localStream: this.myConnection.stream, setlocalstream: true });
            }
        } catch (error) {

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
            if (error instanceof ConusmaException) {
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
            if (error instanceof ConusmaException) {
            }
            console.log(JSON.stringify(error));
        }
    }
    async deleteUsers(produermeetingUsers: MeetingUserModel[]) {
        for (var user_it = 0; user_it < this.connections.length; user_it++) {
            var deleteUser = this.connections[user_it].user;
            if (produermeetingUsers.find(us => us.Id == deleteUser.Id) == null) {
                this.connections.splice(user_it, 1);
                this.setState({});
                //this.activeMeeting.closeConsumer(deleteUser);
            }
        }
    }
    changeSpeaker() {
        try {
            if (this.activeMeeting != null && this.state.setRemoteStream) {
                this.speakerEnablePlayer = !this.speakerEnablePlayer;
                this.activeMeeting.setSpeaker(this.speakerEnablePlayer);
            }

        } catch (error) {
            if (error instanceof ConusmaException) {
                Alert.alert("error", error.message);
            }
            console.log(JSON.stringify(error));
        }
    }
    async sendLocalStream() {
        if (this.activeMeeting != null) {
            if (this.connections.find(us => us.user.Id == this.activeMeeting.activeUser.Id) == null) {
                var localstream = await this.activeMeeting.enableAudioVideo();
                this.myConnection = await this.activeMeeting.produce(localstream);
                this.connections.push(this.myConnection);
                this.setState({ sendStreamDisable: true });
            }

        }
    }
    endMeeting()
    {
        try {
            if(this.navigationListener != null)
            {
                this.navigationListener();
                if (this.activeMeeting != null) {
                    this.activeMeeting.close(true);
                    this.connections = [];
                    this.props.navigation.navigate('Home');
                }
            }
        } catch (error) {
            
        }
    }
    render() {
        return (
            <View style={[styles.container, {
                flexDirection: "column"
            }]}>
                {!this.state.watchButtonDisable &&
                    <View style={styles.info}>
                        <View >
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
                                    title={this.state.watchButtonText}
                                    color="#007bff"
                                />
                            </View>


                        </View>
                    </View>
                }

                <View style={styles.videoElementArea}>
                    <ScrollView horizontal={true}>
                        {this.connections.map((item, key) => (
                            <RTCView key={key} objectFit='cover' style={styles.childRtcView} streamURL={item.stream.toURL()} />
                        )
                        )}


                    </ScrollView>
                </View>
                <View style={styles.mainVideoArea}>
                    <View style={styles.rtcMainVideo}>
                        {this.state.setRemoteStream && (
                            <RTCView style={styles.rtc} streamURL={this.state.remoteStream.toURL()} />
                        )}
                    </View>

                </View>
                <View style={styles.streamButton}>
                    <View style={styles.row}>
                        
                        <View style={styles.marginButton}>
                            <Button
                                onPress={(e) => this.changeSpeaker()}
                                title="change speaker"
                                color="#007bff"
                            />
                        </View>
                      

                      
                        <View style={styles.marginButton}>
                            <Button
                                onPress={(e) => this.sendLocalStream()}
                                title={this.state.sendStreamButtonText}
                                disabled={this.state.sendStreamDisable}
                                color="#007bff"

                            />
                        </View>
                        <View style={styles.marginButton}>
                            <Button
                                onPress={(e) => this.StartStopMic()}
                                title={this.state.muteMicButtonText}
                                color="#007bff"
                            />
                        </View>
                        <View style={styles.marginButton}>
                            <Button
                                onPress={(e) => this.StartStopCamera()}
                                title={this.state.startStopButtonText}
                                color="#007bff"
                            />
                        </View>
                        <View style={styles.marginButton}>
                            <Button
                                onPress={(e) => this.endMeeting()}
                                title="End Meeting"
                                color="red"
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
    mainVideoArea: {
        flex: 4.7,
        backgroundColor: "blue"
    },
    videoElementArea: {
        flex: 1.2,
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
    },
    rtc: {
        width: '100%',
        height: '100%',
    },
    info: {
        flex: 1.5,
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingTop: "1%"
    },
    streamButton: {
        flex: 1.5,
        backgroundColor: "black"
    },
    marginButton: {
        margin: "1%"
    }



});

