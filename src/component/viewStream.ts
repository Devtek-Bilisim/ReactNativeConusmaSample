import { MeetingUserModel } from 'react-native-conusma/build/Models/meeting-user-model';
import {
    RTCView,
    MediaStream
} from 'react-native-webrtc';
export default class ViewStream {

    stream:MediaStream;
    meetingUser:MeetingUserModel;
  constructor(_stream:MediaStream,_meetingUser:MeetingUserModel) {
    this.stream = _stream;
    this.meetingUser=_meetingUser;
  }

 
}
