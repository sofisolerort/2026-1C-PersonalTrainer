// app/auth/Login.tsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Link } from 'expo-router';
import { authStyles } from './authStyle/AuthStyle';
import { CustomInput } from '../components/CustomInput';
import { useLogin } from '../hooks/auth/useLogin';
import { CustomButton } from '../components/CustomButton';


export default function Login() {
  const { email, setEmail, password, setPassword, loading, signInWithEmail } = useLogin();

  return (
    <View style={authStyles.container}>
      <View style={authStyles.card}>
        <Text style={authStyles.title}>¡Bienvenido!</Text>
        <Text style={authStyles.subtitle}>Inicia sesión para continuar</Text>

        <CustomInput
          label="Correo Electrónico"
          placeholder="ejemplo@correo.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <CustomInput
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <CustomButton 
          title="Ingresar" 
          loading={loading} 
          onPress={signInWithEmail} 
        />
        
        <Link href="/auth/Register" asChild>
          <TouchableOpacity style={authStyles.link}>
            <Text style={authStyles.linkText}>
              ¿No tienes cuenta? <Text style={authStyles.linkTextBold}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}