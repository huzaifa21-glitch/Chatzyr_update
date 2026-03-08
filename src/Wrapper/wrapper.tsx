import React, { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { Colors, calcHeight } from "../utils";
import { SafeAreaView } from 'react-native-safe-area-context'
interface WrapperProps {
  children: ReactNode | ReactNode[];
  paddingHorizontal: number;
  paddingVertical: number;
}

const Wrapper: React.FC<WrapperProps> = ({
  children,
  paddingHorizontal = 10,
  paddingVertical = 10,
}) => {
  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          paddingHorizontal: paddingHorizontal,
          paddingVertical: paddingVertical,
        },
      ]}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin:0,
    padding:0,
    backgroundColor: Colors.offwhite,
  },
});

export default Wrapper;
