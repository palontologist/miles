import { Stack, Link, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { Button } from '~/components/Button';
import { ScreenContent } from '~/components/ScreenContent';
import { Image, SafeAreaView, StyleSheet, Text } from 'react-native';
import { GlaringSegment } from '~/components/GlaringSegment';
import { GlowingButton } from '~/components/GlowingButton';
import { GradientButton } from '~/components/GradientButton';
import { FormInput } from '~/components/FormInput';
import { signIn } from '~/src/auth';
import { supabase } from '../utils/supabase'; // Import supabase client

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // If a session exists, redirect to the todo screen
        router.replace('/todo');
      }
    };

    checkUserSession();
  }, []);

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      // Navigate to the /todo screen upon successful login
      router.push("/todo");
    } catch (error) {
      console.error(error);
      alert(`Login failed: ${error}`);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
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
            source={require('../assets/logo.png')}
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
            <Text style={styles.heading}>Welcome</Text>
            <FormInput placeholder="Email address" onChangeText={setEmail} value={email} />
            <FormInput placeholder="Password" secureTextEntry onChangeText={setPassword} value={password} />
            <Button title="Log in" onPress={handleLogin} />
            <Text style={styles.text}>New here?</Text>
            <Link href={{ pathname: '/details', params: { name: 'Dan' } }} asChild>
              <Button title="Create an account" />
            </Link>
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
  text: {
    marginTop: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.6,
  },
  heading: {
    opacity: 0.8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
  },
  segment: {
    margin: 24
  },
  logoContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  logoImage: {
    width: 160,
    height: 160,
  },
  formContainer: {
    flex: 1,
    padding: 12,
  },
  buttonSignUp: {
    marginTop: 12,
  },
});