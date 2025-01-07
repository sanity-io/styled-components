import 'virtual:stylex.css';
import './index.css';

import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import SierpinskiTriangle from './cases/SierpinskiTriangle';
import Tree from './cases/Tree';
import { implementations } from './implementations';
import type {
  ImplementationComponents,
  SierpinskiTriangleProps,
  Test,
  TestBlock,
  TreeProps,
} from './types';

const packageNames = Object.keys(implementations);

function createTestBlock<const Props extends Record<string, any>>(
  fn: (components: ImplementationComponents) => Omit<Test<Props>, 'version' | 'name'>
): TestBlock<Props> {
  const testSetups: TestBlock<Props> = {};

  for (const packageName of packageNames) {
    const { name, components, version } = implementations[packageName];
    const { Component, getComponentProps, sampleCount, Provider, benchmarkType } = fn(components);

    testSetups[packageName] = {
      Component,
      getComponentProps,
      sampleCount,
      Provider,
      benchmarkType,
      version,
      name,
    };
  }

  return testSetups;
}

const tests = {
  'Mount deep tree': createTestBlock<TreeProps>(components => ({
    benchmarkType: 'mount',
    Component: Tree,
    getComponentProps: ({ cycle }) => ({
      components,
      breadth: 2,
      depth: 8,
      id: cycle,
      wrap: 1,
    }),
    Provider: components.Provider,
    sampleCount: 500,
    // sampleCount: 2,
  })),
  'Mount wide tree': createTestBlock<TreeProps>(components => ({
    benchmarkType: 'mount',
    Component: Tree,
    getComponentProps: ({ cycle }) => ({
      components,
      breadth: 7,
      depth: 3,
      id: cycle,
      wrap: 2,
    }),
    Provider: components.Provider,
    sampleCount: 500,
    // sampleCount: 2,
  })),
  'Update dynamic styles': createTestBlock<SierpinskiTriangleProps>(components => ({
    benchmarkType: 'update',
    Component: SierpinskiTriangle,
    getComponentProps: ({ cycle }) => {
      return { components, s: 256, renderCount: cycle, x: 0, y: 0 };
    },
    Provider: components.Provider,
    // sampleCount: 10_000,
    sampleCount: 1_000,
    // sampleCount: 2,
  })),
};

createRoot(document.querySelector('#root')!).render(
  // <StrictMode>
  <App tests={tests} />
  // </StrictMode>
);
