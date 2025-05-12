import React, { useInsertionEffect, useMemo, useState } from 'react';
import { STATIC_EXECUTION_CONTEXT } from '../constants';
import GlobalStyle from '../models/GlobalStyle';
import { useStyleSheetContext } from '../models/StyleSheetManager';
import { DefaultTheme, ThemeContext } from '../models/ThemeProvider';
import StyleSheet from '../sheet';
import { ExecutionContext, ExecutionProps, Interpolation, Stringifier, Styles } from '../types';
import { checkDynamicCreation } from '../utils/checkDynamicCreation';
import determineTheme from '../utils/determineTheme';
import generateComponentId from '../utils/generateComponentId';
import css from './css';

export default function createGlobalStyle<Props extends object>(
  strings: Styles<Props>,
  ...interpolations: Array<Interpolation<Props>>
) {
  const rules = css<Props>(strings, ...interpolations);
  const styledComponentId = `sc-global-${generateComponentId(JSON.stringify(rules))}`;
  const globalStyle = new GlobalStyle<Props>(rules, styledComponentId);

  if (process.env.NODE_ENV !== 'production') {
    checkDynamicCreation(styledComponentId);
  }

  const GlobalStyleComponent: React.ComponentType<ExecutionProps & Props> = props => {
    const ssc = useStyleSheetContext();
    const theme = React.useContext(ThemeContext);
    const [instance] = useState(() => ssc.styleSheet.allocateGSInstance(styledComponentId));

    if (process.env.NODE_ENV !== 'production' && React.Children.count(props.children)) {
      console.warn(
        `The global style component ${styledComponentId} was given child JSX. createGlobalStyle does not render children.`
      );
    }

    const { id, css } = useMemo(
      () => renderStyles(instance, props, ssc.styleSheet, theme, ssc.stylis),
      [props, ssc.styleSheet, theme, ssc.stylis]
    );
    const cssString = useMemo(() => css.join('\n'), [css]);

    console.log({ styledComponentId, id, css, cssString });
    const href = useMemo(() => hash(cssString), [cssString]);

    useInsertionEffect(() => {
      for (const style of document.querySelectorAll(`[data-precedence="${styledComponentId}"]`)) {
        if ((style as HTMLStyleElement).dataset.href === href) {
          debugger;
          console.log('the style is already in the document', style);
          continue;
        }
        console.log('removing the style', style);
        style.remove();
      }
    }, [href]);

    return (
      <style
        href={href}
        precedence={styledComponentId}
        data-sccid={styledComponentId}
        data-scid={id}
        ref={node => {
          console.log('the style has a ref?', node);
          return () => {
            console.log('the style is gone', node);
          };
        }}
      >
        {cssString}
      </style>
    );
  };

  function renderStyles(
    instance: number,
    props: ExecutionProps,
    styleSheet: StyleSheet,
    theme: DefaultTheme | undefined,
    stylis: Stringifier
  ) {
    if (globalStyle.isStatic) {
      return globalStyle.renderCSS(
        instance,
        STATIC_EXECUTION_CONTEXT as unknown as ExecutionContext & Props,
        styleSheet,
        stylis
      );
    } else {
      const context = {
        ...props,
        theme: determineTheme(props, theme, GlobalStyleComponent.defaultProps),
      } as ExecutionContext & Props;

      return globalStyle.renderCSS(instance, context, styleSheet, stylis);
    }
  }

  return React.memo(GlobalStyleComponent);
}

/** Hash a string using the djb2 algorithm. */
// from: https://github.com/souporserious/restyle/blob/4e71e9aa295803dd3cb47a47e3600a52b68bac38/src/utils.ts#L70C1-L77C2
function hash(value: string): string {
  let h = 5381;
  for (let index = 0, len = value.length; index < len; index++) {
    h = ((h << 5) + h + value.charCodeAt(index)) >>> 0;
  }
  return h.toString(36);
}
