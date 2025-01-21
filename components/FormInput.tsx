import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

type Props = TextInputProps;
export const FormInput: React.FC<Props> = inuptProps => {
  return (
    <TextInput
      placeholderTextColor="#ffffffa0"
      {...inuptProps}
      style={[styles.container]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    paddingHorizontal: 10,
    height: 44,
    fontSize: 18,
    color: 'white',
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'hsla(0, 0%, 100%, 0.2)',
    borderRadius: 8,
    boxShadow: `
      0 1px 2px 0 rgba(0, 0, 0, 0.22),
      0 6px 16px 0 rgba(0, 0, 0, 0.22)
    `,
  },
});
