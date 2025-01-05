export interface ImplementationComponents {
  Box: React.ComponentType<any>;
  Dot: React.ComponentType<any>;
  Provider: React.ComponentType<any>;
  View: React.ComponentType<any>;
}

export interface Implementation {
  components: ImplementationComponents;
  name: string;
  version: string;
}
