import { View } from './View';

export function Provider({ children }: { children: React.ReactNode }) {
  return <View>{children}</View>;
}
