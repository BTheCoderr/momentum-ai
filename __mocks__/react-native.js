module.exports = {
  Platform: {
    OS: 'web',
    select: jest.fn(obj => obj.web || obj.default || {}),
  },
  StyleSheet: {
    create: jest.fn(styles => styles),
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ActivityIndicator: 'ActivityIndicator',
}; 