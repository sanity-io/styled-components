import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PuffLoader } from 'react-spinners';
import App from './app/App';
import SierpinskiTriangle from './cases/SierpinskiTriangle';
import Tree from './cases/Tree';

const root = createRoot(document.querySelector('#root')!);

const fallback = (
  <PuffLoader
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }}
  />
);

root.render(<StrictMode>{fallback}</StrictMode>);

// @TODO refactor this to use the React.use hook
import('./impl')
  .then(({ getImplementations }) => getImplementations())
  .then(implementations => {
    const packageNames = Object.keys(implementations);

    const createTestBlock = fn => {
      return packageNames.reduce((testSetups, packageName) => {
        const { name, components, version } = implementations[packageName];
        const { Component, getComponentProps, sampleCount, Provider, benchmarkType } =
          fn(components);

        testSetups[packageName] = {
          Component,
          getComponentProps,
          sampleCount,
          Provider,
          benchmarkType,
          version,
          name,
        };
        return testSetups;
      }, {});
    };

    const tests = {
      'Mount deep tree': createTestBlock(components => ({
        benchmarkType: 'mount',
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
      })),
      'Mount wide tree': createTestBlock(components => ({
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
      })),
      'Update dynamic styles': createTestBlock(components => ({
        benchmarkType: 'update',
        Component: SierpinskiTriangle,
        getComponentProps: ({ cycle }) => {
          return { components, s: 200, renderCount: cycle, x: 0, y: 0 };
        },
        Provider: components.Provider,
        sampleCount: 1000,
      })),
    };

    return root.render(
      <StrictMode>
        <App tests={tests} />
      </StrictMode>
    );
  })
  .catch(reason => {
    root.unmount();
    console.error(reason);
  });
