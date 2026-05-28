import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { Button, Toast } from '../components';
import * as Clipboard from 'expo-clipboard';

export default function PreviewScreen() {
  const route = useRoute();
  const { colors } = useTheme();
  
  const { content, title } = route.params as { content: string; title: string };
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(content);
      showToast('已复制到剪贴板', 'success');
    } catch (error) {
      showToast('复制失败', 'error');
    }
  };

  const showToast = (message: string, type: any) => {
    setToast({ visible: true, message, type });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Button
          title="复制"
          onPress={handleCopy}
          variant="primary"
          icon="copy-outline"
          size="small"
        />
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={[styles.codeContainer, { backgroundColor: colors.inputBg }]}>
          <Text style={[styles.codeText, { color: colors.text }]}>
            {content || '无内容'}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={styles.infoRow}>
          <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {content.length} 字符
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="list-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {content.split('\n').length} 行
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  codeContainer: {
    padding: 16,
    borderRadius: 8,
    minHeight: 200,
  },
  codeText: {
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderTopWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
  },
});
