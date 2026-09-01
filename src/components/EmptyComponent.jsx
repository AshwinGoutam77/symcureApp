import { View, Text, StyleSheet, Image } from 'react-native';
import Button from './common/Button';

export default function EmptyComponent({ text = "No data available", btnText, onBtnPress }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/no-data-image.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.text}>{text}</Text>

      <Button title={btnText || "Book an appointment"} onPress={onBtnPress} containerStyle={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FD',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 180,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000ff',
    textAlign: 'center',
    // marginTop: 20,
  },

  button: {
    marginTop: 20,
    paddingHorizontal: 20,
  }
});
