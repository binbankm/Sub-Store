import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../store';
import { fetchSettings, updateSettings, checkServerConnection } from '../store/settingsSlice';
import { useTheme } from '../styles/theme';
import { Card, Button, Input, Modal, Toast, LoadingOverlay } from '../components';
import apiService from '../services/api';
import { setupServer } from '../services/initialization';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, theme, toggleTheme } = useTheme();
  
  const { data: settings, loading, serverConnected } = useSelector(
    (state: RootState) => state.settings
  );

  const [showServerModal, setShowServerModal] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [serverToken, setServerToken] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });

  useEffect(() => {
    loadSettings();
    checkConnection();
  }, []);

  const loadSettings = async () => {
    const result = await dispatch(fetchSettings());
    if (fetchSettings.fulfilled.match(result) && result.payload) {
      setServerUrl(apiService.getServerUrl());
    }
  };

  const checkConnection = async () => {
    await dispatch(checkServerConnection());
  };

  const handleSaveServer = async () => {
    if (!serverUrl) {
      showToast('请输入服务器地址', 'error');
      return;
    }

    const success = await setupServer(serverUrl, serverToken || undefined);
    if (success) {
      showToast('服务器配置成功', 'success');
      setShowServerModal(false);
      checkConnection();
    } else {
      showToast('服务器连接失败', 'error');
    }
  };

  const handleUpdateSetting = async (path: string, value: any) => {
    const keys = path.split('.');
    const updates: any = {};
    let current = updates;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    await dispatch(updateSettings(updates));
  };

  const showToast = (message: string, type: any) => {
    setToast({ visible: true, message, type });
  };

  const SettingItem = ({ 
    icon, 
    title, 
    value, 
    onPress, 
    showArrow = true,
    rightComponent 
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <View
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onTouchEnd={onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && (
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
            {value}
          </Text>
        )}
        {rightComponent}
        {showArrow && !rightComponent && (
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <LoadingOverlay visible={loading} />
      
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          服务器配置
        </Text>
        <Card>
          <SettingItem
            icon="server-outline"
            title="服务器地址"
            value={apiService.getServerUrl() || '未配置'}
            onPress={() => setShowServerModal(true)}
          />
          <SettingItem
            icon="wifi-outline"
            title="连接状态"
            showArrow={false}
            rightComponent={
              <View style={[
                styles.statusDot,
                { backgroundColor: serverConnected ? colors.success : colors.error }
              ]} />
            }
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          外观设置
        </Text>
        <Card>
          <SettingItem
            icon="moon-outline"
            title="深色模式"
            showArrow={false}
            rightComponent={
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={colors.switchTrack}
                thumbColor={colors.switchThumb}
              />
            }
          />
          <SettingItem
            icon="language-outline"
            title="语言"
            value="简体中文"
            onPress={() => {}}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          数据同步
        </Text>
        <Card>
          <SettingItem
            icon="cloud-upload-outline"
            title="同步到 Gist"
            onPress={() => {}}
          />
          <SettingItem
            icon="cloud-download-outline"
            title="从 Gist 同步"
            onPress={() => {}}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          其他
        </Text>
        <Card>
          <SettingItem
            icon="document-text-outline"
            title="日志"
            onPress={() => navigation.navigate('Logs' as never)}
          />
          <SettingItem
            icon="sync-outline"
            title="同步管理"
            onPress={() => navigation.navigate('Sync' as never)}
          />
          <SettingItem
            icon="information-circle-outline"
            title="关于"
            value="v1.0.0"
            onPress={() => {}}
          />
        </Card>
      </View>

      <Modal
        visible={showServerModal}
        onClose={() => setShowServerModal(false)}
        title="服务器配置"
      >
        <Input
          label="服务器地址"
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="http://192.168.1.100:3000"
          keyboardType="url"
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
          title="保存并测试连接"
          onPress={handleSaveServer}
          variant="primary"
          icon="checkmark-circle"
          style={styles.saveButton}
        />
      </Modal>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Sub-Store Mobile v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 32,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  saveButton: {
    marginTop: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
  },
});
