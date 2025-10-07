import { Injectable } from '@angular/core';
import { Atom, Bond } from '../atomhall/atom.model';
import { NodeElement, AtomTexted } from '../models/atom-models';

@Injectable({
  providedIn: 'root'
})
export class AtomTransformerService {

  constructor() { }

  /**
   * Converts atoms to indexed structure
   */
  getIndexedAtoms(atoms: Atom[]): Record<string, NodeElement> {
    const atomTree: Record<string, NodeElement> = {};

    const addAtomNode = (atom: Atom) => {
      const uuid = atom.properties.shellies.uuid;
      if (!atomTree[uuid]) {
        atomTree[uuid] = { uuid, children: [], data: atom };
      }
    };

    const addChildren = (parentUuid: string, childUuids: string[]) => {
      const parentNode = atomTree[parentUuid];

      childUuids.forEach(childUuid => {
        let childNode = atomTree[childUuid];

        if (!parentNode.children.some(child => child.uuid === childUuid)) {
          parentNode.children.push(childNode);
        }
      });
    };

    const buildHybridTree = (atoms: Atom[]): string => {
      atoms.forEach(addAtomNode);
      atoms.forEach(atom => {
        const parentUuid = atom.properties.shellies.uuid;
        const childUuids = atom.bonds.map(bond => bond.uuid);
        addChildren(parentUuid, childUuids);
      });

      return atoms.length > 0 ? atoms[0].properties.shellies.uuid : '';
    };

    buildHybridTree(atoms);
    return atomTree;
  }

  /**
   * Converts atoms content to string representation
   */
  atomsContentToString(data: Atom[], atomsIndexed: Record<string, NodeElement>): AtomTexted[] {
    let atomsTexted: AtomTexted[] = [];

    data.forEach((atom: Atom) => {
      atom.properties.nuclearies.content = this.convertContentToString(atom.properties.nuclearies.content);
      let operation = atom.properties.nuclearies.operation;

      let atomTexted: AtomTexted = {
        labels: atom.labels,
        bonds: atom.bonds.map(bond => bond.name),
        properties: {
          shellies: {
            uuid: atom.properties.shellies.uuid
          },
          nuclearies: {
            title: atom.properties.nuclearies.title,
            description: atom.properties.nuclearies.description,
            content: atom.properties.nuclearies.content,
            constants: JSON.stringify(atom.properties.nuclearies.constants),
            operation: this.convertOperationToTitled(operation, atom.bonds, atomsIndexed)
          }
        }
      };
      atomsTexted.push(atomTexted);
    });

    return atomsTexted;
  }

  /**
   * Converts content to string format
   */
  convertContentToString(content: any): string {
    let output = content;
    if (typeof content !== 'string') {
      output = JSON.stringify(content);
    }
    return output;
  }

  /**
   * Gets bonds UUIDs as string
   */
  getBondsUuidsString(bonds: Bond[]): string {
    let bondsText = '';
    bonds.forEach((bond: Bond) => {
      bondsText += bond.uuid + ', ';
    });
    return bondsText;
  }

  /**
   * Converts operation UUIDs to titles
   */
  convertOperationToTitled(operation: string, bonds: Bond[], atomsIndexed: Record<string, NodeElement>): string {
    let titledOperation = operation;
    bonds.forEach((bond: Bond) => {
      if (atomsIndexed[bond.uuid]) {
        titledOperation = titledOperation.replace(
          bond.uuid,
          atomsIndexed[bond.uuid].data.properties.nuclearies.title
        );
      }
    });
    return titledOperation;
  }

  /**
   * Converts operation titles back to UUIDs
   */
  convertOperationFromTitled(operation: string, atomsIndexed: Record<string, NodeElement>): string {
    let uuids = Object.keys(atomsIndexed);
    let uuidOperation = operation;

    uuids.forEach((uuid: string) => {
      if (atomsIndexed[uuid]) {
        uuidOperation = uuidOperation.replace(
          atomsIndexed[uuid].data.properties.nuclearies.title,
          uuid
        );
      }
    });

    return uuidOperation;
  }
}
