'use client';

/// <reference types="react/experimental" />

import {
  unstable_Activity as Activity,
  startTransition,
  useCallback,
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  unstable_ViewTransition as ViewTransition,
} from 'react';
import styled, { createGlobalStyle, css } from 'styled-components';

const Button = styled.button<{ $primary?: boolean }>`
  font-size: 16px;
  border-radius: 5px;
  padding: 0.25em 1em;
  margin: 1em 1em;
  background: transparent;
  color: palevioletred;
  border: 2px solid palevioletred;
  cursor: pointer;

  ${props =>
    props.$primary &&
    css`
      background: palevioletred;
      color: white;
    `};
`;

const RedBackground = createGlobalStyle<{ $primary?: boolean }>`
  main {
    view-transition-name: main;
    background-color: ${props => (props.$primary ? 'red' : 'transparent')};
    background-image: none !important;
  }
`;

export default function ButtonExample() {
  const mounted = useSyncExternalStore(
    useCallback(() => () => {}, []),
    () => true,
    () => false
  );
  const [primary, setPrimary] = useState(false);
  const [background, setBackground] = useState(false);
  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={primary}
          onChange={() => startTransition(() => setPrimary(prev => !prev))}
        />{' '}
        Toggle primary
      </label>

      <ViewTransition>
        <Button $primary={primary} onClick={() => alert('Clicked!')}>
          Button
        </Button>
      </ViewTransition>

      <Activity mode={background ? 'visible' : 'hidden'}>
        {/* {background && <RedBackground $primary={primary} />} */}
        <RedBackground $primary={primary} />
        <Debug />
      </Activity>
      <label>
        <input type="checkbox" checked={background} onChange={() => setBackground(prev => !prev)} />{' '}
        Toggle background
      </label>
    </>
  );
}

function Debug() {
  useEffect(() => {
    console.log('useEffect.mount');
    return () => console.log('useEffect.unmount');
  }, []);
  useLayoutEffect(() => {
    console.log('useLayoutEffect.mount');
    return () => console.log('useLayoutEffect.unmount');
  }, []);
  useInsertionEffect(() => {
    console.log('useInsertionEffect.mount');
    return () => console.log('useInsertionEffect.unmount');
  }, []);

  return null;
}
