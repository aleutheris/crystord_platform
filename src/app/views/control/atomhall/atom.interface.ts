import { Injectable } from '@angular/core';
import { Atom } from './atom.model';
import { AtomService } from '../atomhall/atom.service';


@Injectable({
  providedIn: 'root',
})
export class AtomInterface {
  atomsFeatures = {};
  constructor(private atomService: AtomService) {}

  retrieveAtomsFeatures(searchText: string) {
    this.atomService.readAtoms(this.parseSearchText(searchText)).subscribe({
      next: (data) => {
        let atomData = this.atomsDataToCamelCase(data['result']);
        this.atomsFeatures = this.atomsDataContentToString(atomData);
      },
      error: (error) => {
        console.error('There was an error searching for atoms:', error);
      }
    });
  }

  // Private methods
  private parseSearchText(searchText: string): any {
    const result: {
      readout: string,
      args: {
        selector: {
          bonds: string[]
          labels: string[],
          properties: {
            shellies: {
              uuid: string
            },
            nuclearies: {
              title: string,
              description: string,
              content: number,
              constants: string[],
              operation: string
            }
          }
        }
      }
    } = {
      readout: 'retrieve_atoms_features',
      args: {
        selector: {
          bonds: [],
          labels: [],
          properties: {
            shellies: {
              uuid: ''
            },
            nuclearies: {
              title: '',
              description: '',
              content: 0.0,
              constants: [],
              operation: ''
            }
          }
        }
      }
    };

    const pairs = searchText.split(' ');

    pairs.forEach(pair => {
      const [key, value] = pair.split('=');

      if (key === 'labels') {
        result.args.selector.labels = value ? value.split(',') : [];
      }
    });

    return result;
  }

  private atomsDataToCamelCase(data: any) {
    data.forEach((atom: any) => {
      atom.properties.shellies.changeHistory = atom.properties.shellies.change_history;
      delete atom.properties.shellies.change_history;
    });
    return data;
  }

  private atomsDataContentToString(data: any) {
    data.forEach((atom: any) => {
      atom = this.convertAtomContentToString(atom);
    });
    return data;
  }

  private convertAtomContentToString(atom: Atom) {
    if (typeof atom.properties.nuclearies.content !== 'string') {
      atom.properties.nuclearies.content = JSON.stringify(atom.properties.nuclearies.content);
    }
    return atom;
  }

  private parseValue(value: any) {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
  }
}
