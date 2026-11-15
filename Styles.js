import { StyleSheet } from 'react-native';

export const theme = {
  bg: '#000',
  card: '#080808',
  accent: '#FFF',
  textMain: '#FFF',
  textDim: '#555',
  border: '#151515',
};

export const logoUri = null;

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  primaryButton: {
    backgroundColor: '#FFF',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1.5,
  },
});

export const workspaceStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 10,
    resizeMode: 'contain',
  },
  brandText: {
    color: theme.textMain,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  operatorTitle: {
    color: theme.textMain,
    fontSize: 16,
    fontWeight: '600',
  },
  operatorId: {
    color: '#666',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  navLink: {
    color: theme.textMain,
    fontWeight: '600',
    fontSize: 11,
  },
  messageBoxContainer: {
    backgroundColor: theme.card,
    borderRadius: 18,
    marginHorizontal: 20,
    minHeight: 150,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    justifyContent: 'space-between',
  },
  terminalInput: {
    flex: 1,
    color: '#DDD',
    fontSize: 14,
    fontFamily: 'monospace',
    paddingBottom: 8,
  },
  boxActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#111',
  },
  clearBtnText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    opacity: 0.5,
  },
  sliderContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#111',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    position: 'relative',
    padding: 3,
  },
  sliderTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  sliderText: {
    fontWeight: '700',
    fontSize: 13,
  },
  sliderIndicator: {
    position: 'absolute',
    width: '49%',
    height: '85%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    zIndex: 1,
  },
  processButton: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 15,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  secretButton: {
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  secretButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  eecTag: {
    color: '#444',
    fontSize: 8,
    marginTop: 2,
  },
  footerText: {
    color: '#333',
    fontSize: 9,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
});
