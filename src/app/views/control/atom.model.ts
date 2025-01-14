let PROPERTY_UUID = "uuid"

export interface Atom {
  labels: string[],
  bonds: string[],
  properties: AtomProperties
};

export interface AtomProperties {
  shellies: AtomShellies,
  nuclearies: AtomNuclearies,
  ionies: {}
};

export interface AtomShellies {
  uuid: string,
  changeHistory: []
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
