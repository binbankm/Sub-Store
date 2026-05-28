import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../store';
import { fetchCollections, updateCollection } from '../store/collectionSlice';
import { fetchSubscriptions } from '../store/subscriptionSlice';
import { useTheme } from '../styles/theme';
import { Card, Button, Input, Modal, Toast, LoadingOverlay } from '../components';
import { formatDate, TARGET_PLATFORMS } from '../utils/helpers';
import apiService from '../services/api';
import * as Clipboard from 'expo-clipboard';
import { TargetPlatform } from '../types';

export default function CollectionDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  
  const { name } = route.params as { name: string };
  const collection = useSelector((state: RootState) =>
    state.collections.items.find(col => col.name === name)
  );
  const { items: subscriptions } = useSelector(
    (state: RootState) => state.subscriptions
  );

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editData, setEditData] = useState({
    displayName: '',
    subscriptions: [] as string[],
  });
  const [previewContent, setPreviewContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<TargetPlatform>('ClashMeta');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchSubscriptions());
    if (collection) {
      setEditData({
        displayName: collection.displayName || '',
        subscriptions: [...collection.subscriptions],
      });
    }
  }, [collection]);

  const handleSave = async () => {
    setLoading(true);
    const result = await dispatch(updateCollection({
      name,
      updates: {
        displayName: editData.displayName || undefined,
        subscriptions: editData.subscriptions,
      },
    }));
    setLoading(false);

    if (updateCollection.fulfilled.match(result)) {
      showToast('保存成功', 'success');
      setShowEditModal(false);
    } else {
      showToast('保存失败', 'error');
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    const response = await apiService.preview(name, 'collection', selectedPlatform);
    setLoading(false);

    if (response.status === 'success' && response.data) {
      setPreviewContent(response.data);
      setShowPreviewModal(true);
    } else {
      showToast('预览失败', 'error');
    }
  };

  const handleCopyUrl = async () => {
    const url = `${apiService.getServerUrl()}/api/download/collection/${encodeURIComponent(name)}?target=${selectedPlatform}`;
    await Clipboard.setStringAsync(url);
    showToast('链接已复制', 'success');
  };

  const handleDelete = () => {
    Alert.alert(
      '删除集合',
      `确定要删除集合 "${collection?.displayName || name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await apiService.deleteCollection(name);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const toggleSubscription = (subName: string) => {
    setEditData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.includes(subName)
        ? prev.subscriptions.filter(s => s !== subName)
        : [...prev.subscriptions, subName],
    }));
  };

  const showToast = (message: string, type: any) => {
    setToast({ visible: true, message, type });
  };

  if (!collection) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>集合不存在</Text>
      </View>
    );
  }

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
            <Ionicons name="folder" size={24} color={colors.secondary} />
            <Text style={[styles.title, { color: colors.text }]}>
              {collection.displayName || collection.name}
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
          <Text style={[styles.value, { color: colors.text }]}>{collection.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>订阅数量</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {collection.subscriptions.length} 个
          </Text>
        </View>

        {collection.process && collection.process.length > 0 && (
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>操作数量</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {collection.process.length} 个
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>更新时间</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {formatDate(collection.updatedAt)}
          </Text>
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>包含的订阅</Text>
        
        {collection.subscriptions.length > 0 ? (
          collection.subscriptions.map((subName, index) => {
            const sub = subscriptions.find(s => s.name === subName);
            return (
              <View
                key={subName}
                style={[styles.subItem, { borderBottomColor: colors.border }]}
              >
                <Ionicons
                  name={sub?.source === 'remote' ? 'cloud' : 'document'}
                  size={16}
                  color={colors.primary}
                />
                <Text style={[styles.subName, { color: colors.text }]}>
                  {sub?.displayName || subName}
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            暂无订阅
          </Text>
        )}
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>导出集合</Text>
        
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
        title="编辑集合"
      >
        <Input
          label="显示名称"
          value={editData.displayName}
          onChangeText={(text) => setEditData({ ...editData, displayName: text })}
          placeholder="输入显示名称"
          leftIcon="text"
        />

        <View style={styles.subscriptionList}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
            <Button
              title="选择订阅"
              onPress={() => {}}
              variant="ghost"
              icon="list"
            />
          </View>
          {subscriptions.map(sub => (
            <Button
              key={sub.name}
              title={sub.displayName || sub.name}
              onPress={() => toggleSubscription(sub.name)}
              variant={editData.subscriptions.includes(sub.name) ? 'primary' : 'outline'}
              style={styles.subButton}
              icon={editData.subscriptions.includes(sub.name) ? 'checkmark-circle' : 'ellipse-outline'}
            />
          ))}
        </View>

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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subName: {
    fontSize: 14,
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
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
  subscriptionList: {
    marginBottom: 16,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 8,
  },
  subButton: {
    marginBottom: 8,
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
