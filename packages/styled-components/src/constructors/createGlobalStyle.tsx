import React, { use, useCallback, useInsertionEffect, useSyncExternalStore } from 'react';
import { ServerStyleSheet } from '../base';
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
    const theme = use(ThemeContext);
    // const [instance] = useState(() => ssc.styleSheet.allocateGSInstance(styledComponentId));
    const instanceRef = React.useRef(ssc.styleSheet.allocateGSInstance(styledComponentId));

    const instance = instanceRef.current;

    if (process.env.NODE_ENV !== 'production' && React.Children.count(props.children)) {
      console.warn(
        `The global style component ${styledComponentId} was given child JSX. createGlobalStyle does not render children.`
      );
    }

    if (
      process.env.NODE_ENV !== 'production' &&
      rules.some(rule => typeof rule === 'string' && rule.indexOf('@import') !== -1)
    ) {
      console.warn(
        `Please do not use @import CSS syntax in createGlobalStyle at this time, as the CSSOM APIs we use in production do not handle it well. Instead, we recommend using a library such as react-helmet to inject a typical <link> meta tag to the stylesheet, or simply embedding it manually in your index.html <head> section for a simpler app.`
      );
    }

    const isHydrating = useSyncExternalStore(
      useCallback(() => () => {}, []),
      () => false,
      () => true
    );

    // if (!__SERVER__) {
    useInsertionEffect(() => {
      if (!isHydrating) {
        const remove = [] as HTMLStyleElement[];
        for (const style of document.querySelectorAll(`[data-href*="${styledComponentId}"]`)) {
          // for (const style of document.querySelectorAll(`[data-precedence="sc"]`)) {
          // rehydrateSheetFromTag(ssc.styleSheet, style as HTMLStyleElement);
          // console.log('rehydrating the style', style);
          remove.push(style as HTMLStyleElement);
        }

        renderStyles(instance, props, ssc.styleSheet, theme, ssc.stylis);
        for (const style of remove) {
          console.log('removing the rehydrated style', style);
          style.remove();
        }

        return () => globalStyle.removeStyles(instance, ssc.styleSheet);
      }
    }, [instance, props, ssc.styleSheet, theme, ssc.stylis, isHydrating]);
    // }

    if (isHydrating) {
      const sheet = new ServerStyleSheet();
      // const styleSheet = IS_BROWSER ? sheet.instance : ssc.styleSheet;
      // renderStyles(instance, props, styleSheet, theme, ssc.stylis);
      // renderStyles(instance, props, ssc.styleSheet, theme, ssc.stylis);
      const context = {
        ...props,
        theme: determineTheme(props, theme, GlobalStyleComponent.defaultProps),
      } as ExecutionContext & Props;
      const { id, css } = globalStyle.renderCSS(
        instance,
        context,
        sheet.instance,
        // ssc.styleSheet,
        ssc.stylis
      );

      return (
        <>
          <style href={styledComponentId + '-' + hash(css.join(''))} precedence="scg">
            {css.join('')}
          </style>
          <style href="sc" precedence="sc"></style>
        </>
      );
      // const css = outputSheetModern(styleSheet);
      // const css = outputSheetModern(ssc.styleSheet);
      // globalStyle.removeStyles(instance, styleSheet);
      // console.log('css', css);
      // return (
      //   <>
      //     {css.map(([i, cssRules]) => {
      //       const href = hash(cssRules);
      //       return (
      //         <style
      //           key={href}
      //           href={href}
      //           // href={styledComponentId + '-' + hash(cssRules)}
      //           // precedence="scc"
      //           // precedence={SC_VERSION}
      //           // precedence="sc"
      //           precedence={`sc:${i}`}
      //         >
      //           {cssRules}
      //         </style>
      //       );
      //     })}
      //   </>
      // );
    }

    return null;
  };

  function renderStyles(
    instance: number,
    props: ExecutionProps,
    styleSheet: StyleSheet,
    theme: DefaultTheme | undefined,
    stylis: Stringifier
  ) {
    if (globalStyle.isStatic) {
      console.log('render static global style');
      globalStyle.renderStyles(
        instance,
        STATIC_EXECUTION_CONTEXT as unknown as ExecutionContext & Props,
        styleSheet,
        stylis
      );
    } else {
      console.log('render dynamic global style');
      const context = {
        ...props,
        theme: determineTheme(props, theme, GlobalStyleComponent.defaultProps),
      } as ExecutionContext & Props;

      globalStyle.renderStyles(instance, context, styleSheet, stylis);
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
