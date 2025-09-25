import { Atom, Bond } from '../atomhall/atom.model';

export interface NodeElement {
  uuid: string;
  children: NodeElement[];
  data: Atom;
}

export interface AtomTexted {
  labels: string[];
  bonds: string;
  properties: {
    shellies: {
      uuid: string;
    };
    nuclearies: {
      title: string;
      description: string;
      content: string;
      constants: string;
      operation: string;
    };
  };
}

export interface SearchQuery {
  readout: string;
  args: {
    selector: {
      bonds: string[];
      labels: string[];
      properties: {
        shellies: {
          uuid: string;
        };
        nuclearies: {
          title: string;
          description: string;
          content: number;
          constants: string[];
          operation: string;
        };
      };
    };
  };
}

export interface UpdateQuery {
  modification: string;
  args: {
    selector: {
      properties: {
        shellies: {
          uuid: string;
        };
      };
    };
    inputs: {
      properties: {
        nuclearies: any;
      };
    };
  };
}
