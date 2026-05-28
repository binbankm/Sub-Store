import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { Button, EmptyState, Toast, ConfirmDialog } from '../components';
import storageService from '../services/storage';
import { LogEntry } from '../types';
import { formatDate } from '../utils/helpers';

export default function LogsScreen() {
  const { colors } = useTheme();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const loadedLogs = await storageService.getLogs();
    setLogs(loadedLogs);
    setLoading(false);
  };

  const handleClearLogs = async () => {
    await storageService.clearLogs();
    setLogs([]);
    setShowClearDialog(false);
    showToast('日志已清除', 'success');
  };

  const showToast = (message: string, type: any) => {
    setToast({ visible: true, message, type });
  };

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return 'information-circle';
      case 'warn':
        return 'warning';
      case 'error':
        return 'close-circle';
      default:
        return 'information-circle';
    }
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return colors.info;
      case 'warn':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.level === filter);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.filterContainer}>
          {(['all', 'info', 'warn', 'error'] as const).map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.filterButton,
                {
                  backgroundColor: filter === level ? colors.primary : colors.inputBg,
                },
              ]}
              onPress={() => setFilter(level)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === level ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {level === 'all' ? '全部' : level.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button
          title="清除"
          onPress={() => setShowClearDialog(true)}
          variant="danger"
          icon="trash-outline"
          size="small"
          disabled={logs.length === 0}
        />
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        renderItem={({ item }) => (
          <View style={[styles.logItem, { borderBottomColor: colors.border }]}>
            <Ionicons
              name={getLogIcon(item.level)}
              size={20}
              color={getLogColor(item.level)}
            />
            <View style={styles.logContent}>
              <Text style={[styles.logMessage, { color: colors.text }]}>
                {item.message}
              </Text>
              <Text style={[styles.logTime, { color: colors.textTertiary }]}>
                {formatDate(item.timestamp)}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="暂无日志"
            message="应用运行日志将显示在这里"
          />
        }
      />

      <ConfirmDialog
        visible={showClearDialog}
        title="清除日志"
        message="确定要清除所有日志吗？此操作不可撤销。"
        confirmText="清除"
        confirmStyle="destructive"
        onConfirm={handleClearLogs}
        onCancel={() => setShowClearDialog(false)}
      />
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
    padding: 12,
    borderBottomWidth: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  logItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  logContent: {
    flex: 1,
  },
  logMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  logTime: {
    fontSize: 12,
    marginTop: 4,
  },
});
