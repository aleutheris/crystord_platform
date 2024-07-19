export interface Atom {
  labels: string[],
  bonds: string[],
  properties: AtomProperties
};

export interface AtomProperties {
  entries: AtomEntries,
  nuclearies: AtomNuclearies,
  ionies: {}
};

export interface AtomEntries {
  id: string,
  storedAt: string
};

export interface AtomNuclearies {
  title: string,
  description: string,
  content: string,
  constants: string[],
  operation: string,
  atomType: string
};
