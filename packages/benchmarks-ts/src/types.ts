export interface ImplementationBoxProps {
  children?: React.ReactNode;
  color?: 0 | 1 | 2 | 3 | 4 | 5;
  layout?: 'column' | 'row';
  outer?: boolean;
  fixed?: boolean;
}
export interface ImplementationDotProps {
  color: string;
  size: number;
  x: number;
  y: number;
}
export interface ImplementationProviderProps {
  children: React.ReactNode;
}
export interface ImplementationViewProps {
  children: React.ReactNode;
}

export interface ImplementationComponents {
  Box: React.ComponentType<ImplementationBoxProps>;
  Dot: React.ComponentType<ImplementationDotProps>;
  Provider: React.ComponentType<ImplementationProviderProps>;
  View: React.ComponentType<ImplementationViewProps>;
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
      return { components, s: 200, renderCount: cycle, x: 0, y: 0 };
    },
    Provider: components.Provider,
    sampleCount: 1000,
 */
