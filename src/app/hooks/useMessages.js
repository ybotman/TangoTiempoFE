// src/app/hooks/useMessages.js
// TIEMPO-387: Firestore messaging hook for organizer messages

import { useState, useEffect, useContext, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { AuthContext } from '@/contexts/AuthContext';
import { RoleContext } from '@/contexts/RoleContext';

const APP_ID = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';

// Map role names to short codes used in Firestore
const ROLE_CODE_MAP = {
  'RegionalOrganizer': 'RO',
  'RegionalAdmin': 'RA',
  'SystemAdmin': 'SA',
  'SystemOwner': 'SO',
};

export const useMessages = () => {
  const { user } = useContext(AuthContext);
  const { selectedRole } = useContext(RoleContext);

  const [messages, setMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get role code for current role
  const roleCode = ROLE_CODE_MAP[selectedRole] || null;

  // Fetch user's read receipts
  const fetchReadReceipts = useCallback(async () => {
    if (!user?.uid) return {};

    try {
      const receiptsRef = collection(db, 'messageReceipts');
      const q = query(receiptsRef, where('recipientUid', '==', user.uid));

      return new Promise((resolve) => {
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const receipts = {};
          snapshot.forEach((doc) => {
            const data = doc.data();
            receipts[data.messageId] = {
              readAt: data.readAt,
              acknowledgedAt: data.acknowledgedAt,
            };
          });
          resolve(receipts);
          unsubscribe();
        });
      });
    } catch (err) {
      console.error('Error fetching receipts:', err);
      return {};
    }
  }, [user?.uid]);

  // Listen for messages
  useEffect(() => {
    if (!user?.uid || !roleCode) {
      setMessages([]);
      setUnreadMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query messages for this app where user's role is in to.roles
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('appId', '==', APP_ID),
      where('to.roles', 'array-contains', roleCode)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const receipts = await fetchReadReceipts();

        const allMessages = [];
        const unread = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const message = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            receipt: receipts[docSnap.id] || null,
          };

          allMessages.push(message);

          // Message is unread if no receipt or not acknowledged (for requiresAck messages)
          const isUnread = !receipts[docSnap.id] ||
            (data.requiresAck && !receipts[docSnap.id]?.acknowledgedAt);

          if (isUnread) {
            unread.push(message);
          }
        });

        // Sort by createdAt descending
        allMessages.sort((a, b) => b.createdAt - a.createdAt);
        unread.sort((a, b) => b.createdAt - a.createdAt);

        setMessages(allMessages);
        setUnreadMessages(unread);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error listening to messages:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, roleCode, fetchReadReceipts]);

  // Mark message as read
  const markAsRead = useCallback(async (messageId) => {
    if (!user?.uid) return;

    const receiptId = `${user.uid}_${messageId}`;
    const receiptRef = doc(db, 'messageReceipts', receiptId);

    try {
      const existingReceipt = await getDoc(receiptRef);

      if (!existingReceipt.exists()) {
        await setDoc(receiptRef, {
          messageId,
          recipientUid: user.uid,
          readAt: Timestamp.now(),
          acknowledgedAt: null,
        });
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [user?.uid]);

  // Acknowledge message (I understand button)
  const acknowledgeMessage = useCallback(async (messageId) => {
    if (!user?.uid) return;

    const receiptId = `${user.uid}_${messageId}`;
    const receiptRef = doc(db, 'messageReceipts', receiptId);

    try {
      await setDoc(receiptRef, {
        messageId,
        recipientUid: user.uid,
        readAt: Timestamp.now(),
        acknowledgedAt: Timestamp.now(),
      }, { merge: true });

      // Update local state immediately
      setUnreadMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      console.error('Error acknowledging message:', err);
    }
  }, [user?.uid]);

  return {
    messages,
    unreadMessages,
    unreadCount: unreadMessages.length,
    loading,
    error,
    markAsRead,
    acknowledgeMessage,
    hasUnread: unreadMessages.length > 0,
  };
};

export default useMessages;
