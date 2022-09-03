import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import RecentScreen from './components/RecentScreen';
import FavouriteScreen from './components/FavouriteScreen';
import FileScreen from './components/FileScreen';
import PdfViewer from './components/PdfViewer';
import SearchScreen from './components/SearchScreen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { PdfProvider } from './components/Context';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import RNBootSplash from "react-native-bootsplash";


const Tab = createMaterialBottomTabNavigator();

const Stack = createStackNavigator();

const BottomTab = () => {
  return (
    <Tab.Navigator
      lazy = {true}
      backBehavior = 'initialRoute'
      initialRouteName="Files"
      activeColor="#f0edf6"
      inactiveColor="#3e2465"
      barStyle={{ backgroundColor: '#694fad' }}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Recent') {
              return <MaterialIcons name='history' size={23} color={color} />;
          } else if (route.name === 'Files') {
              return <Icon name = 'file-pdf' size = {20} color = {color}/>
          }
          else {
              return <MaterialIcons name='favorite' size={20} color={color} />;
          }
        },
      })} 
      tabBarOptions={{
        safeAreaInsets: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }
      }}
    >
      <Tab.Screen name="Files" component={FileScreen} />
      <Tab.Screen name="Recent" component={RecentScreen} />
      <Tab.Screen name="Fav" component={FavouriteScreen} />
    </Tab.Navigator>
  )
}

const App = ({theme}) => {
  useEffect(() => {
    const init = async () => {
      // …do multiple sync or async tasks
      setTimeout(() => {}, 2000);
    };

    init().finally(async () => {
      await RNBootSplash.hide({ fade: true });
      console.log("Bootsplash has been hidden successfully");
    });
  }, []);

  return (
    <PdfProvider>
      <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name = "PDF Viewer" component = {BottomTab} options={{headerShown: false}}/>
          <Stack.Screen name = "Viewer" component = {PdfViewer} options={{headerShown: false}}/>
          <Stack.Screen name = "Search" component = {SearchScreen} options={{headerShown: false}}/>
        </Stack.Navigator>   
      </NavigationContainer>
      </SafeAreaProvider>
    </PdfProvider>
    
  );
}

export default App;
