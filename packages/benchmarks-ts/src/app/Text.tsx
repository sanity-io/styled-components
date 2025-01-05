import React, { createContext, use } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { colors } from './theme';

const styles = StyleSheet.create({
  baseText: {
    color: colors.textBlack,
    // @ts-expect-error - fix later
    fontSize: '1rem',
    // @ts-expect-error - fix later
    lineHeight: '1.3125em',
  },
});

const IsAParentTextContext = createContext(false);

export default function AppText(props: {
  children: React.ReactNode;
  style: StyleProp<TextStyle>;
  testID?: string;
}) {
  const { children, style, testID } = props;
  const isInAParentText = use(IsAParentTextContext);
  return (
    <IsAParentTextContext value={true}>
      <Text style={[!isInAParentText && styles.baseText, style]} testID={testID}>
        {children}
      </Text>
    </IsAParentTextContext>
  );
}

AppText.displayName = '@app/Text';
