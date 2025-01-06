import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  // @ts-expect-error - fix later
  Picker,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import type { TestReport, Tests } from '../types';
import Benchmark from './Benchmark';
import { Button } from './Button';
import { IconClear, IconEye } from './Icons';
import { Layout } from './Layout';
import { ReportCard } from './ReportCard';
import { Text } from './Text';
import { colors } from './theme';

const overlay = <View style={[StyleSheet.absoluteFill, { zIndex: 2 }]} />;

export function App(props: {
  tests: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Tests<any>;
}) {
  const { tests } = props;
  const [state, setState] = useState<{
    currentBenchmarkName: string;
    currentLibraryName: string;
    status: 'idle' | 'running' | 'complete';
    results: TestReport[];
  }>(() => ({
    currentBenchmarkName: Object.keys(props.tests)[0],
    currentLibraryName: 'styled-components',
    status: 'idle',
    results: [],
  }));

  const _benchmarkRef = useRef<Benchmark>(null);
  const _benchWrapperRef = useRef<View>(null);
  const _scrollRef = useRef<ScrollView>(null);
  const _shouldHideBenchmark = useRef(false);

  const _handleChangeBenchmark = (value: string) => {
    setState(prev => ({ ...prev, currentBenchmarkName: value }));
  };

  const _handleChangeLibrary = (value: string) => {
    setState(prev => ({ ...prev, currentLibraryName: value }));
  };

  const _handleStart = () => {
    flushSync(() => setState(prev => ({ ...prev, status: 'running' })));
    if (_shouldHideBenchmark.current && _benchWrapperRef.current) {
      _benchWrapperRef.current.setNativeProps({ style: { opacity: 0 } });
    }
    _benchmarkRef.current!.start();
    _scrollToEnd();
  };

  // hide the benchmark as it is performed (no flashing on screen)
  const _handleVisuallyHideBenchmark = () => {
    _shouldHideBenchmark.current = !_shouldHideBenchmark.current;
    if (_benchWrapperRef.current) {
      _benchWrapperRef.current.setNativeProps({
        style: { opacity: _shouldHideBenchmark.current ? 0 : 1 },
      });
    }
  };

  const _createHandleComplete =
    ({ benchmarkName, libraryName, sampleCount }) =>
    results => {
      flushSync(() =>
        setState(state => ({
          ...state,
          results: state.results.concat([
            {
              ...results,
              benchmarkName,
              libraryName,
              libraryVersion: tests[benchmarkName][libraryName].version,
            },
          ]),
          status: 'complete',
        }))
      );
      _scrollToEnd();

      // console.log(results);
      // console.log(results.samples.map(sample => sample.elapsed.toFixed(1)).join('\n'));
    };

  const _handleClear = () => {
    setState(prev => ({ ...prev, results: [] }));
  };

  // scroll the most recent result into view
  const _scrollToEnd = () => {
    window.requestAnimationFrame(() => {
      _scrollRef.current?.scrollToEnd();
    });
  };

  const { currentBenchmarkName, status, currentLibraryName, results } = state;
  const currentImplementation = tests[currentBenchmarkName][currentLibraryName];
  const { Component, Provider, getComponentProps, sampleCount } = currentImplementation;

  return (
    <Layout
      actionPanel={
        <View>
          <View style={styles.pickers}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Library</Text>
              <Text style={{ fontWeight: 'bold' }}>{currentLibraryName}</Text>

              <Picker
                enabled={status !== 'running'}
                onValueChange={_handleChangeLibrary}
                selectedValue={currentLibraryName}
                style={styles.picker}
              >
                {Object.keys(tests[currentBenchmarkName]).map(libraryName => (
                  <Picker.Item key={libraryName} label={libraryName} value={libraryName} />
                ))}
              </Picker>
            </View>
            <View style={{ width: 1, backgroundColor: colors.fadedGray }} />
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Benchmark</Text>
              <Text testID="current-benchmark-name">{currentBenchmarkName}</Text>
              <Picker
                enabled={status !== 'running'}
                onValueChange={_handleChangeBenchmark}
                selectedValue={currentBenchmarkName}
                style={styles.picker}
                testID="benchmark-picker"
              >
                {Object.keys(tests).map(test => (
                  <Picker.Item key={test} label={test} value={test} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={{ flexDirection: 'row', height: 50 }}>
            <View style={styles.grow}>
              <Button
                onPress={_handleStart}
                style={styles.button}
                title={status === 'running' ? 'Running…' : 'Run'}
                disabled={status === 'running'}
                testID="run-button"
              />
            </View>
          </View>

          {status === 'running' ? overlay : null}
        </View>
      }
      listPanel={
        <View style={styles.listPanel}>
          <View style={styles.grow}>
            <View style={styles.listBar}>
              <View style={styles.iconClearContainer}>
                <TouchableOpacity onPress={_handleClear}>
                  <IconClear />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView ref={_scrollRef} style={styles.grow}>
              {results.map((r, i) => (
                <ReportCard
                  benchmarkName={r.benchmarkName}
                  key={i}
                  libraryName={r.libraryName}
                  libraryVersion={r.libraryVersion}
                  mean={r.mean}
                  meanLayout={r.meanLayout}
                  meanScripting={r.meanScripting}
                  runTime={r.runTime}
                  sampleCount={r.sampleCount}
                  stdDev={r.stdDev}
                />
              ))}
              {status === 'running' ? (
                <ReportCard benchmarkName={currentBenchmarkName} libraryName={currentLibraryName} />
              ) : null}
            </ScrollView>
          </View>
          {status === 'running' ? overlay : null}
        </View>
      }
      viewPanel={
        <View style={styles.viewPanel}>
          <View style={styles.iconEyeContainer}>
            <TouchableOpacity onPress={_handleVisuallyHideBenchmark}>
              <IconEye style={styles.iconEye} />
            </TouchableOpacity>
          </View>

          <Provider>
            {status === 'running' ? (
              <>
                <View ref={_benchWrapperRef}>
                  <Benchmark
                    // @ts-expect-error - fix later
                    component={Component}
                    forceLayout
                    getComponentProps={getComponentProps}
                    onComplete={_createHandleComplete({
                      sampleCount,
                      benchmarkName: currentBenchmarkName,
                      libraryName: currentLibraryName,
                    })}
                    ref={_benchmarkRef}
                    sampleCount={sampleCount}
                    timeout={20000}
                    // @ts-expect-error - fix later
                    type={Component.benchmarkType}
                  />
                </View>
              </>
            ) : (
              <Component {...getComponentProps({ cycle: 10 })} />
            )}
          </Provider>

          {status === 'running' ? overlay : null}
        </View>
      }
    />
  );
}
App.displayName = '@app/App';

const styles = StyleSheet.create({
  viewPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'black',
  },
  iconEye: {
    color: 'white',
    height: 32,
  },
  iconEyeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  iconClearContainer: {
    height: '100%',
    marginLeft: 5,
  },
  grow: {
    flex: 1,
  },
  listPanel: {
    flex: 1,
    width: '100%',
    marginHorizontal: 'auto',
  },
  listBar: {
    padding: 5,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.fadedGray,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
    justifyContent: 'flex-end',
  },
  pickers: {
    flexDirection: 'row',
  },
  pickerContainer: {
    flex: 1,
    padding: 5,
  },
  pickerTitle: {
    fontSize: 12,
    color: colors.deepGray,
  },
  picker: {
    ...StyleSheet.absoluteFillObject,
    appearance: 'none',
    opacity: 0,
    width: '100%',
  },
  button: {
    borderRadius: 0,
    flex: 1,
  },
});
