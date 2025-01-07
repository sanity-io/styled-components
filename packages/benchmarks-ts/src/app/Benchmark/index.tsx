/**
 * The MIT License (MIT)
 * Copyright (c) 2017 Paul Armstrong
 * https://github.com/paularmstrong/react-component-benchmark
 */

import React, {
  Profiler,
  startTransition,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
} from 'react';
import { getMean, getMedian, getStdDev } from './math';
import * as Timing from './timing';

export const BenchmarkType = {
  MOUNT: 'mount',
  UPDATE: 'update',
  UNMOUNT: 'unmount',
} as const;

const shouldRender = (cycle: number, type: string) => {
  switch (type) {
    // Render every odd iteration (first, third, etc)
    // Mounts and unmounts the component
    case BenchmarkType.MOUNT:
    case BenchmarkType.UNMOUNT:
      return !((cycle + 1) % 2);
    // Render every iteration (updates previously rendered module)
    case BenchmarkType.UPDATE:
      return true;
    default:
      return false;
  }
};

const shouldRecord = (cycle: number, type: string) => {
  switch (type) {
    // Record every odd iteration (when mounted: first, third, etc)
    case BenchmarkType.MOUNT:
      return !((cycle + 1) % 2);
    // Record every iteration
    case BenchmarkType.UPDATE:
      return true;
    // Record every even iteration (when unmounted)
    case BenchmarkType.UNMOUNT:
      return !(cycle % 2);
    default:
      return false;
  }
};

const isDone = (cycle: number, sampleCount: number, type: string) => {
  switch (type) {
    case BenchmarkType.MOUNT:
      return cycle >= sampleCount * 2 - 1;
    case BenchmarkType.UPDATE:
      return cycle >= sampleCount - 1;
    case BenchmarkType.UNMOUNT:
      return cycle >= sampleCount * 2;
    default:
      return true;
  }
};

const sortNumbers = (a: number, b: number) => a - b;

/**
 * Benchmark
 * TODO: documentation
 */
export default class Benchmark extends React.Component {
  static displayName = 'Benchmark2';

  static defaultProps = {
    sampleCount: 50,
    timeout: 10000, // 10 seconds
    type: BenchmarkType.MOUNT,
  };

  static Type = BenchmarkType;

  constructor(props, context) {
    console.log('OLD.constructor', { props, context });
    super(props, context);

    const cycle = 0;
    const componentProps = props.getComponentProps({ cycle });
    this.state = {
      componentProps,
      cycle,
      running: false,
    };
    this._startTime = 0;
    this._samples = [];
  }

  // runs outside render to avoid skewing results?
  UNSAFE_componentWillReceiveProps(nextProps) {
    console.log('OLD.componentWillReceiveProps', { nextProps }, this.props, this.state);
    if (nextProps) {
      this.setState(state => ({ componentProps: nextProps.getComponentProps(state.cycle) }));
    }
  }

  // runs outside of render agai? Detects exactly when the running state has changed
  componentWillUpdate(nextProps, nextState) {
    console.log('OLD.componentWillUpdate', { nextProps, nextState }, this.props, this.state);
    if (nextState.running && !this.state.running) {
      this._startTime = Timing.now();
      console.log('OLD set start time', this._startTime);
    }
  }

  componentDidUpdate() {
    console.log('OLD.componentDidUpdate', this.props, this.state);
    const { forceLayout, sampleCount, timeout, type } = this.props;
    const { cycle, running } = this.state;

    if (running && shouldRecord(cycle, type)) {
      this._samples[cycle].scriptingEnd = Timing.now();

      // force style recalc that would otherwise happen before the next frame
      if (forceLayout) {
        this._samples[cycle].layoutStart = Timing.now();
        if (document.body) {
          document.body.offsetWidth;
        }
        this._samples[cycle].layoutEnd = Timing.now();
      }
    }

    if (running) {
      const now = Timing.now();
      if (!isDone(cycle, sampleCount, type) && now - this._startTime < timeout) {
        this._handleCycleComplete();
      } else {
        this._handleComplete(now);
      }
    }
  }

  componentWillUnmount() {
    console.log('OLD.componentWillUnmount', this.props, this.state);
    if (this._raf) {
      window.cancelAnimationFrame(this._raf);
    }
  }

  render() {
    console.log('OLD.render', this.props, this.state);
    const { component: Component, type } = this.props;
    const { componentProps, cycle, running } = this.state;
    if (running && shouldRecord(cycle, type)) {
      console.log('OLD.render shouldRecord', Timing.now());
      this._samples[cycle] = { scriptingStart: Timing.now() };
    }
    if (running && shouldRender(cycle, type)) {
      console.log('OLD.render shouldRender', Timing.now());
    }
    return (
      <Profiler
        id="benchmark"
        onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime) => {
          console.log('OLD onRender', {
            id,
            phase,
            actualDuration,
            baseDuration,
            startTime,
            commitTime,
          });
        }}
      >
        {running && shouldRender(cycle, type) ? <Component {...componentProps} /> : null}
      </Profiler>
    );
  }

  start() {
    console.log('OLD.start', Timing.now());
    this._samples = [];
    this.setState(() => ({ running: true, cycle: 0 }));
  }

  _handleCycleComplete() {
    console.log('OLD._handleCycleComplete', this.props, this.state);
    const { getComponentProps, type } = this.props;
    const { cycle } = this.state;

    let componentProps;
    if (getComponentProps) {
      // Calculate the component props outside of the time recording (render)
      // so that it doesn't skew results
      componentProps = getComponentProps({ cycle });
      // make sure props always change for update tests
      if (type === BenchmarkType.UPDATE) {
        componentProps['data-test'] = cycle;
      }
    }

    console.log('OLD.requestAnimationFrame schedule');
    this._raf = window.requestAnimationFrame(() => {
      console.log('OLD.requestAnimationFrame fired');
      this.setState(state => ({
        cycle: state.cycle + 1,
        componentProps,
      }));
    });
  }

  getSamples() {
    console.log('OLD.getSamples', this.props, this.state);
    return this._samples.reduce(
      (memo, { scriptingStart, scriptingEnd, layoutStart, layoutEnd }) => {
        memo.push({
          start: scriptingStart,
          end: layoutEnd || scriptingEnd || 0,
          scriptingStart,
          scriptingEnd: scriptingEnd || 0,
          layoutStart,
          layoutEnd,
        });
        return memo;
      },
      []
    );
  }

  _handleComplete(endTime) {
    console.log('OLD._handleComplete', this.props, this.state);
    const { onComplete } = this.props;
    const samples = this.getSamples();

    this.setState(() => ({ running: false, cycle: 0 }));

    const runTime = endTime - this._startTime;
    const sortedElapsedTimes = samples.map(({ start, end }) => end - start).sort(sortNumbers);
    const sortedScriptingElapsedTimes = samples
      .map(({ scriptingStart, scriptingEnd }) => scriptingEnd - scriptingStart)
      .sort(sortNumbers);
    const sortedLayoutElapsedTimes = samples
      .map(({ layoutStart, layoutEnd }) => (layoutEnd || 0) - (layoutStart || 0))
      .sort(sortNumbers);

    onComplete({
      startTime: this._startTime,
      endTime,
      runTime,
      sampleCount: samples.length,
      samples: samples,
      max: sortedElapsedTimes[sortedElapsedTimes.length - 1],
      min: sortedElapsedTimes[0],
      median: getMedian(sortedElapsedTimes),
      mean: getMean(sortedElapsedTimes),
      stdDev: getStdDev(sortedElapsedTimes),
      meanLayout: getMean(sortedLayoutElapsedTimes),
      meanScripting: getMean(sortedScriptingElapsedTimes),
    });
  }
}

export interface BenchmarkRef {
  start: () => void;
}

type Sample = {
  scriptingStart: number;
  scriptingEnd?: number;
  layoutStart?: number;
  layoutEnd?: number;
};

export interface BenchmarkResults {
  sampleCount: number;
  mean: number;
  stdDev: number;
}

export interface BenchmarkProps {
  sampleCount: number;
  timeout: number;
  type: (typeof BenchmarkType)[keyof typeof BenchmarkType];
  getComponentProps: (props: { cycle: number }) => Record<string, any>;
  ref: React.Ref<BenchmarkRef>;
  component: any;
  onComplete: (results: BenchmarkResults) => void;
}

interface BenchmarkState {
  cycle: number;
  running: boolean;
}

type BenchmarkAction = { type: 'start' } | { type: 'cycle' } | { type: 'complete' };

export function BenchmarkProfiler(props: BenchmarkProps) {
  const {
    sampleCount = 50,
    timeout = 10_000, // 10 seconds
    type = BenchmarkType.MOUNT,
    getComponentProps,
    ref,
    component: Component,
    onComplete,
  } = props;

  const samplesRef = useRef<
    {
      start: number;
      end: number;
    }[]
  >([]);
  const _startTime = useRef(0);

  useImperativeHandle(
    ref,
    () => ({
      start: () => {
        samplesRef.current = [];
        dispatch({ type: 'start' });
      },
    }),
    []
  );

  const [state, dispatch] = useReducer(
    (state: BenchmarkState, action: BenchmarkAction) => {
      switch (action.type) {
        case 'start':
          return { ...state, running: true, cycle: 0 };
        case 'cycle':
          return { ...state, cycle: state.cycle + 1 };
        case 'complete':
          return { ...state, running: false, cycle: 0 };
        default:
          return state;
      }
    },
    { cycle: 0, running: false },
    ({ cycle, running }) => ({ cycle, running, componentProps: getComponentProps({ cycle }) })
  );

  const { cycle, running } = state;

  const runningRef = useRef(false);
  useEffect(() => {
    if (running && !runningRef.current) {
      _startTime.current = Timing.now();
    }
    runningRef.current = running;

    if (!running) return;

    const now = Timing.now();
    if (!isDone(cycle, sampleCount, type) && now - _startTime.current < timeout) {
      startTransition(() => dispatch({ type: 'cycle' }));
    } else {
      startTransition(() => dispatch({ type: 'complete' }));

      const samples = samplesRef.current.reduce(
        (memo, sample) => {
          memo.push(sample);
          return memo;
        },
        [] as typeof samplesRef.current
      );
      const sortedElapsedTimes = samples
        .filter(Boolean)
        .map(({ start, end }) => end - start)
        .sort(sortNumbers);

      onComplete({
        sampleCount: samples.length,
        mean: getMean(sortedElapsedTimes),
        stdDev: getStdDev(sortedElapsedTimes),
      });
    }
  }, [cycle, onComplete, running, sampleCount, timeout, type]);

  return (
    <Profiler
      id="benchmark"
      onRender={(_id, _phase, _actualDuration, _baseDuration, startTime, commitTime) => {
        if (running && shouldRecord(cycle, type)) {
          samplesRef.current[cycle] = {
            start: startTime,
            // end: startTime + actualDuration,
            end: commitTime,
          };
        }
        /*
        console.log('NEW onRender', {
          _id,
          _phase,
          _actualDuration,
          _baseDuration,
          startTime,
          commitTime,
        });
        // */
      }}
    >
      {running && shouldRender(cycle, type) ? (
        <Component
          // Since we're measuring the rendre of <Component /> with <Profiler /> we don't have to worry about
          // calculating the component props during render skewing testing results
          {...getComponentProps({ cycle })}
          // make sure props always change for update tests
          data-test={type === BenchmarkType.UPDATE ? cycle : undefined}
        />
      ) : null}
    </Profiler>
  );
}
BenchmarkProfiler.displayName = 'BenchmarkProfiler';
BenchmarkProfiler.Type = BenchmarkType;
