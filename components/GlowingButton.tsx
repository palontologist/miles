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
import { InnerReflextionEffect } from './InnerReflectionEffect';
import { OuterGlowEffect } from './OuterGlowEffect';

type ButtonProps = PropsWithChildren<{
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}>;
export const GlowingButton: React.FC<ButtonProps> = ({ children, style, onPress }) => {
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
    <View style={[style, styles.container]}>
      <Pressable
        style={styles.button}
        ref={refContainer}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}>
        <InnerReflextionEffect
          width={buttonWidth}
          height={buttonHeight}
          opacity={0.5}
        />
        <Svg
          style={[styles.buttonSvg, { width: buttonWidth - 2, height: buttonHeight - 2 }]}
          viewBox={`0 0 ${buttonWidth - 2} ${buttonHeight - 2}`}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0"
                stopColor="hsla(0, 0%, 100%, 0.16)"
                stopOpacity="0.25"
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
      <OuterGlowEffect
        width={buttonWidth}
        height={buttonHeight}
        opacity={0.8}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    // backgroundColor: 'white'
  },
  button: {
    position: 'relative',
    overflow: 'hidden',
    height: 44,
    padding: 0,
    backgroundColor: '#303030',
    borderRadius: 8,
    boxShadow: `
      0 0 0 1px #303030,
      0 1px 2px 0 rgba(0, 0, 0, 0.32),
      0 6px 16px 0 rgba(0, 0, 0, 0.32)
    `,
  },
  buttonTitle: {
    zIndex: 3,
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
    backgroundColor: '#303030',
    borderRadius: 7,
    left: 1,
    top: 1,
    zIndex: 2,
  },
});
