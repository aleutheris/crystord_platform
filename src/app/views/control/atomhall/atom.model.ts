let PROPERTY_UUID = "uuid"

export interface Atom {
  labels: string[],
  bonds: Bond[],
  properties: AtomProperties,
  isDockTemplate?: boolean,
  isDirty?: boolean
};

export interface Bond {
  uuid: string,
  name: string,
  displayName?: string,
  direction: 'to' | 'from',
}

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
  constants: Record<string, any>,
  operation: string
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
