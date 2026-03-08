import { Dimensions, Platform } from "react-native";
import { PixelRatio } from "react-native";
const fontScale = PixelRatio.getFontScale();
export const RFS = (size: number) => size / fontScale;
export function cross(val1: any, val2: any) {
  return Platform.OS === "android" ? val1 : val2;
}
export const isIos = Platform.OS === "ios";
const screenHeightFigma = 800;
const screenWidthFigma = 360;
export const ScreenWidth = Dimensions.get("screen").width;
export const ScreenHeight = Dimensions.get("screen").height;
export function calcHeight(height: number): number {
  return parseFloat(((ScreenHeight * height) / screenHeightFigma).toFixed(2));
}
export function calcWidth(width: number): number {
  return parseFloat(((ScreenWidth * width) / screenWidthFigma).toFixed(2));
}
export const Colors = {
  offwhite: "#EFF0F3",
  redprimary: "#F31D28",
  white: "#FFFFFF",
  black: "#000000",
  orange: "#FF8E3C",
  grey: "#9E9E9E",
  green:'#0FB90C',
  lightgrey:"#DDDAD9",
  darkgrey:"#3C3A39"
};
