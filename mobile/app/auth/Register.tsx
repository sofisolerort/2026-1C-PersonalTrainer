
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Link } from 'expo-router';

import { useRegister } from '../hooks/auth/useRegister';
import { authStyles } from './authStyle/AuthStyle';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';


export default function Register() {
  const { email, setEmail, password, setPassword, loading, signUpWithEmail } = useRegister();

  return (
    <View style={authStyles.container}>
      <View style={authStyles.card}>
        <Text style={authStyles.title}>Crear Cuenta</Text>
        <Text style={authStyles.subtitle}>Regístrate para empezar a entrenar</Text>

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
          title="Registrarme"
          loading={loading}
          onPress={signUpWithEmail}
        />
        
        <Link href="/auth/Login" asChild>
          <TouchableOpacity style={authStyles.link}>
            <Text style={authStyles.linkText}>
              ¿Ya tienes cuenta? <Text style={authStyles.linkTextBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}