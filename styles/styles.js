import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  closeButton: {
    position: 'absolute',
    top: 40, // Adjusted to lower the button
  },
  itemsContainer: {
    marginTop: 30, // Adjust this value to move the items lower
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
  },
  bottomContainer: {
    marginTop: 'auto',
    marginBottom: 30,
  },
  iconColor: {
    color: '#000', // Define the icon color here
  },
});