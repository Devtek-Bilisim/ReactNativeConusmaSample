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
        };

    }
    meetingUsers: RtcView[] = [];
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
                        this.meetingUsers=[];
                    }
                    this.navigationListener();
                }
            })
        );
        try {
            this.setState({ watchButtonText: "WAIT", watchButtonDisable: true });
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
                if (await this.activeMeeting.isApproved()) {
                    var produermeetingUsers: MeetingUserModel[] = await this.activeMeeting.getProducerUsers();
                    await this.connectUsers(produermeetingUsers);
                    this.setState({ watchButtonText: "LIVE", watchButtonDisable: true, sendStreamDisable: false });
                    this.activeMeeting.conusmaWorker.meetingWorkerEvent.on('meetingUsers',async ()=>{
                        var produermeetingUsers: MeetingUserModel[] = await this.activeMeeting.getProducerUsers();
                        await this.connectUsers(produermeetingUsers);
                        await this.deleteUsers(produermeetingUsers);

                    });
                }

            }
        } catch (error) {
            console.error(error);
            this.setState({ watchButtonText: "WATCH BROADCAST", watchButtonDisable: false });

        }

    }
    async connectUsers(produermeetingUsers: MeetingUserModel[]) {
        for (var user of produermeetingUsers) {
            if (this.meetingUsers.find(us => us.meetingUser.Id == user.Id) == null) {
               try {
                var stream = await this.activeMeeting.consume(user);
                var _rtcView = new RtcView(stream, user);
                this.meetingUsers.push(_rtcView);
                this.setState({ remoteStream: _rtcView.stream, setRemoteStream: true });
               } catch (error) {
                   
               }
               

            }
        }
    }
    async deleteUsers(produermeetingUsers: MeetingUserModel[]) {
        for (var user_it = 0 ; user_it < this.meetingUsers.length;user_it++) {
            var deleteUser = this.meetingUsers[user_it].meetingUser;
            if (produermeetingUsers.find(us => us.Id == deleteUser.Id) == null) {
                this.meetingUsers.splice(user_it, 1);
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
            console.error(error);
        }
    }
    async sendLocalStream() {
        if (this.activeMeeting != null) {
            if (this.meetingUsers.find(us => us.meetingUser.Id == this.activeMeeting.meetingUser.Id) == null) {
                var localstream = await this.activeMeeting.enableAudioVideo();
                var _rtcView = new RtcView(localstream, this.activeMeeting.meetingUser);
                this.meetingUsers.push(_rtcView);
                this.activeMeeting.open(localstream);
                this.setState({ sendStreamDisable: true });
            }

        }
    }
    render() {
        return (
            <View style={[styles.container, {
                flexDirection: "column"
            }]}>
                   <View style={styles.info}>
                    <View style={{}}>
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
                                disabled={this.state.watchButtonDisable}
                                color="#007bff"
                            />
                        </View>
                        <View style={{
                            marginTop: "1%"
                        }}>
                            <Button
                                onPress={(e) => this.sendLocalStream()}
                                title={this.state.sendStreamButtonText}
                                disabled={this.state.sendStreamDisable}
                                color="#007bff"
                            />
                        </View>

                    </View>
                </View>
                <View style={styles.videoElementArea}>
                    <ScrollView horizontal={true}>
                        {this.meetingUsers.map((item, key) => (
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
        flex: 2.2,
    },



});

