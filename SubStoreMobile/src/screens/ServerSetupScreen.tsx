import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch } from '../store';
import { checkServerConnection } from '../store/settingsSlice';
import { useTheme } from '../styles/theme';
import { Card, Button, Input, Toast } from '../components';
import { setupServer } from '../services/initialization';

export default function ServerSetupScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();

  const [serverUrl, setServerUrl] = useState('http://');
  const [serverToken, setServerToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });

  const handleConnect = async () => {
    if (!serverUrl || serverUrl === 'http://') {
      showToast('请输入服务器地址', 'error');
      return;
    }

    setLoading(true);
    const success = await setupServer(serverUrl, serverToken || undefined);
    setLoading(false);

    if (success) {
      showToast('连接成功', 'success');
      dispatch(checkServerConnection());
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } else {
      showToast('连接失败，请检查服务器地址', 'error');
    }
  };

  const showToast = (message: string, type: any) => {
    setToast({ visible: true, message, type });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="server-outline" size={64} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          连接到 Sub-Store 服务器
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          请输入您的 Sub-Store 后端服务器地址
        </Text>

        <Card>
          <Input
            label="服务器地址"
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="http://192.168.1.100:3000"
            keyboardType="url"
            autoCapitalize="none"
            leftIcon="link"
          />

          <Input
            label="访问令牌 (可选)"
            value={serverToken}
            onChangeText={setServerToken}
            placeholder="输入访问令牌"
            secureTextEntry
            leftIcon="key"
          />

          <Button
            title="连接"
            onPress={handleConnect}
            variant="primary"
            icon="log-in-outline"
            loading={loading}
            style={styles.connectButton}
          />
        </Card>

        <View style={styles.helpContainer}>
          <Text style={[styles.helpTitle, { color: colors.textSecondary }]}>
            如何获取服务器地址？
          </Text>
          <Text style={[styles.helpText, { color: colors.textTertiary }]}>
            1. 在您的设备上运行 Sub-Store 后端服务{'\n'}
            2. 默认端口为 3000{'\n'}
            3. 使用设备的 IP 地址和端口
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  connectButton: {
    marginTop: 8,
  },
  helpContainer: {
    marginTop: 32,
    padding: 16,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
