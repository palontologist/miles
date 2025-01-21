import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {  Text,  Button, SafeAreaView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';


import { signUp } from '../src/auth'
import { FormInput } from '~/components/FormInput';
import { GlaringSegment } from '~/components/GlaringSegment';


export default function Details() {
  const { name } = useLocalSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    try {
      await signUp(email, password);
      alert("Sign-up success! Please check your email for confirmation link.");
      router.replace('/todo');
    } catch (error) {
      console.error(error);
      alert(`Sign-up error: ${error}`);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Sign up' }} />
      <SafeAreaView style={styles.container}>
        <MotiView
          style={styles.logoContainer}
          from={{ translateY: 10, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{
            type: 'timing',
            duration: 1200,
            delay: 400,
          }}>
          <Image
            source={require('~/assets/logo.png')}
            resizeMode="contain"
            style={styles.logoImage}
          />
        </MotiView>
        <MotiView
          style={styles.formContainer}
          from={{ translateY: 10, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{
            type: 'timing',
            duration: 1200,
            delay: 800,
          }}>
          <GlaringSegment style={styles.segment}>
            <Text style={styles.heading}>Sign Up</Text>
            <FormInput placeholder="Email address" onChangeText={setEmail} value={email} />
            <FormInput placeholder="Password" secureTextEntry onChangeText={setPassword} value={password} />
            <Button title="Sign Up" onPress={handleSignUp} />
            <Text style={styles.text}>Already have an account?</Text>
            <TouchableOpacity style={styles.buttonSignUp} onPress={() => router.replace('/')}>
              <Text style={{ color: 'white' }}>Back to Login</Text>
            </TouchableOpacity>
          </GlaringSegment>
        </MotiView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'hsl(221 20% 11%)',
    justifyContent: 'center'
  },
  heading: {
    opacity: 0.8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
  },
  formContainer: {
    flex: 1,
    padding: 12,
  },
  segment: {
    margin: 24
  },
  buttonSignUp: {
    marginTop: 12,
  },
  text: {
    marginTop: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.6,
  },
  logoContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  logoImage: {
    width: 160,
    height: 160,
  },
});
