// @owner: ai
import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { HomePage } from './src/views/home';

export default function App() {
  return (
    <SafeAreaProvider>
      <HomePage />
      <StatusBar style="auto" />
      <Toast />
    </SafeAreaProvider>
  );
}
