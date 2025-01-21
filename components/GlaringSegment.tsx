import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export const GlaringSegment: React.FC<Props> = ({
  children,
  style,
  contentStyle,
}) => {
  return (
    <View style={[styles.segmentContainer, style]}>
      <View style={[styles.segment, contentStyle]}>{children}</View>
      <View style={styles.footer}>
        <View style={[styles.bloom, styles.bloomBlue]} />
        <View style={[styles.bloom, styles.bloomPink]} />
        <View style={[styles.bloom, styles.bloomOrange]} />
        <View style={[styles.bloom, styles.bloomPurple]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  segmentContainer: {},
  segment: {
    zIndex: 1,
    paddingHorizontal: 12,
    paddingVertical: 36,
    borderWidth: 6,
    borderColor: '#282828',
    borderRadius: 10,
    backgroundColor: '#303030',
    boxShadow: '0 0 0 1 rgba(255, 255, 255, 0.2)',
  },
  footer: {
    overflow: 'hidden',
    zIndex: 1,
    width: '100%',
    height: 100,
  },
  bloom: {
    position: 'absolute',
    height: 1,
  },
  bloomBlue: {
    left: '10%',
    width: '40%',
    marginTop: -16,
    borderRadius: 10,
    boxShadow: `
      0 0px 20px 3px hsl(199 89% 48%),
      0 0px 30px 4px hsl(199 89% 48%)
    `,
  },
  bloomPink: {
    left: `${Math.round(10 + 40 / 3)}%`,
    width: '40%',
    marginTop: -16,
    borderRadius: 10,
    boxShadow: `
      0 0px 20px 3px hsl(330 81% 60%),
      0 0px 30px 4px hsl(330 81% 60%)
    `,
  },
  bloomOrange: {
    left: `${Math.round(10 + (40 / 3) * 2)}%`,
    width: '40%',
    marginTop: -16,
    borderRadius: 10,
    boxShadow: `
      0 0px 20px 3px hsl(25 95% 53%),
      0 0px 30px 4px hsl(25 95% 53%)
    `,
  },
  bloomPurple: {
    left: `${10 + 40}%`,
    width: '40%',
    marginTop: -16,
    borderRadius: 10,
    boxShadow: `
      0 0px 20px 3px hsl(271 91% 65%),
      0 0px 30px 4px hsl(271 91% 65%)
    `,
  },
});
