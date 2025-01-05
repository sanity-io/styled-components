import { BenchmarkType } from '../app/Benchmark';
import type { ImplementationComponents } from '../types';

interface ITree {
  breadth: number;
  components: ImplementationComponents;
  depth: number;
  id: number;
  wrap: number;
}

export default function Tree({ breadth, components, depth, id, wrap }: ITree) {
  const { Box } = components;

  let result = (
    <Box color={(id % 3) as 0 | 1 | 2} layout={depth % 2 === 0 ? 'column' : 'row'} outer>
      {depth === 0 && <Box color={((id % 3) + 3) as 3 | 4 | 5} fixed />}
      {depth !== 0 &&
        Array.from({ length: breadth }).map((el, i) => (
          <Tree
            breadth={breadth}
            components={components}
            depth={depth - 1}
            id={i}
            key={i}
            wrap={wrap}
          />
        ))}
    </Box>
  );
  for (let i = 0; i < wrap; i++) {
    result = <Box>{result}</Box>;
  }
  return result;
}

Tree.displayName = 'Tree';
Tree.benchmarkType = BenchmarkType.MOUNT;
