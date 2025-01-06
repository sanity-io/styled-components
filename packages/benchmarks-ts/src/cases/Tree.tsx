import { BenchmarkType } from '../app/Benchmark';
import type { TreeProps } from '../types';

export default function Tree({ breadth, components, depth, id, wrap }: TreeProps) {
  const { Box } = components;

  const children =
    depth !== 0 &&
    Array.from({ length: breadth }).map((_, i) => (
      <Tree
        breadth={breadth}
        components={components}
        depth={depth - 1}
        id={i}
        key={i}
        wrap={wrap}
      />
    ));
  const color = (id % 3) as 0 | 1 | 2;
  const layout = depth % 2 === 0 ? 'column' : 'row';

  let result = (
    <Box $color={color} color={color} $layout={layout} layout={layout} $outer outer>
      {depth === 0 && (
        <Box
          $color={((id % 3) + 3) as 3 | 4 | 5}
          color={((id % 3) + 3) as 3 | 4 | 5}
          $fixed
          fixed
        />
      )}
      {children}
    </Box>
  );
  for (let i = 0; i < wrap; i++) {
    result = <Box>{result}</Box>;
  }
  return result;
}

Tree.displayName = 'Tree';
Tree.benchmarkType = BenchmarkType.MOUNT;
