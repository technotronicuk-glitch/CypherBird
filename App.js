import { enableScreens } from 'react-native-screens';
enableScreens(false);

import React, { useState, useEffect } from 'react';
import { StatusBar, SafeAreaView, AppState } from 'react-native';

import { SovereignProvider, useSovereign } from './Core/SovereignProvider';
import { StorageProvider } from './Core/StorageProvider';

import SecureChatScreen from './ScreenFolder/SecureChatScreen';
import WorkspaceScreen from './WorkSpaceScreen';
import ContactScreen from './ScreenFolder/ContactScreen';
import GalleryScreen from './ScreenFolder/GalleryScreen';
import AccountScreen from './ScreenFolder/AccountScreen';
import EncryptScreen from './ScreenFolder/EncryptScreen';
import DecryptScreen from './ScreenFolder/DecryptScreen';

function AppContent() {
  const [currentView, setCurrentView] = useState('workspace');
  const [activeChatContact, setActiveChatContact] = useState(null);
  const [encryptionParams, setEncryptionParams] = useState(null);
  const [decryptionParams, setDecryptionParams] = useState(null);

  const { profile, resumeSession } = useSovereign();

  useEffect(() => {
    resumeSession();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'inactive' || nextAppState === 'background') {
        StorageProvider.clearTempCache();
      }
    });

    return () => subscription.remove();
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'workspace':
        return (
          <WorkspaceScreen
            user={profile}
            onOpenContacts={() => setCurrentView('contacts')}
            onOpenGallery={() => setCurrentView('gallery')}
            onOpenAccount={() => setCurrentView('account')}
            onOpenDecrypt={(data) => {
              setDecryptionParams({
                ...(data || {}),
                userCypherId: profile?.cypherId || profile?.id || 'CB-01BLGU',
                userPin: profile?.pin || '0000',
              });
              setCurrentView('decrypt');
            }}
            onOpenChat={(contact) => {
              setActiveChatContact(contact || { name: 'SECURE_NODE', cypherId: 'CB-NODE' });
              setCurrentView('chat');
            }}
            onStartEncrypt={(data) => {
              setEncryptionParams({
                ...(data || {}),
                recipientId: data?.recipientId || profile?.cypherId || 'CB-01BLGU',
                pin: profile?.pin || '0000',
              });
              setCurrentView('encrypt');
            }}
          />
        );

      case 'encrypt':
        return (
          <EncryptScreen
            route={{ params: encryptionParams }}
            navigation={{
              navigate: (view) => setCurrentView(view),
              goBack: () => setCurrentView('workspace'),
            }}
          />
        );

      case 'decrypt':
        return (
          <DecryptScreen
            route={{
              params: decryptionParams || {
                userCypherId: profile?.cypherId || 'CB-01BLGU',
                userPin: profile?.pin || '0000',
              },
            }}
            navigation={{
              navigate: (view) => setCurrentView(view),
              goBack: () => setCurrentView('workspace'),
            }}
          />
        );

      case 'contacts':
        return (
          <ContactScreen
            onBack={() => setCurrentView('workspace')}
            onOpenChat={(contact) => {
              setActiveChatContact(contact);
              setCurrentView('chat');
            }}
          />
        );

      case 'gallery':
        return <GalleryScreen onBack={() => setCurrentView('workspace')} />;

      case 'account':
        return (
          <AccountScreen
            navigation={{
              goBack: () => setCurrentView('workspace'),
            }}
          />
        );

      case 'chat':
        return (
          <SecureChatScreen
            user={profile}
            userPin={profile?.pin || '0000'}
            contact={activeChatContact}
            onBack={() => setCurrentView('workspace')}
          />
        );

      default:
        return <WorkspaceScreen user={profile} />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" />
      {renderContent()}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SovereignProvider>
      <AppContent />
    </SovereignProvider>
  );
}
