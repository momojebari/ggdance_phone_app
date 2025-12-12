import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { messageService } from '../services/api';

interface Message {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
  is_read: boolean;
  sender_name?: string;
}

interface MessagesScreenProps {
  parentPhone: string;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ parentPhone }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(null);

  const loadMessages = async () => {
    try {
      const data = await messageService.getByParent(parentPhone);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMessages, 30000);
    return () => clearInterval(interval);
  }, [parentPhone]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const handleToggleMessage = async (message: Message) => {
    if (expandedMessageId === message.id) {
      setExpandedMessageId(null);
    } else {
      setExpandedMessageId(message.id);
      if (!message.is_read) {
        try {
          await messageService.markAsRead(message.id);
          // Update local state
          setMessages(prev => 
            prev.map(m => m.id === message.id ? { ...m, is_read: true } : m)
          );
        } catch (error) {
          console.error('Error marking as read:', error);
        }
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'urgent':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#ef4444' };
      case 'info':
        return { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', text: '#3b82f6' };
      case 'event':
        return { bg: 'rgba(168, 85, 247, 0.1)', border: '#a855f7', text: '#a855f7' };
      case 'payment':
        return { bg: 'rgba(249, 115, 22, 0.1)', border: '#f97316', text: '#f97316' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.1)', border: '#94a3b8', text: '#94a3b8' };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'urgent':
        return '🚨';
      case 'info':
        return 'ℹ️';
      case 'event':
        return '🎉';
      case 'payment':
        return '💰';
      default:
        return '📩';
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>💬 Messages</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0
                ? `${unreadCount} nouveau${unreadCount > 1 ? 'x' : ''} message${unreadCount > 1 ? 's' : ''}`
                : 'Aucun nouveau message'
              }
            </Text>
          </View>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Aucun message</Text>
            <Text style={styles.emptySubtext}>Vous n'avez reçu aucun message pour le moment</Text>
          </View>
        ) : (
          <View style={styles.messagesContainer}>
            {messages.map(message => {
              const isExpanded = expandedMessageId === message.id;
              const colors = getCategoryColor(message.category);
              const icon = getCategoryIcon(message.category);

              return (
                <TouchableOpacity
                  key={message.id}
                  onPress={() => handleToggleMessage(message)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.messageCard,
                      { backgroundColor: colors.bg, borderColor: colors.border },
                      !message.is_read && styles.messageCardUnread,
                    ]}
                  >
                    <View style={styles.messageHeader}>
                      <View style={styles.messageTitleRow}>
                        <Text style={styles.messageIcon}>{icon}</Text>
                        <View style={styles.messageTitleContainer}>
                          <Text
                            style={[
                              styles.messageTitle,
                              !message.is_read && styles.messageTitleUnread,
                            ]}
                            numberOfLines={isExpanded ? undefined : 1}
                          >
                            {message.title}
                          </Text>
                          <Text style={styles.messageDate}>
                            {new Date(message.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        {!message.is_read && (
                          <View style={styles.unreadDot} />
                        )}
                      </View>

                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: colors.bg, borderColor: colors.border },
                        ]}
                      >
                        <Text style={[styles.categoryText, { color: colors.text }]}>
                          {message.category}
                        </Text>
                      </View>
                    </View>

                    {isExpanded && (
                      <View style={styles.messageBody}>
                        <View style={styles.messageDivider} />
                        <Text style={styles.messageContent}>{message.content}</Text>
                        {message.sender_name && (
                          <Text style={styles.messageSender}>
                            — {message.sender_name}
                          </Text>
                        )}
                      </View>
                    )}

                    <View style={styles.expandIcon}>
                      <Text style={styles.expandIconText}>
                        {isExpanded ? '▲' : '▼'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderRadius: 24,
    margin: 16,
    marginTop: 48,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
  },
  headerSubtitle: {
    color: '#94a3b8',
    marginTop: 4,
    fontSize: 14,
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  messagesContainer: {
    padding: 16,
  },
  messageCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  messageCardUnread: {
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  messageHeader: {
    marginBottom: 8,
  },
  messageTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  messageIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  messageTitleContainer: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 4,
  },
  messageTitleUnread: {
    fontWeight: '900',
    color: '#ffffff',
  },
  messageDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    marginLeft: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  messageBody: {
    marginTop: 12,
  },
  messageDivider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    marginBottom: 12,
  },
  messageContent: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  messageSender: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'right',
  },
  expandIcon: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  expandIconText: {
    fontSize: 12,
    color: '#64748b',
  },
});

export default MessagesScreen;
