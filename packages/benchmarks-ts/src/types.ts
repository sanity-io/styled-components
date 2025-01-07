/// <reference types="react-native-web" />

import type React from 'react';

export type BoxColor = 0 | 1 | 2 | 3 | 4 | 5;

export interface BoxProps {
  children?: React.ReactNode;
  $color?: BoxColor;
  $layout?: 'column' | 'row';
  $outer?: boolean;
  $fixed?: boolean;
}
export interface DotProps {
  $color: string;
  $size: number;
  $x: number;
  $y: number;
}
export interface ProviderProps {
  children: React.ReactNode;
}
export interface ViewProps {
  children: React.ReactNode;
}

export interface ImplementationComponents {
  Box: React.ComponentType<BoxProps>;
  Dot: React.ComponentType<DotProps>;
  Provider: React.ComponentType<ProviderProps>;
  View: React.ComponentType<ViewProps>;
}

export interface Implementation {
  components: ImplementationComponents;
  name: string;
  version: string;
}

/**
 *  benchmarkType: 'mount',
    Component: Tree,
    getComponentProps: ({ cycle }) => ({
      breadth: 2,
      components,
      depth: 7,
      id: cycle,
      wrap: 1,
    }),
    Provider: components.Provider,
    sampleCount: 500,

     benchmarkType: 'mount',
    Component: Tree,
    getComponentProps: ({ cycle }) => ({
      breadth: 6,
      components,
      depth: 3,
      id: cycle,
      wrap: 2,
    }),
    Provider: components.Provider,
    sampleCount: 500,

    benchmarkType: 'update',
    Component: SierpinskiTriangle,
    getComponentProps: ({ cycle }) => {
      return { components, renderCount: cycle, s: 200, x: 0, y: 0 };
    },
    Provider: components.Provider,
    sampleCount: 1000,
 */

export interface SierpinskiTriangleProps {
  components: ImplementationComponents;
  depth?: number;
  renderCount: number;
  s: number;
  x: number;
  y: number;
}

export interface TreeProps {
  components: ImplementationComponents;
  breadth: number;
  depth: number;
  id: number;
  wrap: number;
}

export interface TestReport {
  benchmarkName: string;
  libraryName: string;
  libraryVersion?: string;
  sampleCount?: number;
  mean?: number;
  meanLayout?: number;
  meanScripting?: number;
  stdDev?: number;
  runTime?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Test<Props extends Record<string, any> = Record<string, any>> {
  Component: React.ComponentType<Props>;
  getComponentProps: (props: { cycle: number }) => Props;
  sampleCount: number;
  Provider: React.ComponentType<ProviderProps>;
  benchmarkType: 'mount' | 'update';
  version: string;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TestBlock<Props extends Record<string, any>> = Record<string, Test<Props>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Tests<Props extends Record<string, any>> = Record<string, TestBlock<Props>>;
