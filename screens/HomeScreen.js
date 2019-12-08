import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import images from '../assets/images/index.js';
import * as Location from 'expo-location';
import Svg, { Path } from 'react-native-svg'
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    SafeAreaView,
    FlatList
} from 'react-native';

import {
    responsiveFontSize,
    responsiveWidth
} from "react-native-responsive-dimensions";

import { MonoText } from '../components/StyledText';
import { TextInput, TouchableHighlight } from 'react-native-gesture-handler';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

const locations_json = require('../locations.json');
const all_stations = ['Alameda', 'Areeiro', 'Roma', 'Entrecampos', 'Campo Pequeno', 'Saldanha']
const green_stations = ['Telheiras', 'Campo Grande', 'Alvalade', 'Roma', 'Areeiro', 'Alameda', 'Anjos', 'Intendente', 'Martim Moniz', 'Rossio', 'Baixa-Chiado', 'Cais do Sodré', 'Alameda', 'Areeiro', 'Roma'];
const yellow_stations = ['Odivelas', 'Senhor Roubado', 'Ameixoeira', 'Lumiar', 'Quinta das Conchas', 'Campo Grande', 'Cidade Universitária', 'Entrecampos', 'Campo Pequeno', 'Saldanha', 'Picoas', 'Marquês de Pombal', 'Rato']
const red_stations = ['Aeroporto', 'Encarnação', 'Moscavide', 'Oriente', 'Cabo Ruivo', 'Olivais', 'Chelas', 'Bela Vista', 'Olaias', 'Alameda', 'Saldanha', 'São Sebastião']
const blue_stations = ['Reboleira', 'Amadora Este', 'Alfamelos', 'Pontinha', 'Carnide', 'Colégio Militar/Luz', 'Alto dos Moinhos', 'Laranjeiras', 'Jardim Zoológico', 'Praça de Espanha', 'São Sebastião', 'Parque', 'Marquês de Pombal', 'Avenida', 'Restauradores', 'Baixa-Chiado', 'Terreiro do Paço', 'Santa Apolónia']
const { width, height } = Dimensions.get('screen')

const DATA = [
    {
        id: '1',
        title: 'Alameda',
    },
    {
        id: '2',
        title: 'Areeiro',
    },
    {
        id: '3',
        title: 'Campo Pequeno',
    },
    {
        id: '4',
        title: 'Entrecampos',
    },
    {
        id: '5',
        title: 'Roma',
    },
    {
        id: '6',
        title: 'Saldanha',
    },
];


export default function HomeScreen(props) {
    const [latitude, setlatitude] = React.useState(null);
    const [longitude, setlongitude] = React.useState(null);
    const [locations, setLocations] = React.useState(locations_json);
    const [destination, setDestination] = React.useState(null);
    const [voyageOrigin, setVoyageOrigin] = React.useState(null);
    const [voyageDestination, setVoyageDestination] = React.useState(null);
    const [isVisible, setIsVisible] = React.useState({ isStationSelected: false, isInputSelected: false, isVoyageSelected: false, isMenuSelected: false, isSettingsSelected: false });
    const [typingOrigin, setTypingOrigin] = React.useState('');
    const [typingDestination, setTypingDestination] = React.useState('');
    const [data, setData] = React.useState(DATA)
    const [selectedInput, setSelecedInput] = React.useState('')
    React.useEffect(async () => {
        const { status } = await Permissions.getAsync(Permissions.LOCATION)
        if (status != 'granted') {
            const response = await Permissions.askAsync(Permissions.LOCATION)
        }
        navigator.geolocation.getCurrentPosition(
            ({ coords: { latitude, longitude } }) => { setlatitude(latitude), setlongitude(longitude) },
            (error) => console.log('Error:', error),
            { enableHighAccuracy: true, timeout: 50000, maximumAge: 1000 },
        )
    }, []);
    function onTextChangeOrigin(typingOrigin) {
        const new_data = DATA.filter(function (item) {
            const item_data = item.title.startsWith(typingOrigin) ? item : null
            return item_data
        })
        setData(new_data)
        setTypingOrigin(typingOrigin)
    }
    function onTextChangeDestination(typingDestination) {
        const new_data = DATA.filter(function (item) {
            const item_data = item.title.startsWith(typingDestination) ? item : null
            return item_data
        })
        setData(new_data)
        setTypingDestination(typingDestination)
    }
    function onMarkerPress(location) {
        setDestination(location)
        setIsVisible(prevState => {
            return { ...prevState, isStationSelected: true, isVoyageSelected: false, isMenuSelected: false, isSettingsSelected: false}
        })
    }
    function onMapPress() {
        setIsVisible(prevState => {
            return { ...prevState, isStationSelected: false, isVoyageSelected: false, isMenuSelected: false, isSettingsSelected: false }
        })
    }
    function onMenuPress(){
        setIsVisible(prevState => {
            return { ...prevState, isStationSelected: false, isVoyageSelected: false, isMenuSelected: true, isSettingsSelected: false }
        })
    }
    function onSettingsPress(){
        setIsVisible(prevState => {
            return { ...prevState, isStationSelected: false, isVoyageSelected: false, isMenuSelected: false, isSettingsSelected: true }
        })
    }
    function onClosePress() {
        setIsVisible(prevState => {
            return { ...prevState, isStationSelected: false, isVoyageSelected: false, isMenuSelected: false, isSettingsSelected: false }
        })
    }
    function onInputPressDestination() {
        setData(DATA)
        setIsVisible({ isStationSelected: false, isInputSelected: true, isVoyageSelected: false, isMenuSelected: false, isSettingsSelected: false })
        setSelecedInput('destination')
    }
    function onInputPressOrigin() {
        setData(DATA)
        setSelecedInput('origin')
    }
    function onArrowBackPress() {
        setIsVisible({ isStationSelected: false, isInputSelected: false, isVoyageSelected: false, isMenuSelected: false, isSettingsSelected: false })
        setSelecedInput('')
    }
    function onItemPress(title) {
        setData(null)
        selectedInput == 'destination' ? setTypingDestination(title) : setTypingOrigin(title)
    }
    function onSearchPress() {
        if (all_stations.includes(typingOrigin) && all_stations.includes(typingDestination) && (typingOrigin != typingDestination)) {
            setIsVisible({ isStationSelected: false, isInputSelected: false, isVoyageSelected: true, isMenuSelected: false, isSettingsSelected: false })
            locations.map((location, idx) => {
                const { station } = location
                if (station == typingOrigin) {
                    setVoyageOrigin(location)
                }
                else if (station == typingDestination) {
                    setVoyageDestination(location)
                }
            })
        }
    }
    function switchLines() {
        setDestination(prevState => {
            return {
                ...prevState, "end_station_top": destination.end_station_top_extra,
                "end_station_bot": destination.end_station_bot_extra,
                "arrival_times_top": {
                    "first": destination.arrival_times_top_extra.first_extra,
                    "second": destination.arrival_times_top_extra.second_extra,
                    "third": destination.arrival_times_top_extra.third_extra
                },
                "arrival_times_bot": {
                    "first": destination.arrival_times_bot_extra.first_extra,
                    "second": destination.arrival_times_bot_extra.second_extra,
                    "third": destination.arrival_times_bot_extra.third_extra
                },
                "end_station_top_extra": destination.end_station_top,
                "end_station_bot_extra": destination.end_station_bot,
                "arrival_times_top_extra": {
                    "first_extra": destination.arrival_times_top.first,
                    "second_extra": destination.arrival_times_top.second,
                    "third_extra": destination.arrival_times_top.third
                },
                "arrival_times_bot_extra": {
                    "first_extra": destination.arrival_times_bot.first,
                    "second_extra": destination.arrival_times_bot.second,
                    "third_extra": destination.arrival_times_bot.third
                }
            }
        });
    }
    function Item({ title }) {
        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() => onItemPress(title)}>
                <Text style={styles.title}>{title}</Text>
            </TouchableOpacity>
        );
    }
    renderStations = () => {
        return (
            <View>
                {
                    locations.map((location, idx) => {
                        const {
                            coords: { latitude, longitude }
                        } = location
                        const { station } = location
                        if (yellow_stations.includes(station) && red_stations.includes(station)) {
                            return (
                                <Marker key={idx}
                                    coordinate={{ latitude, longitude }}
                                    size={30}
                                    onPress={() => onMarkerPress(location)}>
                                    <Image source={require('../assets/images/yellow_red.png')} style={styles.markersStyle} />
                                </Marker>
                            )
                        }
                        else if (yellow_stations.includes(station) && green_stations.includes(station)) {
                            return (
                                <Marker key={idx}
                                    coordinate={{ latitude, longitude }}
                                    size={30}
                                    onPress={() => onMarkerPress(location)}>
                                    <Image source={require('../assets/images/yellow_green.png')} style={styles.markersStyle} />
                                </Marker>
                            )
                        }
                        else if (yellow_stations.includes(station) && blue_stations.includes(station)) {
                            return (
                                <Marker key={idx}
                                    coordinate={{ latitude, longitude }}
                                    size={30}
                                    onPress={() => onMarkerPress(location)}>
                                    <Image source={require('../assets/images/yellow_blue.png')} style={styles.markersStyle} />
                                </Marker>
                            )
                        }
                        else if (green_stations.includes(station) && red_stations.includes(station)) {
                            return (
                                <Marker key={idx}
                                    coordinate={{ latitude, longitude }}
                                    size={30}
                                    onPress={() => onMarkerPress(location)}>
                                    <Image source={require('../assets/images/green_red.png')} style={styles.markersStyle} />
                                </Marker>
                            )
                        }
                        else if (green_stations.includes(station) && blue_stations.includes(station)) {
                            return (
                                <Marker key={idx}
                                    coordinate={{ latitude, longitude }}
                                    size={30}
                                    onPress={() => onMarkerPress(location)}>
                                    <Image source={require('../assets/images/green_blue.png')} style={styles.markersStyle} />
                                </Marker>
                            )
                        }

            else if (red_stations.includes(station) && blue_stations.includes(station)){
              return(
                <Marker key = {idx}
                        coordinate = {{latitude, longitude}}
                        size = {30}
                        onPress = {() => onMarkerPress(location)}>
                  <Image source = {require('../assets/images/blue_red.png')} style = {styles.markersStyle}/>       
                </Marker>
              )
            }
            
            else if (yellow_stations.includes(station)){
              return(
                <Marker key = {idx}
                        coordinate = {{latitude, longitude}}
                        size = {30}
                        onPress = {() => onMarkerPress(location)}>
                  <Image source = {require('../assets/images/yellow.png')} style = {styles.markersStyle}/>       
                </Marker>
              )
            }
            else if (green_stations.includes(station)){
              return(
                <Marker key = {idx}
                        coordinate = {{latitude, longitude}}
                        onPress = {() => onMarkerPress(location)}>
                  <Image source = {require('../assets/images/green.png')} style = {styles.markersStyle}/>       
                </Marker>
              )
            }
            else if (red_stations.includes(station)){
              return(
                <Marker key = {idx}
                        coordinate = {{latitude, longitude}}
                        size = {30}
                        onPress = {() => onMarkerPress(location)}>
                  <Image source = {require('../assets/images/red.png')} style = {styles.markersStyle}/>       
                </Marker>
              )
            }
            else if (blue_stations.includes(station)){
              return(
                <Marker key = {idx}
                        coordinate = {{latitude, longitude}}
                        size = {30}
                        onPress = {() => onMarkerPress(location)}>
                  <Image source = {require('../assets/images/blue.png')} style = {styles.markersStyle}/>       
                </Marker>
              )
            }
          })
        }
      </View>
    )
  }
  renderPolylines = () =>{
    coordinates_yellow = []
    coordinates_blue = []
    coordinates_green = []
    coordinates_red = []
    return(
      <View>
        {
          locations_json.map((location,idx) => {
            const {
              coords : {latitude, longitude}
            } = location
            const {line} = location
            if ( line == 'yellow'){
              coordinates_yellow.push({latitude, longitude})
            }
            else if ( line == 'blue'){
              coordinates_blue.push({latitude, longitude})
            }
            else if ( line == 'red'){
              coordinates_red.push({latitude, longitude})
            }
            else{
              coordinates_green.push({latitude, longitude})
            }
          })
        }
        <Polyline
            coordinates={coordinates_yellow}
            strokeColor="#f7a800" // fallback for when `strokeColors` is not supported by the map-provider
            strokeWidth={6}
          />
          <Polyline
            coordinates={coordinates_green}
            strokeColor="#00a19b" // fallback for when `strokeColors` is not supported by the map-provider
            strokeWidth={6}
          />
          <Polyline
            coordinates={coordinates_red}
            strokeColor="#ea1d76" // fallback for when `strokeColors` is not supported by the map-provider
            strokeWidth={6}
          />
          <Polyline
            coordinates={coordinates_blue}
            strokeColor="#2f7de1" // fallback for when `strokeColors` is not supported by the map-provider
            strokeWidth={6}
          />
      </View>
      )
  }
  const SvgComponent = props => (
    <Svg viewBox="0 842.3 1080 236.7" {...props}>
      <Path
        d="M388.6 844.9c4.4 81.3 72.8 145.6 153.9 145 80.7-.6 147.9-65.2 151.7-146.1 176.4 0 352.7-.2 529.1-.5 143.2-.2 286.4-.6 429.5-1v260.9H-560.8V842.3c144.1-.1 288.3 0 432.4.3 172.4.5 344.7 1.2 517 2.3z"
        fill="#fff"
      />
    </Svg>
  )
  const component = SvgComponent({width: width , height: height * 0.08, position:'absolute', bottom:0})
  return (
    <View style={styles.container}>
      <MapView style={styles.mapStyle}
                initialRegion={{
                    latitude,
                    longitude,
                    latitudeDelta: 0.035,
                    longitudeDelta: 0.024,
                }}
                showsUserLocation = {true}
                followUserLocation = {true}
                showsMyLocationButton = {true}
                zoomEnabled = {true}
                onPress = {() => onMapPress()}>
          {renderStations()}
          {renderPolylines()}
      </MapView>
      {component}
      <View style={{ position: "absolute", width: width, height: height * 0.08, alignItems: 'center', bottom: 0, marginBottom: height * 0.045 }}>
            <TouchableOpacity onPress={() => props.navigation.navigate('Validation')} style={{ width: height * 0.09, height: height * 0.09, borderRadius: (height * 0.09) / 2, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' ,shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 3,
                },
                shadowOpacity: 0.27,
                shadowRadius: 4.65,

                elevation: 6,}}>
                <Ionicons
                    name={'md-wifi'}
                    size={responsiveWidth(12)}
                    color={'black'}>
                </Ionicons>
            </TouchableOpacity>
        </View>
        <View style={{ position: "absolute",backgroundColor: 'rgba(52, 52, 52, 0)', flexDirection: 'row', width: width, height: height * 0.08, bottom: 0 }}>
            <TouchableOpacity onPress={() => onMenuPress()} style={{ width: width * 0.33, height: height * 0.08, alignItems: 'flex-start', justifyContent: 'center', paddingLeft: width * 0.05 }}>
                <Ionicons
                    name={'md-menu'}
                    size={responsiveWidth(8)}
                    color={'black'}>
                </Ionicons>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSettingsPress()} style={{ width: width * 0.33, height: height * 0.08, alignItems: 'flex-end', justifyContent: 'center', marginLeft: width * 0.33, paddingRight: width * 0.05}}>
                <Ionicons
                    name={'md-more'}
                    size={responsiveWidth(8)}
                    color={'black'}>
                </Ionicons>
            </TouchableOpacity>
        </View>
        {isVisible.isMenuSelected ? <View style={styles.profileView}>
                                        <View style={{width: width, height: height * 0.1, flexDirection:'row'}}>
                                            <Image source={require('../assets/images/profile_picture.png')} style={{width: width * 0.2, height: height * 0.1,borderRadius: 50}}></Image>
                                            <View style={{ width: width * 0.6, height: height * 0.1, alignItems:'flex-start', justifyContent:'center'}}>
                                                <Text style={{width: width * 0.3, fontSize: responsiveFontSize(2,5), fontWeight: 'bold'}}>Mike Lewis</Text>
                                                <Text style={{fontSize: responsiveFontSize(2)}}>mike_lewis98@gmail.com</Text>
                                            </View>
                                            <View style={{width: width * 0.2,height: height * 0.1, alignItems:'center', justifyContent:'center'}}>
                                                <Ionicons
                                                    name={'md-close'}
                                                    size={responsiveWidth(9)}
                                                    onPress={() => onClosePress()}
                                                />
                                            </View>
                                        </View>
                                        <View style={{ width: width * 0.9, alignSelf:'flex-start',borderBottomColor: 'lightgrey', borderBottomWidth: 1, marginLeft: width * 0.02}}/>
                                        <TouchableOpacity onPress={() => props.navigation.navigate('Voyage')} style={{width: width, height: height * 0.07, flexDirection:'row'}}>
                                            <View style={{width: width * 0.2, height: height * 0.07, justifyContent:'center'}}>
                                                <Ionicons
                                                name={'md-card'}
                                                size={responsiveWidth(8)}
                                                color={'black'}
                                                style={{alignSelf:'center'}}>
                                                </Ionicons>
                                            </View>
                                            <View style={{ width: width * 0.8, height: height * 0.07, justifyContent:'center'}}>
                                                <Text style={{fontSize: responsiveFontSize(2)}}>Viagens</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <View style={{width: width, height: height * 0.07, flexDirection:'row'}}>
                                            <View style={{width: width * 0.2, height: height * 0.07, justifyContent:'center'}}>
                                                <Ionicons
                                                name={'md-document'}
                                                size={responsiveWidth(8)}
                                                color={'lightgrey'}
                                                style={{alignSelf:'center'}}>
                                                </Ionicons>
                                            </View>
                                            <View style={{ width: width * 0.8, height: height * 0.07, justifyContent:'center'}}>
                                                <Text style={{fontSize: responsiveFontSize(2), color:'lightgrey'}}>Documentos</Text>
                                            </View>
                                        </View>
                                        <View style={{width: width, height: height * 0.07, flexDirection:'row'}}>
                                            <View style={{width: width * 0.2, height: height * 0.07, justifyContent:'center'}}>
                                                <Ionicons
                                                name={'md-pricetags'}
                                                size={responsiveWidth(8)}
                                                color={'lightgrey'}
                                                style={{alignSelf:'center'}}>
                                                </Ionicons>
                                            </View>
                                            <View style={{ width: width * 0.8, height: height * 0.07, justifyContent:'center'}}>
                                                <Text style={{fontSize: responsiveFontSize(2), color:'lightgrey'}}>Descontos</Text>
                                            </View>
                                        </View>
                                        <View style={{width: width, height: height * 0.07, flexDirection:'row'}}>
                                            <View style={{width: width * 0.2, height: height * 0.07, justifyContent:'center'}}>
                                                <Ionicons
                                                name={'md-people'}
                                                size={responsiveWidth(8)}
                                                color={'lightgrey'}
                                                style={{alignSelf:'center'}}>
                                                </Ionicons>
                                            </View>
                                            <View style={{ width: width * 0.8, height: height * 0.07, justifyContent:'center'}}>
                                                <Text style={{fontSize: responsiveFontSize(2), color:'lightgrey'}}>Controlo Parental</Text>
                                            </View>
                                        </View>
                                    </View>
                                    :null}
        {isVisible.isSettingsSelected ? <View style={styles.settingsView}>
                                            <View style={{width:width, height: height *0.07, flexDirection:'row'}}>
                                                <View style={{width: width * 0.8, height: height * 0.07, alignItems:'flex-start', justifyContent: 'center'}}>
                                                    <Text style={{fontSize: responsiveFontSize(2), color:'lightgrey'}}>Help</Text>
                                                </View>
                                                <View style={{width : width * 0.2, height: height * 0.07, alignItems:'center', justifyContent: 'center'}}>
                                                    <Ionicons
                                                        name={'md-close'}
                                                        size={responsiveWidth(9)}
                                                        style={styles.closeStyle}
                                                        onPress={() => onClosePress()}
                                                    />
                                                </View>
                                            </View>
                                            <View style={{width: width * 0.8, height: height * 0.07, alignItems:'flex-start', justifyContent: 'center'}}>
                                                <Text style={{fontSize: responsiveFontSize(2), color:'lightgrey'}}>Feedback</Text>
                                            </View>
                                            <View style={{width: width * 0.8, height: height * 0.07, alignItems:'flex-start', justifyContent: 'center'}}>
                                                <Text style={{fontSize: responsiveFontSize(2), color:'lightgrey'}}>Privacy Policy and Terms of Service</Text>
                                            </View>
                                        </View>
                                        :null}
        {isVisible.isStationSelected ?
                <View style={styles.stationView}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: width }}>
                        <Text style={styles.stationName}>
                            {destination.station}
                        </Text>
                        {destination.isDouble ? <TouchableOpacity onPress={() => switchLines()}><Image source={require('../assets/images/switch.png')} style={{ flex: 1, resizeMode: 'contain', marginTop: height * 0.002 }}></Image></TouchableOpacity> : null}
                        <Image source={images[destination.rect_image]} style={{ flex: 1, resizeMode: 'contain' }}></Image>
                        <Ionicons
                            name={'md-close'}
                            size={responsiveWidth(9)}
                            style={styles.closeStyle}
                            onPress={() => onClosePress()}
                        />
                    </View>
                    <View style={styles.descText}>
                        <Text style={{ width: width * 0.3, fontSize: responsiveFontSize(2.5), fontWeight: "bold", alignSelf: 'flex-start' }}>Sentido:
                      </Text>
                        <Text style={{ width: width * 0.6, fontSize: responsiveFontSize(2.5), fontWeight: "bold", alignSelf: 'flex-start' }}>Tempos de chegada:
                      </Text>
                    </View>
                    <View style={styles.topLine}>
                        <Text style={styles.endStationTop}>
                            {destination.end_station_top}
                        </Text>
                        <Text style={styles.arrivalTimesTop}>
                            {destination.arrival_times_top.first}
                            <Text style={{ fontSize: responsiveFontSize(2) }}>min</Text>
                            {' '}{' '}{' '}{' '}{' '}{' '}
                            {destination.arrival_times_top.second}
                            <Text style={{ fontSize: responsiveFontSize(2) }}>min</Text>
                            {' '}{' '}{' '}{' '}{' '}{' '}
                            {destination.arrival_times_top.third}
                            <Text style={{ fontSize: responsiveFontSize(2) }}>min</Text>
                        </Text>
                    </View>
                    <View style={styles.botLine}>
                        <Text style={styles.endStationBot}>
                            {destination.end_station_bot}
                        </Text>
                        <Text style={styles.arrivalTimeBot}>
                            {destination.arrival_times_bot.first}
                            <Text style={{ fontSize: responsiveFontSize(2) }}>min</Text>
                            {' '}{' '}{' '}{' '}{' '}{' '}
                            {destination.arrival_times_bot.second}
                            <Text style={{ fontSize: responsiveFontSize(2) }}>min</Text>
                            {' '}{' '}{' '}{' '}{' '}{' '}
                            {destination.arrival_times_bot.third}
                            <Text style={{ fontSize: responsiveFontSize(2) }}>min</Text>
                        </Text>
                    </View>
                </View> : null}
        {isVisible.isInputSelected? <View style={styles.wholePageContainer}>
                                    <View style={styles.topContainer}>
                                      <View style={{flexDirection:"row"}}>
                                        <Ionicons
                                            name={'ios-arrow-back'}
                                            size={responsiveWidth(8)}
                                            color={'black'}
                                            style={{width: width * 0.06, marginTop: height * 0.08,paddingLeft: width * 0.02}}
                                            onPress={() => onArrowBackPress()}
                                        />
                                        <Ionicons
                                            name={'md-radio-button-off'}
                                            size={responsiveWidth(4)}
                                            color={'black'}
                                            style={{width: width * 0.06, marginTop: height * 0.09,paddingLeft: width * 0.02}}
                                        />
                                        <Ionicons
                                          name={'md-search'}
                                          size={responsiveWidth(8)}
                                          color={'white'}
                                          style={{width: width * 0.08, marginTop: height * 0.12, marginLeft: width * 0.75, paddingLeft: width * 0.01, alignItems:'center', backgroundColor:'white', borderWidth: 0.8,borderRadius: 100, borderColor: 'green',backgroundColor:'green'}}
                                          onPress={() => onSearchPress()}
                                        />
                                      </View>
                                      <Ionicons
                                            name={'md-radio-button-on'}
                                            size={responsiveWidth(4)}
                                            color={'black'}
                                            style={{width: width * 1, marginTop: height * 0.015,paddingLeft: width * 0.08}}
                                        />
                                      <View style={styles.SearchOriginContainer}>
                                        <Ionicons
                                          name={'md-search'}
                                          size={responsiveWidth(8)}
                                          color={'black'}
                                          style={{width: width * 0.1}}
                                        />
                                        <TextInput placeholder='Origem' style={styles.SearchDestinationInput} value={typingOrigin} onTouchStart={() => onInputPressOrigin()} onChangeText={typingOrigin => onTextChangeOrigin(typingOrigin)}>
                                        </TextInput>
                                      </View>
                                      <View style={styles.SearchDestinationContainer1}>
                                        <Ionicons
                                          name={'md-search'}
                                          size={responsiveWidth(8)}
                                          color={'black'}
                                          style={{width: width * 0.1}}
                                        />
                                        <TextInput placeholder='Destino' style={styles.SearchDestinationInput} value={typingDestination} onTouchStart={() => onInputPressDestination()} onChangeText={typingDestination => onTextChangeDestination(typingDestination)}>
                                        </TextInput>
                                      </View>
                                    </View>
                                    <View style={styles.botContainer}>
                                      <Text style={{width: width, paddingTop:height * 0.05, fontSize: responsiveFontSize(2.5), fontWeight: "bold",textAlign: 'center'}}>
                                        Estações
                                      </Text>
                    <SafeAreaView style={{ marginTop: Constants.statusBarHeight }}>
                        <FlatList
                            data={data}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <Item
                                    title={item.title}
                                />
                            )
                            }
                        />
                    </SafeAreaView>
                </View>
            </View>
                :
                    <View style={styles.SearchDestinationContainer2}>
                        <Ionicons
                            name={'md-search'}
                            size={30}
                            color={'black'}
                            style={{ width: width * 0.1 }}
                        />
                        <TextInput placeholder='Destino' style={styles.SearchDestinationInput} value={typingDestination} onTouchStart={() => onInputPressDestination()} onChangeText={typingDestination => onTextChangeDestination(typingDestination)}>
                        </TextInput>
                    </View>
            }
            {isVisible.isVoyageSelected ? <View>

                <View style={styles.VoyageContainer}>
                    <View style={{ width: width, height: height * 0.1, flexDirection: 'row', justifyContent: "space-between" }}>
                        <Text style={{ width: width * 0.4, fontSize: responsiveFontSize(2.5), fontWeight: 'bold' }}>Viagem</Text>
                        <Text style={{ width: width * 0.5, fontSize: responsiveFontSize(2.5), fontWeight: 'bold' }}>Tempo de chegada</Text>
                        <Ionicons
                            name={'md-close'}
                            size={35}
                            style={styles.closeStyle}
                            onPress={() => onClosePress()}
                        />
                    </View>
                    <View style={styles.topLineVoyage}>
                        <Text style={{ width: width * 0.3, fontSize: responsiveFontSize(2.5) }}>{voyageOrigin.station}</Text>
                        <Text style={styles.arrivalTimesTopVoyage}>
                            {Math.floor(voyageOrigin.arrival_times_top.first)}
                            <Text style={{ fontSize: responsiveFontSize(2) }}>min</Text>
                            {' '}{' '}{' '}{' '}{' '}{' '}
                            {Math.floor(voyageOrigin.arrival_times_top.second)}
                            <Text style={{ fontSize: responsiveFontSize(2) }}>min</Text>
                            {' '}{' '}{' '}{' '}{' '}{' '}
                            {Math.floor(voyageOrigin.arrival_times_top.third)}
                            <Text style={{ fontSize: responsiveFontSize(2) }}>min</Text>
                        </Text>
                    </View>
                    <View style={styles.botLineVoyage}>
                        <Text style={{ width: width * 0.3, fontSize: responsiveFontSize(2.5), }}>{voyageDestination.station}</Text>
                        <Text style={styles.arrivalTimeBotVoyage}>
                            {Math.floor(voyageOrigin.arrival_times_top.first + voyageDestination.arrival_times_bot.first)}
                            <Text style={{ fontSize: responsiveFontSize(2) }}>min</Text>
                            {' '}{' '}{' '}{' '}{' '}{' '}
                            {Math.floor(voyageOrigin.arrival_times_top.second + voyageDestination.arrival_times_bot.second)}
                            <Text style={{ fontSize: responsiveFontSize(2) }}>min</Text>
                            {' '}{' '}{' '}{' '}{' '}{' '}
                            {Math.floor(voyageOrigin.arrival_times_top.third + voyageDestination.arrival_times_bot.third)}
                            <Text style={{ fontSize: responsiveFontSize(2) }}>min</Text>
                        </Text>
                    </View>
                </View>
            </View>
                : null}
        </View>
    );
}

HomeScreen.navigationOptions = {
    header: null,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mapStyle: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    SearchOriginContainer: {
        width: width * 0.7,
        height: height * 0.06,
        marginTop: height * 0.07,
        alignSelf: 'center',
        alignItems: 'center',
        position: "absolute",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
        backgroundColor: "white",
        flexDirection: "row",
        paddingLeft: width * 0.02,
    },
    SearchDestinationContainer1: {
        width: width * 0.7,
        height: height * 0.06,
        marginTop: height * 0.16,
        alignSelf: 'center',
        alignItems: 'center',
        position: "absolute",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
        backgroundColor: "white",
        flexDirection: "row",
        paddingLeft: width * 0.02,
    },
    SearchDestinationContainer2: {
        width: width * 0.7,
        height: height * 0.06,
        marginTop: height * 0.07,
        alignSelf: 'center',
        alignItems: 'center',
        position: "absolute",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
        backgroundColor: "white",
        flexDirection: "row",
        paddingLeft: width * 0.02,
    },
    wholePageContainer: {
        flex: 1,
        width: width,
        height: height,
        backgroundColor: 'lightgrey',
        position: 'absolute',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
    },
    wholePageContainer2:{
        flex: 1,
        width: width,
        height: height,
        backgroundColor: 'rgba(0,0,0, 0)',
        position:'absolute',
    },
    topContainer: {
        width: width,
        height: height * 0.25,
        backgroundColor: 'white',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
    },
    botContainer: {
        width: width,
        height: height * 0.65,
        marginTop: height * 0.02,
        backgroundColor: 'white',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
    },
    item: {
        padding: width * 0.03,
        borderWidth: .2,
        backgroundColor: 'white',
    },
    title: {
        fontSize: responsiveFontSize(3),
    },
    SearchDestinationInput: {
        width: width * 0.5,
        height: height * 0.1,
        textAlign: 'center',
        fontSize: responsiveFontSize(2.7),
        paddingRight: width * 0.03,
    },
    markersStyle: {
        flex: 1,
        resizeMode: 'contain',
        width: width * 0.13,
        height: height * 0.05,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    stationView: {
        flex: 1,
        position: 'absolute',
        width: width * 1.05,
        height: height * 0.3,
        bottom: 0,
        paddingLeft: width * 0.05,
        backgroundColor: 'white',
        alignSelf: 'center',
        borderRadius: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
    },
    profileView: {
        flex: 1,
        position: 'absolute',
        width: width * 1.05,
        height: height * 0.4,
        bottom: 0,
        paddingLeft: width * 0.05,
        backgroundColor: 'white',
        alignSelf: 'center',
        borderRadius: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
    },
    settingsView: {
        flex: 1,
        position: 'absolute',
        width: width * 1.05,
        height: height * 0.25,
        bottom: 0,
        paddingLeft: width * 0.05,
        backgroundColor: 'white',
        alignSelf: 'center',
        borderRadius: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
    },
    stationName: {
        fontSize: responsiveFontSize(3),
        width: width * 0.4,
        fontWeight: "bold",
    },
    closeStyle: {
        width: width * 0.1,
    },
    endStationTop: {
        fontSize: responsiveFontSize(2.5),
        width: width * 0.3,
        alignSelf: 'flex-start',
    },
    endStationBot: {
        fontSize: responsiveFontSize(2.5),
        width: width * 0.3,
        alignSelf: 'flex-start',
    },
    descText: {
        flexDirection: 'row',
    },
    topLine: {
        paddingTop: height * 0.01,
        flexDirection: 'row',
    },
    botLine: {
        paddingTop: height * 0.01,
        flexDirection: 'row',
    },
    arrivalTimesTop: {
        width: width * 0.7,
        fontSize: responsiveFontSize(2.5),
        paddingLeft: width * 0.05,
        alignSelf: 'flex-start',
    },
    arrivalTimeBot: {
        width: width * 0.7,
        fontSize: responsiveFontSize(2.5),
        paddingLeft: width * 0.05,
        alignSelf: 'flex-start',
    },
    VoyageContainer: {
        flex: 1,
        position: 'absolute',
        width: width * 1.05,
        height: height * 0.3,
        bottom: 0,
        paddingLeft: width * 0.05,
        backgroundColor: 'white',
        alignSelf: 'center',
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
    },
    topLineVoyage: {
        width: width,
        paddingTop: height * 0.005,
        flexDirection: 'row',
    },
    botLineVoyage: {
        width: width,
        paddingTop: height * 0.02,
        flexDirection: 'row',
    },
    arrivalTimesTopVoyage: {
        width: width * 0.7,
        fontSize: responsiveFontSize(2.5),
        paddingLeft: width * 0.1,
    },
    arrivalTimeBotVoyage: {
        width: width * 0.7,
        fontSize: responsiveFontSize(2.5),
        paddingLeft: width * 0.1,
    },
});
