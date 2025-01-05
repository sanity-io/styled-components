import type { ImplementationComponents } from '../../types';
import Box from './Box';
import Provider from './Provider';
import View from './View';

export default {
  Box,
  Provider,
  View,
} satisfies Omit<ImplementationComponents, 'Dot'>;
