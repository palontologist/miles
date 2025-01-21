import React, {
  PropsWithChildren,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type ButtonProps = PropsWithChildren<{
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}>;
export const GradientButton: React.FC<ButtonProps> = ({ children, style, onPress }) => {
  const [pressed, setPressed] = useState<boolean>(false);
  const [buttonWidth, setButtonWidth] = useState<number>(100);
  const [buttonHeight, setButtonHeight] = useState<number>(100);
  const refContainer = useRef<View>(null);

  useLayoutEffect(() => {
    if (refContainer.current) {
      // @ts-ignore
      const { width, height } = refContainer.current.unstable_getBoundingClientRect();
      setButtonWidth(width);
      setButtonHeight(height);
    }
  }, []);

  const handlePressIn = () => {
    setPressed(true);
  };
  const handlePressOut = () => {
    setPressed(false);
  };

  return (
    <View style={style}>
      <Pressable
        style={styles.button}
        ref={refContainer}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}>
        <Svg
          style={[styles.buttonSvg, { width: buttonWidth, height: buttonHeight }]}
          viewBox={`0 0 ${buttonWidth} ${buttonHeight}`}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0"
                stopColor="hsla(0, 0%, 100%, 0.16)"
                stopOpacity="0.16"
              />
              <Stop
                offset="1"
                stopColor="hsla(0, 0%, 100%, 0)"
                stopOpacity="0.0"
              />
            </LinearGradient>
          </Defs>
          {!pressed && (
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
          )}
        </Svg>
        <Text style={[styles.buttonTitle]}>{children}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    overflow: 'hidden',
    margin: 10,
    padding: 0,
    backgroundColor: '#3d7aed',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'hsla(0, 0%, 100%, 0.3)',
    // outline: '1px solid hsla(0, 0%, 100%, 0.3)',
    boxShadow: `
      0 0 0 1px #3d7aed,
      0 1px 2px 0 rgba(12, 43, 100, 0.32),
      0 6px 16px 0 rgba(12, 43, 100, 0.32)
    `,
  },
  buttonTitle: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    margin: 8,
    textShadowRadius: 1,
    textShadowOffset: { width: 0, height: -1 },
    textShadowColor: 'hsla(0, 0%, 0%, 0.1)',
  },
  buttonSvg: {
    overflow: 'hidden',
    position: 'absolute',
  },
});
