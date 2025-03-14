import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get("window"); // Get screen width

export const globalStyles = StyleSheet.create({
  //Drawer Styles
  headerContainer: {
    width: "100%",
    paddingVertical: 0,
    paddingHorizontal: 0,
    justifyContent: "center",
    minHeight: 60, // Ensure enough height
},
topRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Keep elements on opposite sides
    alignItems: "center",
    width: "100%",
    backgroundColor: "#d7d7d7",
    paddingHorizontal: 5,
    paddingVertical: 3,
},
bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 10,
},
iconButton: {
    padding: 15, // Increased padding for better touch area
    color: "black",
},
headerTitle: {
    top: 20,
    left: -20,
    fontSize: 30,
    marginLeft: 10,
    color: "black",
    fontWeight: "bold",
},
iconStyle: {
    fontSize: 30,
    color: "black",
},
backIcon: {
    top: -5,
    left: 0,
    fontSize: 28,
    color: "black",
},
 // Back button: Hidden when on Home screen
 hiddenButton: {
  opacity: 0, // Invisible but still occupies space
},
invisible: {
  opacity: 0, // Makes icon invisible
},
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
    top: 300,
    marginTop: 'auto',
    marginBottom: 30,
  },
  iconColor: {
    color: '#000',
  },
  input: { 
    borderWidth: 1, 
    borderRadius: 1, 
    height: 30,
    fontSize: 15,
    paddingVertical: 0,
    color: 'black',
  },
    InputButton: { 
      backgroundColor: "#007bff", 
      padding: 10, 
      borderRadius: 5, 
      alignItems: "center", 
      marginTop: 10,
      width: 150,
      height: 40,
    },
    InputButtonText: { 
      color: "white", 
      fontWeight: "bold" 
    },
    InputLinkText: { 
      color: "#007bff", 
      textAlign: "center", 
      marginTop: 10,
      top: 10,
    },
    InputContainer: {
      paddingVertical: 60,
      paddingHorizontal: 50,
    },
    InputLabel: {
      color : 'black',
      left: 2,
    },
    InputButtonContainer: {
      flexDirection: 'row',
      justifyContent: "space-between",
    },
    errorText: {
      color: "red",
      fontSize: 11,
      marginBottom: 10,
    },
    screenContainer: {
      left: 45,
  },
});
