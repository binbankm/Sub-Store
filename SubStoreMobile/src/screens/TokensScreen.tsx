import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../styles/theme';
import { Card, Button, Input, Modal, Toast, EmptyState, LoadingOverlay } from '../components';
import apiService from '../services/api';
import { Token } from '../types';
import { formatDate } from '../utils/helpers';
import { logger } from '../utils/logger';

const TOKEN_TYPE_LABELS: Record<Token['type'], string> = {
  sub: '订阅',
  col: '集合',
  file: '文件',
};

type ExpirationMode = 'none' | 'duration' | 'datetime';

export default function TokensScreen() {
  const { colors } = useTheme();

  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });
  const [newToken, setNewToken] = useState({
    type: 'sub' as Token['type'],
    name: '',
    token: '',
    expirationMode: 'none' as ExpirationMode,
    expiresIn: '',
    exp: '',
  });

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    setLoading(true);
    const response = await apiService.getTokens();
    if (response.status === 'success' && response.data) {
      setTokens(response.data);
    } else {
      showToast(response.message || '获取令牌失败', 'error');
    }
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTokens();
    setRefreshing(false);
  }, []);

  const handleAdd = async () => {
    if (!newToken.name) {
      showToast('请输入资源名称', 'error');
      return;
    }
    if (newToken.expirationMode === 'duration' && !newToken.expiresIn) {
      showToast('请输入过期时长', 'error');
      return;
    }
    if (newToken.expirationMode === 'datetime' && !newToken.exp) {
      showToast('请输入过期时间戳', 'error');
      return;
    }

    const payload = {
      type: newToken.type,
      name: newToken.name,
      token: newToken.token || undefined,
    };
    const options =
      newToken.expirationMode === 'duration'
        ? { mode: 'duration' as const, expiresIn: newToken.expiresIn }
        : newToken.expirationMode === 'datetime'
          ? { mode: 'datetime' as const, exp: newToken.exp }
          : undefined;

    const response = await apiService.createToken(payload, options);
    if (response.status === 'success') {
      logger.info(`Token created for ${newToken.type}/${newToken.name}`);
      showToast('令牌已创建', 'success');
      setShowAddModal(false);
      setNewToken({
        type: 'sub',
        name: '',
        token: '',
        expirationMode: 'none',
        expiresIn: '',
        exp: '',
      });
      loadTokens();
    } else {
      showToast(response.message || '创建失败', 'error');
    }
  };

  const handleDelete = (token: Token) => {
    Alert.alert(
      '删除令牌',
      `确定要删除 ${token.name} 的访问令牌吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const response = await apiService.deleteToken(token.token, token.type, token.name);
            if (response.status === 'success') {
              logger.info(`Token deleted for ${token.type}/${token.name}`);
              showToast('令牌已删除', 'success');
              loadTokens();
            } else {
              showToast(response.message || '删除失败', 'error');
            }
          },
        },
      ]
    );
  };

  const handleCopy = async (value: string) => {
    await Clipboard.setStringAsync(value);
    showToast('令牌已复制', 'success');
  };

  const showToast = (message: string, type: any) => {
    setToast({ visible: true, message, type });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LoadingOverlay visible={loading} />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <FlatList
        data={tokens}
        keyExtractor={(item) => `${item.type}-${item.name}-${item.token}`}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.tokenHeader}>
              <View style={styles.tokenTitle}>
                <Ionicons name="key-outline" size={18} color={colors.primary} />
                <Text style={[styles.tokenName, { color: colors.text }]}>
                  {item.name}
                </Text>
              </View>
              <View style={styles.tokenActions}>
                <Button
                  title="复制"
                  onPress={() => handleCopy(item.token)}
                  variant="outline"
                  size="small"
                  icon="copy-outline"
                />
                <Button
                  title="删除"
                  onPress={() => handleDelete(item)}
                  variant="danger"
                  size="small"
                  icon="trash-outline"
                />
              </View>
            </View>

            <View style={styles.tokenInfo}>
              <Text style={[styles.tokenLabel, { color: colors.textSecondary }]}>
                类型: {TOKEN_TYPE_LABELS[item.type]}
              </Text>
              <Text style={[styles.tokenLabel, { color: colors.textSecondary }]}>
                过期: {item.exp ? formatDate(item.exp) : '永久'}
              </Text>
            </View>

            <View style={[styles.tokenValue, { backgroundColor: colors.inputBg }]}>
              <Text style={[styles.tokenValueText, { color: colors.textTertiary }]}>
                {item.token}
              </Text>
            </View>
          </Card>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="key-outline"
            title="暂无令牌"
            message="创建访问令牌以分享订阅/集合/文件"
            actionTitle="创建令牌"
            onAction={() => setShowAddModal(true)}
          />
        }
      />

      <View style={styles.fabContainer}>
        <Button title="创建令牌" onPress={() => setShowAddModal(true)} icon="add" />
      </View>

      <Modal visible={showAddModal} onClose={() => setShowAddModal(false)} title="创建令牌">
        <View style={styles.typeSelector}>
          {(['sub', 'col', 'file'] as const).map(type => (
            <Button
              key={type}
              title={TOKEN_TYPE_LABELS[type]}
              onPress={() => setNewToken({ ...newToken, type })}
              variant={newToken.type === type ? 'primary' : 'outline'}
              style={styles.typeButton}
            />
          ))}
        </View>

        <Input
          label="资源名称"
          value={newToken.name}
          onChangeText={(text) => setNewToken({ ...newToken, name: text })}
          placeholder="例如: my-sub"
          leftIcon="document-text-outline"
        />

        <Input
          label="自定义 Token (可选)"
          value={newToken.token}
          onChangeText={(text) => setNewToken({ ...newToken, token: text })}
          placeholder="留空自动生成"
          leftIcon="key-outline"
        />

        <View style={styles.typeSelector}>
          {(['none', 'duration', 'datetime'] as const).map(mode => (
            <Button
              key={mode}
              title={mode === 'none' ? '不过期' : mode === 'duration' ? '时长' : '时间戳'}
              onPress={() => setNewToken({ ...newToken, expirationMode: mode })}
              variant={newToken.expirationMode === mode ? 'primary' : 'outline'}
              style={styles.typeButton}
            />
          ))}
        </View>

        {newToken.expirationMode === 'duration' && (
          <Input
            label="过期时长"
            value={newToken.expiresIn}
            onChangeText={(text) => setNewToken({ ...newToken, expiresIn: text })}
            placeholder="例如: 7d, 12h"
            leftIcon="time-outline"
          />
        )}

        {newToken.expirationMode === 'datetime' && (
          <Input
            label="过期时间戳(毫秒)"
            value={newToken.exp}
            onChangeText={(text) => setNewToken({ ...newToken, exp: text })}
            placeholder="例如: 1716888888888"
            keyboardType="numeric"
            leftIcon="calendar-outline"
          />
        )}

        <Button
          title="创建"
          onPress={handleAdd}
          variant="primary"
          icon="checkmark-circle"
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  tokenActions: {
    flexDirection: 'row',
    gap: 8,
  },
  tokenInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tokenLabel: {
    fontSize: 13,
  },
  tokenValue: {
    padding: 10,
    borderRadius: 8,
  },
  tokenValueText: {
    fontSize: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
  },
  fabContainer: {
    padding: 16,
  },
});
