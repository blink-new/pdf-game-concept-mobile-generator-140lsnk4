import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { blink } from '@/lib/blink';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';

export function AuthDebug() {
  const [authState, setAuthState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setAuthState(state);
      console.log('Debug - Auth state:', state);
    });
    return unsubscribe;
  }, []);

  const testAuth = async () => {
    try {
      setError(null);
      console.log('Testing authentication...');
      const result = await blink.auth.me();
      console.log('Auth test result:', result);
    } catch (err: any) {
      console.error('Auth test error:', err);
      setError(err.message || 'Unknown error');
    }
  };

  const forceLogin = async () => {
    try {
      setError(null);
      console.log('Forcing login...');
      await blink.auth.login();
    } catch (err: any) {
      console.error('Force login error:', err);
      setError(err.message || 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth Debug</Text>
      
      <Text style={styles.label}>Auth State:</Text>
      <Text style={styles.value}>
        {authState ? JSON.stringify(authState, null, 2) : 'Loading...'}
      </Text>

      {error && (
        <>
          <Text style={styles.label}>Error:</Text>
          <Text style={styles.error}>{error}</Text>
        </>
      )}

      <View style={styles.buttons}>
        <Button title="Test Auth" onPress={testAuth} variant="outline" />
        <Button title="Force Login" onPress={forceLogin} variant="primary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.cardBackground,
    margin: 16,
    borderRadius: 12,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 4,
  },
  error: {
    color: '#ff6b6b',
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});