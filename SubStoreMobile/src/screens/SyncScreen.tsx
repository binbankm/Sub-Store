import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { syncAllArtifacts } from '../store/artifactSlice';
import { useTheme } from '../styles/theme';
import { Card, Button, Toast, LoadingOverlay } from '../components';
import apiService from '../services/api';

export default function SyncScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();

  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    lastSync: null as string | null,
    isSyncing: false,
  });

  const handleSyncToGist = async () => {
    setLoading(true);
    try {
      const response = await apiService.syncToGist();
      if (response.status === 'success') {
        showToast('同步到 Gist 成功', 'success');
        setSyncStatus({
          ...syncStatus,
          lastSync: new Date().toISOString(),
        });
      } else {
        showToast('同步失败: ' + (response.message || '未知错误'), 'error');
      }
    } catch (error) {
      showToast('同步失败', 'error');
    }
    setLoading(false);
  };

  const handleSyncFromGist = async () => {
    setLoading(true);
    try {
      const response = await apiService.syncFromGist();
      if (response.status === 'success') {
        showToast('从 Gist 同步成功', 'success');
        setSyncStatus({
          ...syncStatus,
          lastSync: new Date().toISOString(),
        });
      } else {
        showToast('同步失败: ' + (response.message || '未知错误'), 'error');
      }
    } catch (error) {
      showToast('同步失败', 'error');
    }
    setLoading(false);
  };

  const handleSyncAllArtifacts = async () => {
    setLoading(true);
    const result = await dispatch(syncAllArtifacts());
    setLoading(false);

    if (syncAllArtifacts.fulfilled.match(result)) {
      showToast('所有制品同步成功', 'success');
    } else {
      showToast('同步失败', 'error');
    }
  };

  const showToast = (message: string, type: any) => {
    setToast({ visible: true, message, type });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <LoadingOverlay visible={loading} />
      
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <Card>
        <View style={styles.cardHeader}>
          <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Gist 同步</Text>
        </View>
        
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          将您的订阅配置同步到 GitHub Gist，以便在不同设备间共享配置
        </Text>

        <View style={styles.syncInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              上次同步: {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : '从未同步'}
            </Text>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <Button
            title="上传到 Gist"
            onPress={handleSyncToGist}
            variant="primary"
            icon="cloud-upload-outline"
            style={styles.button}
          />
          <Button
            title="从 Gist 下载"
            onPress={handleSyncFromGist}
            variant="outline"
            icon="cloud-download-outline"
            style={styles.button}
          />
        </View>
      </Card>

      <Card>
        <View style={styles.cardHeader}>
          <Ionicons name="code-working-outline" size={24} color={colors.secondary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>制品同步</Text>
        </View>
        
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          同步所有制品的最新内容，确保您的订阅链接始终是最新的
        </Text>

        <Button
          title="同步所有制品"
          onPress={handleSyncAllArtifacts}
          variant="primary"
          icon="sync-outline"
          style={styles.fullButton}
        />
      </Card>

      <Card>
        <View style={styles.cardHeader}>
          <Ionicons name="settings-outline" size={24} color={colors.info} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>同步设置</Text>
        </View>
        
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          配置自动同步选项，需要在设置页面中配置 Gist Token
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>自动同步</Text>
            <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
              启用后将自动定期同步制品
            </Text>
          </View>
        </View>

        <Button
          title="前往设置"
          onPress={() => {}}
          variant="outline"
          icon="settings-outline"
          style={styles.fullButton}
        />
      </Card>

      <View style={styles.helpSection}>
        <Text style={[styles.helpTitle, { color: colors.textSecondary }]}>使用说明</Text>
        
        <View style={styles.helpItem}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={[styles.helpText, { color: colors.text }]}>
            在设置中配置 GitHub Gist Token
          </Text>
        </View>
        
        <View style={styles.helpItem}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={[styles.helpText, { color: colors.text }]}>
            上传配置会覆盖 Gist 中的现有内容
          </Text>
        </View>
        
        <View style={styles.helpItem}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={[styles.helpText, { color: colors.text }]}>
            下载配置会合并到本地配置中
          </Text>
        </View>
        
        <View style={styles.helpItem}>
          <Ionicons name="warning" size={16} color={colors.warning} />
          <Text style={[styles.helpText, { color: colors.text }]}>
            请妥善保管您的 Gist Token
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  syncInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  fullButton: {
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDesc: {
    fontSize: 14,
    marginTop: 4,
  },
  helpSection: {
    padding: 20,
    marginTop: 10,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
