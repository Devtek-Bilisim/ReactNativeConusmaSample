import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home';
import BroadCastScreen from '../screens/broadCast';
import watchBroadcast from '../screens/watchBroadcast';
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
            name="Broadcast"
            component={BroadCastScreen}
            options={{ title: 'Meeting'}}
          />
           <Stack.Screen
            name="WatchBroadcast"
            component={watchBroadcast}
            options={{ title: 'Watch Meeting'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
      );
  }
}



