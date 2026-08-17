// /* eslint-disable react-native/no-inline-styles */
// import React, {useEffect, useRef, useState} from 'react';

// import {View, TouchableOpacity, StyleSheet, AppState} from 'react-native';

// import {ZegoUIKitPrebuiltCall} from '@zegocloud/zego-uikit-prebuilt-call-rn';
// import ZegoExpressEngine from 'zego-express-engine-reactnative';

// import Ionicons from 'react-native-vector-icons/Ionicons';

// const appID = 734243580;

// const appSign =
//   '2790e8dc338f198369e54d609b5ce1c85f0eba66c9150ccb79b10b1d80ff0481';

// export default function VideoConsultationScreen({route, navigation}) {
//   const {userName = 'Patient', callID = 'appointment_1234'} =
//     route.params || {};

//   const userID = String(Math.floor(Math.random() * 100000));

//   const hasExited = useRef(false);

//   // UI states
//   const [micOn, setMicOn] = useState(true);
//   const [cameraOn, setCameraOn] = useState(true);
//   const [frontCamera, setFrontCamera] = useState(true);

//   const switchCamera = async () => {
//     try {
//       await ZegoExpressEngine.instance().useFrontCamera(!frontCamera);

//       setFrontCamera(!frontCamera);
//     } catch (e) {
//       console.log('Camera switch error', e);
//     }
//   };

//   const leaveCall = () => {
//     if (hasExited.current) return;

//     hasExited.current = true;

//     navigation.reset({
//       index: 0,
//       routes: [{name: 'MainTabs'}],
//     });
//   };

//   useEffect(() => {
//     const subscription = AppState.addEventListener('change', nextState => {
//       console.log('APP STATE:', nextState);

//       if (nextState === 'background') {
//         leaveCall();
//       }
//     });

//     return () => {
//       subscription.remove();
//     };
//   }, []);

//   return (
//     <View style={{flex: 1}}>
//       <ZegoUIKitPrebuiltCall
//         appID={appID}
//         appSign={appSign}
//         userID={userID}
//         userName={userName}
//         callID={callID}
//         // 🔥 REMOTE USER LEFT
//         onOnlySelfInRoom={() => {
//           console.log('Remote user left');
//         }}
//         config={{
//           scenario: {
//             mode: ZegoUIKitPrebuiltCall.OneONoneCall,
//           },

//           turnOnCameraWhenJoining: true,
//           turnOnMicrophoneWhenJoining: true,
//           useSpeakerWhenJoining: true,

//           showTextChat: true,

//           showMinimizeButton: false,
//           showLeavingView: false,

//           bottomMenuBarConfig: {
//             hideAutomatically: false,
//             buttons: [],
//           },
//         }}
//       />

//       <View style={styles.bottomBarWrapper}>
//         <View style={styles.bottomBar}>
//           {/* MIC */}
//           <TouchableOpacity
//             onPress={() => {
//               setMicOn(!micOn);
//             }}
//             style={styles.iconButton}>
//             <Ionicons name={micOn ? 'mic' : 'mic-off'} size={24} color="#000" />
//           </TouchableOpacity>

//           {/* CAMERA */}
//           <TouchableOpacity
//             onPress={() => {
//               setCameraOn(!cameraOn);
//             }}
//             style={styles.iconButton}>
//             <Ionicons
//               name={cameraOn ? 'videocam' : 'videocam-off'}
//               size={26}
//               color="#000"
//             />
//           </TouchableOpacity>

//           {/* SWITCH CAMERA */}
//           <TouchableOpacity onPress={switchCamera} style={styles.iconButton}>
//             <Ionicons name="camera-reverse" size={26} color="#000" />
//           </TouchableOpacity>

//           {/* END CALL */}
//           <TouchableOpacity onPress={leaveCall} style={styles.endCallButton}>
//             <Ionicons
//               name="call"
//               size={26}
//               color="#fff"
//               style={{
//                 transform: [{rotate: '135deg'}],
//               }}
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   bottomBarWrapper: {
//     position: 'absolute',
//     bottom: 35,
//     width: '100%',
//     alignItems: 'center',
//   },

//   bottomBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 18,
//     paddingVertical: 12,
//     borderRadius: 50,
//   },

//   iconButton: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 8,
//   },

//   endCallButton: {
//     width: 62,
//     height: 62,
//     borderRadius: 31,
//     backgroundColor: '#ff3b30',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 10,
//   },
// });

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function VideoConsultationScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Consultation</Text>
      <Text style={styles.subtitle}>
        Video consultation is temporarily unavailable.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#060D1F',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: '#7A879E',
    textAlign: 'center',
  },
});
