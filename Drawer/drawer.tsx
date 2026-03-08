import React, { ReactNode, useContext } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  Text,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, calcHeight, calcWidth } from "../src/utils";
import HomeIcon from "../assets/DrawerSvgs/home.svg";
import NotifIcon from "../assets/DrawerSvgs/notifs.svg";
import FriendsIcon from "../assets/DrawerSvgs/friends.svg";
import CashIcon from "../assets/DrawerSvgs/cash.svg";
import InboxIcon from "../assets/DrawerSvgs/inbox.svg";
import VIPIcon from "../assets/DrawerSvgs/vip.svg";
import InventoryIcon from "../assets/DrawerSvgs/inventory.svg";
import { DataContext } from "../contextAPI/myContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParams } from "../src/navigations/drawer-stack";
import { useUserContext } from "../App";
type MainNavProps = NativeStackScreenProps<MainStackParams, "home">;

interface DrawerModalProps {
  visible: boolean;
  onClose: () => void;
  children?: ReactNode;
  navigation: any;
}

const DrawerModal: React.FC<DrawerModalProps> = ({
  children,
  visible,
  onClose,
  navigation,
}) => {
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;
  const { Logindata } = useContext(DataContext);
  const { socketx, setroom } = useUserContext();

  const removeItem = async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`Item with key ${key} removed`);
    } catch (e) {
      console.error(`Error removing item with key ${key}`, e);
    }
  };

  React.useEffect(() => {
    if (visible) {
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, overlayOpacity]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <StatusBar hidden></StatusBar>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [
                {
                  translateX: overlayOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-Dimensions.get("window").width, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View
            style={{
              backgroundColor: Colors.white,
              flex: 1,
            }}
          >
            <LinearGradient
              colors={["#F31D28", "#FF8E3C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <View style={styles.nameView}>
                <Image
                  source={{
                    uri: Logindata.user?.pic,
                  }}
                  style={styles.Image}
                />
                <Text style={styles.nameText}>{Logindata.user?.username}</Text>
              </View>
              <View style={styles.buttonView}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("MyProfile");
                    handleClose();
                  }}
                  style={styles.button1}
                >
                  <Text style={styles.buttonText1}>View Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    // Example usage:
                    try {
                      await AsyncStorage.removeItem("loginEmail");
                      await AsyncStorage.removeItem("loginData");
                      await AsyncStorage.removeItem("loginToken");
                      if(socketx)
                      {
                      await socketx.close();
                    }
                      setroom(null);

                      navigation.navigate("SignIn");
                      handleClose();
                    } catch(e) {
                      console.log(e);
                      if(socketx)
                        {
                      await socketx.close();
                        }
                      setroom(null);
                      navigation.navigate("SignIn");
                      handleClose();
                    }
                  }}
                  style={styles.button2}
                >
                  <Text style={styles.buttonText2}>Logout</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.screenView}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("home");
                handleClose();
              }}
              style={styles.screenButton}
            >
              <HomeIcon
                height={calcHeight(25)}
                width={calcWidth(25)}
              ></HomeIcon>
              <Text style={styles.screenText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("notifs");
                handleClose();
              }}
              style={styles.screenButton}
            >
              <NotifIcon
                height={calcHeight(25)}
                width={calcWidth(25)}
              ></NotifIcon>
              <Text style={styles.screenText}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("inbox");
                handleClose();
              }}
              style={styles.screenButton}
            >
              <InboxIcon
                height={calcHeight(22)}
                width={calcWidth(22)}
              ></InboxIcon>
              <Text style={styles.screenText}>Inbox</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("friends");
                handleClose();
              }}
              style={styles.screenButton}
            >
              <FriendsIcon
                height={calcHeight(25)}
                width={calcWidth(25)}
              ></FriendsIcon>
              <Text style={styles.screenText}>Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("cash");
                handleClose();
              }}
              style={styles.screenButton}
            >
              <CashIcon
                height={calcHeight(25)}
                width={calcWidth(25)}
              ></CashIcon>
              <Text style={styles.screenText}>ChatZyr Cash</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("VipShop");
                handleClose();
              }}
              style={styles.screenButton}
            >
              <VIPIcon height={calcHeight(25)} width={calcWidth(25)}></VIPIcon>
              <Text style={styles.screenText}>VIP Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Inventory");
                handleClose();
              }}
              style={styles.screenButton}
            >
              <InventoryIcon
                height={calcHeight(25)}
                width={calcWidth(25)}
              ></InventoryIcon>
              <Text style={styles.screenText}>Inventory</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
      <StatusBar hidden />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    flexDirection: "column",
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "60%", // Adjust width if needed
    height: "100%",
  },

  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "25%",
    borderBottomRightRadius: 30,
    flexDirection: "column",
  },
  Image: {
    width: 60,
    height: 60,
    borderRadius: 50,
  },
  nameView: {
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    marginLeft: "10%",
    height: "50%",
  },
  buttonView: {
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
    height: "50%",
    marginHorizontal: calcWidth(10),
  },
  nameText: {
    fontFamily: "PoppinsBold",
    fontSize: 20,
    lineHeight: 30,
    color: Colors.white,
    marginHorizontal: calcWidth(10),
  },
  button1: {
    backgroundColor: Colors.redprimary,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.white,
    paddingVertical: calcHeight(7),
    paddingHorizontal: calcWidth(15),
  },
  buttonText1: {
    color: Colors.white,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    fontFamily: "PoppinsRegular",
  },
  button2: {
    backgroundColor: Colors.white,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#F31D28",
    paddingVertical: calcHeight(7),
    paddingHorizontal: calcWidth(15),
  },
  buttonText2: {
    color: "#F31D28",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    fontFamily: "PoppinsRegular",
  },

  screenView: {
    position: "absolute",
    top: "25%",
    left: 0,
    width: "100%",
    flexDirection: "column",
    // alignItems: 'center',
    justifyContent: "flex-start",
    paddingHorizontal: calcWidth(20),
  },
  screenButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: Colors.white,

    paddingVertical: calcHeight(20),
  },

  screenText: {
    color: Colors.black,
    alignSelf: "center",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    marginHorizontal: calcWidth(20),
    fontFamily: "PoppinsRegular",
  },
});

export default DrawerModal;
