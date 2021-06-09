import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home';
import BroadCastScreen from '../screens/broadCast';
const Stack = createStackNavigator();

export default class AppNavigationContainer extends React.Component {
  render() {
    return (
        <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Welcome'}}
          />
           <Stack.Screen
            name="BroadCast"
            component={BroadCastScreen}
            options={{ title: 'BroadCast'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
      );
  }
}



