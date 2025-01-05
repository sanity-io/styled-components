import packageJson from '../package.json';

export async function getImplementations() {
  const modules = import.meta.glob('./implementations/*/index.ts', { eager: true });

  const dependencyMap = {
    emotion: '@emotion/styled',
  };

  const toImplementations = async () => {
    const implementations = Object.entries(modules).map(([path, module]) => {
      const components = (module as any).default;
      const name = path.split('/')[2]; // Get folder name from path
      const version = dependencies[dependencyMap[name] || name] || '';
      return { components, name, version };
    });

    return implementations;
  };

  const toObject = impls =>
    impls.reduce((acc, impl) => {
      acc[impl.name] = impl;
      return acc;
    }, {});

  const { dependencies } = packageJson;
  const implementations = await toImplementations();
  return toObject(implementations);
}
