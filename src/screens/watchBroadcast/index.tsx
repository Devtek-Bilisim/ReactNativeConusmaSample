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
import { MeetingModel, MeetingStatusEnum } from 'react-native-conusma/build/Models/meeting-model';
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
    conusmaClass: Conusma;
    activeMeeting: Meeting;
    user: GuestUser;
    meetingId: string = "";
    meetingPassword: string = "";
    meetingInviteCode: string = "";
    navigationListener: any = null;
    async watchBroadcast() {
        this.navigationListener = this.props.navigation.addListener(
            'state', (async(navigationInfo: any) => {
                var Name = navigationInfo.data.state.routes.name;
                if (Name != "WatchBroadcast") {
                    if (this.activeMeeting != null) {
                        await this.activeMeeting.close(true);
                    }
                    this.navigationListener();
                }
            })
        );
        try {
            if (this.meetingInviteCode != "") {
                this.conusmaClass = new Conusma("cdde1505-23e1-439f-8fda-3e42b93365a1", { apiUrl: "https://emscloudapi.com" });
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
                    this.activeMeeting.conusmaWorker.meetingWorkerEvent.on('meetingUpdate', async () => {
                        var meeting = await this.activeMeeting.getMeetingInfo();
                        if (meeting.MeetingStatus == MeetingStatusEnum.end) {
                            Alert.alert("Host closed the meeting");
                            this.endMeeting();
                        }
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
            if (this.activeMeeting.connections.find(us => us.user.Id == user.Id) == null) {
                try {
                    if (user.Id != this.activeMeeting.activeUser.Id) {
                        var conenction = await this.activeMeeting.consume(user);
                        this.setState({ remoteStream: conenction.stream, setRemoteStream: true });
                    }

                } catch (error) {
                    if (error instanceof ConusmaException) {
                        //Alert.alert("error",error.message);
                    }
                    console.log(JSON.stringify(error));
                }


            }
        }
    }
    getMyProducerConnection()
    {
        try {
            return this.activeMeeting.connections.find(us => us.user.Id == this.activeMeeting.activeUser.Id);
        } catch (error) {
            console.log(JSON.stringify(error));
        }
        return null;
    }
    async SwitchCamera() {
        try {
            var myConnection = this.getMyProducerConnection();
            if (myConnection != null) {
                await myConnection.switchCamera();
                this.setState({ localStream: myConnection.stream, setlocalstream: true });
            }
        } catch (error) {

            console.log(JSON.stringify(error));
        }
    }
    async StartStopCamera() {
        try {
            var myConnection = this.getMyProducerConnection();
            if (myConnection != null) {
                var state = await myConnection.toggleVideo();
                if (myConnection.isVideoActive) {
                    this.setState({ startStopButtonText: "Stop CAM" });
                }
                else {
                    this.setState({ startStopButtonText: "Start CAM" });

                }
                this.setState({ localStream: myConnection.stream, setlocalstream: true });
            }
        } catch (error) {
            if (error instanceof ConusmaException) {
            }
            console.log(JSON.stringify(error));
        }
    }
    async StartStopMic() {
        try {
            var myConnection = this.getMyProducerConnection();
            if (myConnection != null) {
                await myConnection.toggleAudio();
                if (myConnection.isAudioActive) {
                    this.setState({ muteMicButtonText: "Mute Mic" });
                }
                else {
                    this.setState({ muteMicButtonText: "Start Mic" });
                }
                this.setState({ localStream: myConnection.stream, setlocalstream: true });
            }
        } catch (error) {
            if (error instanceof ConusmaException) {
            }
            console.log(JSON.stringify(error));
        }
    }
    async deleteUsers(producermeetingUsers: MeetingUserModel[]) {

        for (var user_it = 0; user_it < this.activeMeeting.connections.length; user_it++) {
            var deleteUser = this.activeMeeting.connections[user_it].user;
            if (producermeetingUsers.find(us => us.Id == deleteUser.Id) == null) {
                if (this.activeMeeting.connections[user_it].user.Id != this.activeMeeting.activeUser.Id) {
                    await this.activeMeeting.closeConsumer(this.activeMeeting.connections[user_it]);
                    this.setState({});

                }
            }
        }
    }
    changeSpeakerBluetooth()
    {
        if (this.activeMeeting != null && this.state.setRemoteStream) {
            this.activeMeeting.setSpeaker(false,true);
        }
    }
    changeSpeaker() {
        try {
            if (this.activeMeeting != null && this.state.setRemoteStream) {
                this.activeMeeting.setSpeaker(!this.activeMeeting.speakerState);
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
            if (this.activeMeeting.connections.find(us => us.user.Id == this.activeMeeting.activeUser.Id) == null) {
                var localstream = await this.activeMeeting.enableAudioVideo();
                await this.activeMeeting.produce(localstream);
                this.setState({ sendStreamDisable: true });
                this.setState({ muteMicButtonText: "Mute Mic" });
                this.setState({ startStopButtonText: "Stop CAM" });

            }

        }
    }
    async stopSendLocalStream() {
        try {
            if (this.activeMeeting != null) {
                if (this.activeMeeting.connections.find(us => us.user.Id == this.activeMeeting.activeUser.Id) != null) {
                    await this.activeMeeting.closeProducer();
                    this.setState({ sendStreamDisable: false });
                }
            }
        } catch (error) {
            console.log(JSON.stringify(error));
        }

    }
    async endMeeting() {
        try {
            if (this.navigationListener != null) {
                this.navigationListener();
                if (this.activeMeeting != null) {
                    await this.activeMeeting.close(true);
                     this.props.navigation.navigate('Home');
                }
            }
        } catch (error) {
            Alert.alert("error", "cannot close properly");
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
                        {this.activeMeeting != null && this.activeMeeting.connections.map((item, key) => (
                            <RTCView key={key} objectFit='cover' style={styles.childRtcView} streamURL={item.stream.toURL()} />
                        )
                        )}


                    </ScrollView>
                </View>
                <View style={styles.mainVideoArea}>
                    <View style={{ position: "absolute", right: 0, zIndex: 3 }}>
                        <Button
                            onPress={(e) => this.SwitchCamera()}
                            title="Switch Camera"
                            color="#007bff"
                        />
                    </View>
                    <View style={{ position: "absolute", left:0, zIndex: 3 }}>
                        <Button
                            onPress={(e) => this.changeSpeakerBluetooth()}
                            title="connect Bluetooth"
                            color="#007bff"
                        />
                    </View>
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
                            {!this.state.sendStreamDisable &&

                                <Button
                                    onPress={(e) => this.sendLocalStream()}
                                    title={"Send Local Stream"}
                                    color="#007bff"

                                />
                            }
                            {this.state.sendStreamDisable &&
                                <Button
                                    onPress={(e) => this.stopSendLocalStream()}
                                    title={"Stop Local Stream"}
                                    color="#007bff"

                                />
                            }
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

