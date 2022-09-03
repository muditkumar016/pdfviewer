import React, { useState } from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { DarkTheme, DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import ThemeContext from './components/ThemeContext';

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#694fad',
    accent: '#f1c40f',
  },
};

export default function Main() {
    const [themeIndex, setThemeIndex] = useState(1);
    const ThemeArray = [DarkTheme, DefaultTheme];
    return (
      <ThemeContext.Provider value = {setThemeIndex}>
        <PaperProvider theme={theme}>
          <App />
        </PaperProvider>
      </ThemeContext.Provider>
      
    );
  }
  
AppRegistry.registerComponent(appName, () => Main);
