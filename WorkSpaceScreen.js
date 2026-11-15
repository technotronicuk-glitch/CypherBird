import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Audio } from 'expo-av';

import { MediaPicker } from './Core/MediaPicker';
import { useSovereign } from './Core/SovereignProvider';

export default function WorkspaceScreen({
  onOpenContacts,
  onOpenGallery,
  onOpenAccount,
  onOpenChat,
  onStartEncrypt,
  onOpenDecrypt,
}) {
  const { profile } = useSovereign();

  const [mode, setMode] = useState('encrypt');
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);

  const activeNodeId = profile?.selectedContactId || profile?.cypherId || profile?.id || 'CB-01BLGU';

  const handlePickMedia = async () => {
    try {
      const media = await MediaPicker.pickAnyFile();
      if (!media) return;
      onStartEncrypt({
        payload: media.uri,
        uri: media.uri,
        fileType: media.fileType,
        fileSize: media.fileSize,
        isFile: true,
        recipientId: activeNodeId,
      });
    } catch (error) {
      console.log('Picker Error:', error);
    }
  };

  const handleMicPress = async () => {
    if (isRecording) {
      try {
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        onStartEncrypt({
          payload: uri,
          uri,
          fileType: 'm4a',
          isFile: true,
          recipientId: activeNodeId,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording: newRec } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRec);
        setIsRecording(true);
      } catch (err) {
        Alert.alert('Error', 'Mic access denied');
      }
    }
  };

  const handleProcess = () => {
    if (!inputText.trim()) return;
    if (mode === 'encrypt') {
      onStartEncrypt({
        payload: inputText,
        fileType: 'txt',
        isFile: false,
        recipientId: activeNodeId,
      });
    } else {
      onOpenDecrypt({
        encryptedUri: null,
        isFile: false,
        inputGibberish: inputText.trim(),
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.eagleIcon}>🦅</Text>
          <Text style={styles.brandText}>CYPHERBIRD</Text>
        </View>

        <View style={styles.infoBar}>
          <TouchableOpacity onPress={onOpenAccount}>
            <Text style={styles.operatorTitle}>{profile?.name || 'ANSHU THAPA'}</Text>
            <Text style={styles.operatorId}>{profile?.cypherId || profile?.id || 'CB-01BLGU'}</Text>
          </TouchableOpacity>

          <View style={styles.navLinks}>
            <TouchableOpacity onPress={onOpenGallery} style={{ marginRight: 15 }}>
              <Text style={styles.navLinkText}>GALLERY</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onOpenContacts}>
              <Text style={styles.navLinkText}>CONTACTS</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={onOpenContacts} style={styles.recipientBox}>
          <View style={styles.recipientLeft}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: profile?.selectedContactName ? '#007AFF' : '#333' },
              ]}
            />
            <Text style={styles.recipientText}>
              {profile?.selectedContactName || 'SELF VAULT (OR SELECT RECIPIENT)...'}
            </Text>
          </View>
          <View style={styles.addBadge}>
            <Text style={styles.addText}>+ ADD</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.messageBoxContainer}>
          <TextInput
            style={styles.terminalInput}
            placeholder={mode === 'encrypt' ? 'Input Sovereign Payload...' : 'Paste VAULT_v3 Gibberish...'}
            placeholderTextColor="#444"
            multiline
            value={inputText}
            onChangeText={setInputText}
          />

          <View style={styles.iconActionRow}>
            <TouchableOpacity onPress={handlePickMedia} style={styles.iconButton}>
              <Text style={styles.plusIcon}>+</Text>
            </TouchableOpacity>

            {mode === 'encrypt' && (
              <TouchableOpacity onPress={handleMicPress} style={styles.iconButton}>
                <Text style={[styles.micIcon, { color: isRecording ? '#FF3B30' : '#FFF' }]}>
                  {isRecording ? '🛑' : '🎙️'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.sliderContainer}>
          <TouchableOpacity onPress={() => setMode('encrypt')} style={styles.sliderTab}>
            <Text style={[styles.sliderLabel, { color: mode === 'encrypt' ? '#000' : '#555' }]}>
              SCRAMBLE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('decrypt')} style={styles.sliderTab}>
            <Text style={[styles.sliderLabel, { color: mode === 'decrypt' ? '#000' : '#555' }]}>
              REVEAL
            </Text>
          </TouchableOpacity>
          <View style={[styles.sliderIndicator, { left: mode === 'encrypt' ? '1%' : '50%' }]} />
        </View>

        <TouchableOpacity style={styles.processButton} onPress={handleProcess}>
          <Text style={styles.processButtonText}>
            {mode === 'encrypt' ? 'EXECUTE ENCRYPTION' : 'START REVEAL'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secretButton}
          onPress={() => onOpenChat({ name: 'SECURE_NODE', cypherId: activeNodeId })}
        >
          <Text style={styles.secretButtonText}>SECRET CONVERSATION</Text>
          <Text style={styles.eecTag}>SHA-512 SECURED</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>© 2026 CYPHERBIRD • PRIVACY PROTOCOL</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { paddingBottom: 40, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  eagleIcon: { fontSize: 24, marginRight: 10 },
  brandText: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  infoBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  operatorTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  operatorId: { color: '#555', fontSize: 10, letterSpacing: 1 },
  navLinks: { flexDirection: 'row' },
  navLinkText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  recipientBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#080808',
    padding: 15,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#151515',
    marginBottom: 20,
  },
  recipientLeft: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 10 },
  recipientText: { color: '#666', fontSize: 13 },
  addBadge: { backgroundColor: '#111', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 2 },
  addText: { color: '#007AFF', fontSize: 11, fontWeight: 'bold' },
  messageBoxContainer: {
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#151515',
    minHeight: 200,
    position: 'relative',
    padding: 15,
  },
  terminalInput: {
    color: '#FFF',
    fontSize: 16,
    height: 130,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  iconActionRow: {
    position: 'absolute',
    bottom: 5,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: { padding: 10 },
  plusIcon: { color: '#FFF', fontSize: 35, fontWeight: '200' },
  micIcon: { fontSize: 22 },
  sliderContainer: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 8,
    height: 50,
    marginTop: 25,
    position: 'relative',
    alignItems: 'center',
    padding: 4,
  },
  sliderTab: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  sliderLabel: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  sliderIndicator: {
    position: 'absolute',
    width: '48%',
    height: '85%',
    backgroundColor: '#FFF',
    borderRadius: 6,
    zIndex: 1,
  },
  processButton: {
    backgroundColor: '#FFF',
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  processButtonText: { color: '#000', fontWeight: '900', letterSpacing: 1 },
  secretButton: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 8,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  secretButtonText: { color: '#FFF', fontWeight: 'bold', letterSpacing: 1 },
  eecTag: { color: '#444', fontSize: 9, marginTop: 4, fontWeight: 'bold' },
  footerText: { color: '#222', fontSize: 10, textAlign: 'center', marginTop: 40, letterSpacing: 1 },
});
