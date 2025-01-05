import { styled } from 'restyle';
import { View } from './View';

const StyledView = styled(View, props => ({
  borderBottomWidth: `${props.size / 2}px`,
  borderColor: 'transparent',
  borderLeftWidth: `${props.size / 2}px`,
  borderRightWidth: `${props.size / 2}px`,
  borderStyle: 'solid',
  borderTopWidth: 0,
  cursor: 'pointer',
  height: 0,
  marginLeft: `${props.x}px`,
  marginTop: `${props.y}px`,
  position: 'absolute',
  transform: 'translate(50%, 50%)',
  width: 0,
}));

export function Dot(props: any) {
  return <StyledView {...props} style={{ borderBottomColor: props.color }} />;
}
