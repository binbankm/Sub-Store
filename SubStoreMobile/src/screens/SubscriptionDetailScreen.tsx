import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../store';
import { fetchSubscriptions, updateSubscription, fetchFlowInfo } from '../store/subscriptionSlice';
import { useTheme } from '../styles/theme';
import { Card, Button, Input, Modal, Toast, LoadingOverlay } from '../components';
import { formatDate, formatBytes, TARGET_PLATFORMS } from '../utils/helpers';
import apiService from '../services/api';
import * as Clipboard from 'expo-clipboard';
import { TargetPlatform } from '../types';

export default function SubscriptionDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  
  const { name } = route.params as { name: string };
  const subscription = useSelector((state: RootState) =>
    state.subscriptions.items.find(sub => sub.name === name)
  );
  const flowInfo = useSelector((state: RootState) =>
    state.subscriptions.flowInfo[name]
  );

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editData, setEditData] = useState({
    displayName: '',
    url: '',
    ua: '',
    content: '',
  });
  const [previewContent, setPreviewContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<TargetPlatform>('ClashMeta');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subscription) {
      setEditData({
        displayName: subscription.displayName || '',
        url: subscription.url || '',
        ua: subscription.ua || '',
        content: subscription.content || '',
      });
      if (subscription.source === 'remote') {
        dispatch(fetchFlowInfo(name));
      }
    }
  }, [subscription]);

  const handleSave = async () => {
    setLoading(true);
    const result = await dispatch(updateSubscription({
      name,
      updates: {
        displayName: editData.displayName || undefined,
        url: editData.url || undefined,
        ua: editData.ua || undefined,
        content: editData.content || undefined,
      },
    }));
    setLoading(false);

    if (updateSubscription.fulfilled.match(result)) {
      showToast('保存成功', 'success');
      setShowEditModal(false);
    } else {
      showToast('保存失败', 'error');
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    const response = await apiService.preview(name, 'sub', selectedPlatform);
    setLoading(false);

    if (response.status === 'success' && response.data) {
      setPreviewContent(response.data);
      setShowPreviewModal(true);
    } else {
      showToast('预览失败', 'error');
    }
  };

  const handleCopyUrl = async () => {
    const url = `${apiService.getServerUrl()}/api/download/sub/${encodeURIComponent(name)}?target=${selectedPlatform}`;
    await Clipboard.setStringAsync(url);
    showToast('链接已复制', 'success');
  };

  const handleDelete = () => {
    Alert.alert(
      '删除订阅',
      `确定要删除订阅 "${subscription?.displayName || name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await apiService.deleteSubscription(name);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const showToast = (message: string, type: any) => {
    setToast({ visible: true, message, type });
  };

  if (!subscription) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>订阅不存在</Text>
      </View>
    );
  }

  const used = flowInfo ? flowInfo.upload + flowInfo.download : 0;
  const total = flowInfo?.total || 0;
  const progress = total > 0 ? used / total : 0;

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
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons
              name={subscription.source === 'remote' ? 'cloud' : 'document'}
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.title, { color: colors.text }]}>
              {subscription.displayName || subscription.name}
            </Text>
          </View>
          <View style={styles.actions}>
            <Button
              title="编辑"
              onPress={() => setShowEditModal(true)}
              variant="outline"
              icon="create-outline"
              size="small"
            />
            <Button
              title="删除"
              onPress={handleDelete}
              variant="danger"
              icon="trash-outline"
              size="small"
            />
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>名称</Text>
          <Text style={[styles.value, { color: colors.text }]}>{subscription.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>类型</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {subscription.source === 'remote' ? '远程订阅' : '本地订阅'}
          </Text>
        </View>

        {subscription.source === 'remote' && subscription.url && (
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>URL</Text>
            <Text style={[styles.value, { color: colors.text }]} numberOfLines={2}>
              {subscription.url}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>更新时间</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {formatDate(subscription.updatedAt)}
          </Text>
        </View>
      </Card>

      {flowInfo && (
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>流量信息</Text>
          
          <View style={styles.flowContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(progress * 100, 100)}%`,
                    backgroundColor: progress > 0.8 ? colors.warning : colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.flowText, { color: colors.textSecondary }]}>
              {formatBytes(used)} / {formatBytes(total)} ({(progress * 100).toFixed(1)}%)
            </Text>
          </View>

          {flowInfo.expire > 0 && (
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>到期时间</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {formatDate(flowInfo.expire)}
              </Text>
            </View>
          )}

          {flowInfo.remainingDays !== undefined && (
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>剩余天数</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {flowInfo.remainingDays} 天
              </Text>
            </View>
          )}
        </Card>
      )}

      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>导出订阅</Text>
        
        <View style={styles.platformSelector}>
          {TARGET_PLATFORMS.slice(0, 6).map(platform => (
            <Button
              key={platform.value}
              title={platform.label}
              onPress={() => setSelectedPlatform(platform.value)}
              variant={selectedPlatform === platform.value ? 'primary' : 'outline'}
              size="small"
              style={styles.platformButton}
            />
          ))}
        </View>

        <View style={styles.exportActions}>
          <Button
            title="预览"
            onPress={handlePreview}
            variant="outline"
            icon="eye-outline"
            style={styles.exportButton}
          />
          <Button
            title="复制链接"
            onPress={handleCopyUrl}
            variant="primary"
            icon="copy-outline"
            style={styles.exportButton}
          />
        </View>
      </Card>

      <Modal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑订阅"
      >
        <Input
          label="显示名称"
          value={editData.displayName}
          onChangeText={(text) => setEditData({ ...editData, displayName: text })}
          placeholder="输入显示名称"
          leftIcon="text"
        />

        {subscription.source === 'remote' && (
          <>
            <Input
              label="订阅URL"
              value={editData.url}
              onChangeText={(text) => setEditData({ ...editData, url: text })}
              placeholder="https://example.com/sub"
              keyboardType="url"
              leftIcon="link"
            />
            <Input
              label="User-Agent"
              value={editData.ua}
              onChangeText={(text) => setEditData({ ...editData, ua: text })}
              placeholder="自定义 User-Agent"
              leftIcon="globe-outline"
            />
          </>
        )}

        {subscription.source === 'local' && (
          <Input
            label="订阅内容"
            value={editData.content}
            onChangeText={(text) => setEditData({ ...editData, content: text })}
            placeholder="粘贴订阅内容..."
            multiline
            numberOfLines={8}
            leftIcon="code"
          />
        )}

        <Button
          title="保存"
          onPress={handleSave}
          variant="primary"
          icon="checkmark-circle"
          style={styles.saveButton}
        />
      </Modal>

      <Modal
        visible={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="预览内容"
      >
        <View style={[styles.previewContainer, { backgroundColor: colors.inputBg }]}>
          <Text style={[styles.previewText, { color: colors.text }]}>
            {previewContent || '无内容'}
          </Text>
        </View>
        <Button
          title="复制内容"
          onPress={async () => {
            await Clipboard.setStringAsync(previewContent);
            showToast('已复制', 'success');
          }}
          variant="primary"
          icon="copy-outline"
          style={styles.copyButton}
        />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  flowContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  flowText: {
    fontSize: 14,
    textAlign: 'center',
  },
  platformSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  platformButton: {
    minWidth: '30%',
  },
  exportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
  },
  saveButton: {
    marginTop: 16,
  },
  previewContainer: {
    padding: 16,
    borderRadius: 8,
    maxHeight: 400,
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  copyButton: {
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});
