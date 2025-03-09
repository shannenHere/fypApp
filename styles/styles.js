import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  //Drawer Styles
  closeButton: {
    position: 'absolute',
    top: 40,
  },
  itemsContainer: {
    marginTop: 70,
  },
  item: {
    padding: 20,
    fontSize: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 18,
    color: '#000',
  },
  bottomContainer: {
    marginTop: 'auto',
    marginBottom: 30,
  },
  iconColor: {
    color: '#000',
  },

  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    elevation: 4,
  },
  leftButton: {
    padding: 10,
  },
  rightButton: {
    padding: 10,
  },
});
