// import TrackPlayer, {
//   Capability,
//   RepeatMode,
//   State,
// } from 'react-native-track-player';

// let isSetup = false;

// export const setupPlayer = async () => {
//   if (isSetup) return true;

//   try {
//     await TrackPlayer.setupPlayer();

//     await TrackPlayer.updateOptions({
//       capabilities: [Capability.Play, Capability.Stop],
//     });

//     isSetup = true;
//     return true;
//   } catch (e) {
//     console.log('TrackPlayer setup failed:', e);
//     return false;
//   }
// };

// export const startRinging = async () => {
//   const ready = await setupPlayer();

//   if (!ready) {
//     console.log('Player not ready ❌');
//     return;
//   }

//   try {
//     await TrackPlayer.reset();

//     await TrackPlayer.add({
//       id: 'ringtone',
//       url: require('../assets/ringtone.mp3'), // ⚠️ FIX PATH IF NEEDED
//       title: 'Incoming Call',
//       artist: 'Symcure',
//     });

//     // 🔥 IMPORTANT: wait before setting repeat
//     setTimeout(async () => {
//       try {
//         await TrackPlayer.setRepeatMode(RepeatMode.Track);
//         await TrackPlayer.play();
//       } catch (e) {
//         console.log('Play error:', e);
//       }
//     }, 300);
//   } catch (e) {
//     console.log('Start ringing error:', e);
//   }
// };

// export const stopRinging = async () => {
//   try {
//     const state = await TrackPlayer.getState();

//     if (state === State.Playing || state === State.Paused) {
//       await TrackPlayer.stop();
//     }

//     await TrackPlayer.reset();
//   } catch (e) {
//     console.log('Stop error:', e);
//   }
// };
