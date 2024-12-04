let PROPERTY_UUID = "uuid"

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
  uuid: string,
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

export interface NewAtom {
  title: string,
  labels: string[]
};

export interface SearchData {
  labels: string[],
  bonds: string[],
  properties: string[]
}
