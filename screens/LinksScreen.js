import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

export default function LinksScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Validar Titulo
        </Text>
      </View>
      <View style={styles.imageContainer}>
        <Image source={require('../assets/images/validation.png')}></Image>
      </View>
      <View style={styles.awaitingValidationContainer}>
        <Text style={styles.requestSentence}>
          Por favor aproximar do Sensor.
        </Text>
        <Text style={styles.awaitingSentence}>
          Aguardando...
        </Text>
      </View>
    </View>
  );
}

LinksScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleContainer:{
    paddingTop: 50,
    height: 100,
    alignItems:'center',
    justifyContent:'center',
  },
  title:{
    fontSize: 40,
  },
  imageContainer:{
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  awaitingValidationContainer:{
    marginTop: 50,
    height: 200,
    alignItems: 'center',
  },
  requestSentence:{
    fontSize: 25,
  },
  awaitingSentence:{
    fontSize: 35,
  },
});
