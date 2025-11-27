import { CommonModule } from '@angular/common';
import { Component, ViewChild, AfterViewChecked } from '@angular/core';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  FormControlDirective,
  TextColorDirective,
  ButtonDirective,
  TableDirective,
  InputGroupComponent,
  InputGroupTextDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormsModule } from '@angular/forms';
import { Atom } from '../atomhall/atom.model';
import { AtomService } from '../atomhall/atom.service';
import { AtomStoreService } from '../services/atom-store.service';
import { AtomSelectionService } from '../services/atom-selection.service';

// Import refactored services and models
import { NodeElement, AtomTexted, UpdateQuery } from '../models/atom-models';
import { AtomSearchService } from '../services/atom-search.service';
import { AtomTransformerService } from '../services/atom-transformer.service';
import { GraphCanvasComponent, GraphNode } from '../../../graph/canvas/graph-canvas.component';
import { computeDagreLayout } from '../../../graph/layout/dagre-layout';
import { GraphControlsService } from '../services/graph-controls.service';
import { GraphRightSidebarComponent, GraphSidebarConfig } from '../components/graph-right-sidebar';

// rxjs imports
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-control',
  templateUrl: './control.overview.component.html',
  styleUrls: ['./control.overview.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    FormControlDirective,
    FormsModule,
    TextColorDirective,
    ButtonDirective,
    TableDirective,
    IconDirective,
    GraphRightSidebarComponent,
    GraphCanvasComponent,
    InputGroupComponent,
    InputGroupTextDirective
  ]
})
export class ControlOverviewComponent {
  @ViewChild(GraphCanvasComponent) private graphCanvas?: GraphCanvasComponent; // still available if needed later
  async ngOnInit() {
    // Initialize search terms from default search text
    this.initializeSearchTerms();

    // Subscribe to atom store to keep graph in sync with sidebar changes (e.g. dirty state)
    this.atomStore.getAtoms$().subscribe(atoms => {
      // Only update if we have atoms (avoid initial empty state if not desired, or handle it)
      if (atoms.length > 0 || this.atomsFeatures.length > 0) {
        this.atomsFeatures = atoms;
        // Update derived data
        this.atomsIndexed = this.transformerService.getIndexedAtoms(this.atomsFeatures);
        this.atomsFeaturesTexted = this.transformerService.atomsContentToString(this.atomsFeatures, this.atomsIndexed);
        // Update graph
        this.updateGraphNodes(false);
      }
    });
  }
  searchText: string;
  isSearchTextValid: boolean | undefined = undefined;
  searchKey: string;

  // Search terms (chips)
  searchTerms: string[] = [];
  searchInputValue: string = '';

  atomsFeatures: Atom[];
  atomsIndexed: Record<string, NodeElement>;
  atomsFeaturesTexted: AtomTexted[];
  graphNodes: GraphNode[] = [];
  graphConnections: { from: string; to: string }[] = [];

  // Right sidebar properties
  rightSidebarVisible: boolean = true;
  rightSidebarConfig: GraphSidebarConfig = {
    width: {
      expanded: '600px',
      narrow: '60px'
    },
    defaultExpanded: true,
    title: 'Atom Features'
  };

  constructor(
    private atomService: AtomService,
    private searchService: AtomSearchService,
    private transformerService: AtomTransformerService,
    private graphControlsService: GraphControlsService,
    private atomStore: AtomStoreService,
    private atomSelection: AtomSelectionService
  ) {
    // this.searchText = 'uuid=cc249313-1d09-4614-ae53-e8d7826b0ba2';
    this.searchText = 'labels=groceries';
    this.isSearchTextValid = undefined;
    this.searchKey = '';
    this.atomsFeatures = [];
    this.atomsIndexed = {};
    this.atomsFeaturesTexted = [];
  }

  searchClickedAtom(atom: AtomTexted) {
    this.searchText = 'uuid=' + atom.properties.shellies.uuid;
    this.retrieveAtomsFeatures();
  }

  rearrangeGraph() {
    // Re-run auto layout on current atoms and bonds
    this.updateGraphNodes(true);
  }

  retrieveAtomsFeatures() {
    this.searchKey = this.searchService.updateSearchKey(this.searchText);
    if (this.searchKey === 'uuid') {
      const uuid = this.searchText.split('=')[1];
      lastValueFrom(this.atomService.readAtoms({ uuid }, 'network-only')).then((data) => {
        this.updateAtomsAndRender(data['result'], true);
        this.isSearchTextValid = true;
      }).catch((error) => {
        console.error('There was an error retrieving the atom:', error);
        this.isSearchTextValid = false;
      });
    } else {
      const retrievalInteraction = this.searchService.chooseRetrievalInteraction(this.searchKey);
      const query = this.searchService.parseSearchTextIntoQuery(this.searchText, retrievalInteraction);

      lastValueFrom(this.atomService.readAtoms(query, 'network-only')).then((data) => {
        this.updateAtomsAndRender(data['result'], true);
        this.isSearchTextValid = true;
      }).catch((error) => {
        console.error('There was an error searching for atoms:', error);
        this.isSearchTextValid = false;
      });
    }
  }

  /**
   * Unified method to update atomsFeatures and render graph.
   * Used by both search (fetch) and creation scenarios.
   * @param atoms - Array of atoms to process
   * @param replaceAll - If true, replace all atoms (search); if false, merge/append (create)
   */
  private updateAtomsAndRender(atoms: Atom[], replaceAll: boolean): void {
    if (replaceAll) {
      // Search scenario: replace all atoms
      this.atomsFeatures = atoms;
    } else {
      // Create scenario: merge/append atoms
      atoms.forEach(atom => {
        const existingIndex = this.atomsFeatures.findIndex(
          a => a.properties.shellies.uuid === atom.properties.shellies.uuid
        );
        if (existingIndex >= 0) {
          this.atomsFeatures[existingIndex] = atom;
        } else {
          this.atomsFeatures.push(atom);
        }
      });
    }

    // Populate displayName for all bonds to ensure UI shows titles instead of UUIDs/OP_DEPENDENCY
    const atomMap = new Map(this.atomsFeatures.map(a => [a.properties.shellies.uuid, a]));
    this.atomsFeatures.forEach(atom => {
      if (atom.bonds) {
        atom.bonds.forEach(bond => {
          const connectedAtom = atomMap.get(bond.uuid);
          if (connectedAtom) {
            bond.displayName = connectedAtom.properties.nuclearies.title || bond.name;
          }
        });
      }
    });

    // Update atom store (single source of truth)
    this.atomStore.setAtoms(this.atomsFeatures);

    // Update indexed and texted atoms
    this.atomsIndexed = this.transformerService.getIndexedAtoms(this.atomsFeatures);
    this.atomsFeaturesTexted = this.transformerService.atomsContentToString(this.atomsFeatures, this.atomsIndexed);

    // Defer graph updates to avoid ExpressionChangedAfterItHasBeenCheckedError
    Promise.resolve().then(() => {
      this.updateGraphNodes(true);
    });
  }

  private updateGraphNodes(recalculateLayout: boolean = true) {
    const nodes = this.atomsFeatures.map(atom => ({
      id: atom.properties.shellies.uuid,
      data: {
        title: atom.properties.nuclearies.title || 'Atom',
        content: typeof atom.properties.nuclearies.content === 'string'
          ? atom.properties.nuclearies.content
          : JSON.stringify(atom.properties.nuclearies.content),
        operator: typeof atom.properties.nuclearies.operation === 'string'
          ? atom.properties.nuclearies.operation
          : JSON.stringify(atom.properties.nuclearies.operation),
        isDirty: atom.isDirty
      }
    }));

    const edges = this.atomsFeatures.flatMap(atom => {
      const fromId = atom.properties.shellies.uuid;
      const bonds = atom.bonds ?? [];
      return bonds.map(b => b.direction === 'from' ? { from: b.uuid, to: fromId } : { from: fromId, to: b.uuid });
    });

    if (recalculateLayout) {
      try {
        const positioned = computeDagreLayout(
          nodes.map(n => ({ id: n.id, width: 154, height: 140 })),
          edges,
          { rankdir: 'LR', nodesep: 30, ranksep: 100, marginx: 60, marginy: 60 }
        );
        const posMap = new Map(positioned.map(p => [p.id, p] as const));
        this.graphNodes = nodes.map(n => ({
          id: n.id,
          x: (posMap.get(n.id)?.x ?? 0) + 60,
          y: (posMap.get(n.id)?.y ?? 0) + 60,
          data: n.data
        }));
      } catch (e) {
        console.warn('[Graph] Dagre layout failed:', e);
        // No fallback nodes - just leave graphNodes empty
        this.graphNodes = [];
      }
    } else {
      // Preserve existing positions
      const posMap = new Map(this.graphNodes.map(n => [n.id, { x: n.x, y: n.y }] as const));
      this.graphNodes = nodes.map(n => ({
        id: n.id,
        x: posMap.get(n.id)?.x ?? 0,
        y: posMap.get(n.id)?.y ?? 0,
        data: n.data
      }));
    }

    console.debug('[Graph] Nodes updated:', this.graphNodes.length);
    // Fit the view to show all nodes only if layout was recalculated
    if (recalculateLayout) {
      this.graphCanvas?.fitToView();
    }
    this.updateGraphConnections();
  }

  private updateGraphConnections(): void {
    const nodeIds = new Set(this.graphNodes.map(n => n.id));
    const pairs: { from: string; to: string }[] = [];
    for (const atom of this.atomsFeatures) {
      const fromId = atom.properties.shellies.uuid;
      if (!fromId || !nodeIds.has(fromId)) continue;
      const bonds = atom.bonds ?? [];
      for (const bond of bonds) {
        const toId = bond.uuid;
        if (!toId || !nodeIds.has(toId)) continue;
        if (bond.direction === 'from') {
          pairs.push({ from: toId, to: fromId });
        } else {
          pairs.push({ from: fromId, to: toId });
        }
      }
    }
    const key = (p: {from:string;to:string}) => p.from + '::' + p.to;
    const seen = new Set<string>();
    this.graphConnections = pairs.filter(p => {
      const k = key(p);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  updateAtomFeatures(index: number): void {
    const mq: UpdateQuery = {
      modification: 'update_atom_features',
      args: {
        selector: {
          properties: {
            shellies: {
              uuid: this.atomsFeaturesTexted[index].properties.shellies.uuid
            }
          }
        },
        inputs: {
          properties: {
            nuclearies: {
              operation: this.transformerService.convertOperationFromTitled(
                this.atomsFeaturesTexted[index].properties.nuclearies.operation,
                this.atomsIndexed
              )
            }
          }
        }
      }
    };

    this.atomService.modifyAtoms(mq).subscribe({
      next: (data) => {
        console.log('Atom data updated successfully:', data);
      },
      error: (error) => {
        console.error('There was an error updating the atom data:', error);
      }
    });
  }

  onRightSidebarToggle(expanded: boolean): void {
    this.graphControlsService.setSidebarExpanded(expanded);
    console.log('Right sidebar toggled:', expanded ? 'expanded' : 'collapsed');
  }

  onNodeSelected(nodeId: string | null): void {
    if (!nodeId) {
      // Deselection - keep last selected atom
      return;
    }
    // Notify the selection service which the sidebar listens to
    this.atomSelection.selectAtom(nodeId);
  }

  onAtomUpdated(updatedAtom: Atom): void {
    // Update the atom in our local arrays and the corresponding graph node
    const uuid = updatedAtom.properties.shellies.uuid;

    // Update in atomsFeatures array
    const atomIndex = this.atomsFeatures.findIndex(atom => atom.properties.shellies.uuid === uuid);
    if (atomIndex >= 0) {
      this.atomsFeatures[atomIndex] = updatedAtom;
    }

    // Update in atomsFeaturesTexted array
    const textedIndex = this.atomsFeaturesTexted.findIndex(atom => atom.properties.shellies.uuid === uuid);
    if (textedIndex >= 0) {
      this.atomsFeaturesTexted[textedIndex] = this.transformerService.atomsContentToString([updatedAtom], this.atomsIndexed)[0];
    }

    // Update the corresponding graph node
    const nodeIndex = this.graphNodes.findIndex(node => node.id === uuid);
    if (nodeIndex >= 0) {
      // Create new data object to trigger change detection
      this.graphNodes[nodeIndex] = {
        ...this.graphNodes[nodeIndex],
        data: {
          title: updatedAtom.properties.nuclearies.title || 'Atom',
          content: typeof updatedAtom.properties.nuclearies.content === 'string'
            ? updatedAtom.properties.nuclearies.content
            : JSON.stringify(updatedAtom.properties.nuclearies.content),
          operator: typeof updatedAtom.properties.nuclearies.operation === 'string'
            ? updatedAtom.properties.nuclearies.operation
            : JSON.stringify(updatedAtom.properties.nuclearies.operation)
        }
      };
      // Trigger change detection by creating new array reference
      this.graphNodes = [...this.graphNodes];
    }

    // Update atom store
    this.atomStore.updateAtom(updatedAtom);
  }

  onAtomCreated(newAtom: Atom): void {
    // Add the new atom using unified method
    this.updateAtomsAndRender([newAtom], false);
  }

  onAtomDeleted(deletedUuid: string): void {
    // Remove the atom from our local arrays
    this.atomsFeatures = this.atomsFeatures.filter(atom => atom.properties.shellies.uuid !== deletedUuid);

    // Update indexed atoms
    this.atomsIndexed = this.transformerService.getIndexedAtoms(this.atomsFeatures);

    // Update texted atoms
    const allTexted = this.transformerService.atomsContentToString(this.atomsFeatures, this.atomsIndexed);
    this.atomsFeaturesTexted = allTexted;

    // Update graph nodes and connections
    this.updateGraphNodes(true);

    // Update atom store
    this.atomStore.removeAtom(deletedUuid);
  }

  onNodeDataChanged(change: {nodeId: string, title?: string, content?: string}): void {
    // Find the corresponding atom and update it
    const atom = this.atomsFeatures.find(a => a.properties.shellies.uuid === change.nodeId);
    if (!atom) return;

    // Update the atom properties
    if (change.title !== undefined) {
      atom.properties.nuclearies.title = change.title;
    }
    if (change.content !== undefined) {
      atom.properties.nuclearies.content = change.content;
    }

    // Update the corresponding entry in atomsFeaturesTexted
    const textedIndex = this.atomsFeaturesTexted.findIndex(a => a.properties.shellies.uuid === change.nodeId);
    if (textedIndex >= 0) {
      this.atomsFeaturesTexted[textedIndex] = this.transformerService.atomsContentToString([atom], this.atomsIndexed)[0];
    }

    // Update atom store
    this.atomStore.updateAtom(atom);

    // Save the changes to backend
    const mq = {
      modification: 'update_atom_features',
      args: {
        selector: {
          properties: {
            shellies: {
              uuid: change.nodeId
            }
          }
        },
        inputs: {
          labels: atom.labels,
          properties: {
            nuclearies: {
              title: atom.properties.nuclearies.title,
              description: atom.properties.nuclearies.description,
              content: this.str2json(atom.properties.nuclearies.content),
              constants: atom.properties.nuclearies.constants,
              operation: this.str2json(atom.properties.nuclearies.operation)
            }
          }
        }
      }
    };

    this.atomService.modifyAtoms(mq).subscribe({
      next: (data) => {
        // Successfully saved
      },
      error: (error) => {
        console.error('Error saving node data changes:', error);
      }
    });
  }

  private str2json(value: any) {
    let result = value;
    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
      result = JSON.parse(value);
    }
    return result;
  }

  onConnectionCreated(connection: {from: string, to: string}): void {
    const fromAtom = this.atomsFeatures.find(a => a.properties.shellies.uuid === connection.from);
    const toAtom = this.atomsFeatures.find(a => a.properties.shellies.uuid === connection.to);

    if (fromAtom) {
      if (!fromAtom.bonds) {
        fromAtom.bonds = [];
      }
      const bondExists = fromAtom.bonds.some(b => b.uuid === connection.to && b.direction === 'to');
      if (!bondExists) {
        const toAtomName = toAtom?.properties.nuclearies.title || '';
        fromAtom.bonds.push({
          uuid: connection.to,
          name: 'OP_DEPENDENCY',
          displayName: toAtomName,
          direction: 'from'
        });
        this.atomStore.updateAtom(fromAtom);
      }
    }

    if (toAtom) {
      if (!toAtom.bonds) {
        toAtom.bonds = [];
      }
      const bondExists = toAtom.bonds.some(b => b.uuid === connection.from && b.direction === 'from');
      if (!bondExists) {
        const fromAtomName = fromAtom?.properties.nuclearies.title || '';
        toAtom.bonds.push({
          uuid: connection.from,
          name: 'OP_DEPENDENCY',
          displayName: fromAtomName,
          direction: 'to'
        });
        this.atomStore.updateAtom(toAtom);
      }
    }
  }

  onConnectionRemoved(connection: {from: string, to: string}): void {
    const fromAtom = this.atomsFeatures.find(a => a.properties.shellies.uuid === connection.from);
    const toAtom = this.atomsFeatures.find(a => a.properties.shellies.uuid === connection.to);

    if (fromAtom && fromAtom.bonds) {
      fromAtom.bonds = fromAtom.bonds.filter(b => !(b.uuid === connection.to && b.direction === 'to'));
      this.atomStore.updateAtom(fromAtom);
    }

    if (toAtom && toAtom.bonds) {
      toAtom.bonds = toAtom.bonds.filter(b => !(b.uuid === connection.from && b.direction === 'from'));
      this.atomStore.updateAtom(toAtom);
    }
  }

  addSearchTerm(term: string): void {
    if (term.trim() && !this.searchTerms.includes(term.trim())) {
      this.searchTerms.push(term.trim());
      this.updateSearchText();
    }
    this.searchInputValue = '';
  }

  removeSearchTerm(term: string): void {
    this.searchTerms = this.searchTerms.filter(t => t !== term);
    this.updateSearchText();
  }

  updateSearchText(): void {
    if (this.searchTerms.length > 0) {
      // Format search text with "labels=" prefix
      this.searchText = 'labels=' + this.searchTerms.join(',');
      this.isSearchTextValid = this.searchService.validateSearchText(this.searchText);
    } else {
      this.searchText = '';
      this.isSearchTextValid = undefined;
    }
  }

  initializeSearchTerms(): void {
    // Parse the default search text into chips
    if (this.searchText) {
      // Extract the value part after '=' if it exists
      const match = this.searchText.match(/=(.+)/);
      if (match) {
        const terms = match[1].split(',').map(t => t.trim()).filter(t => t);
        this.searchTerms = terms;
      }
    }
  }

  onSearchInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      const value = input.value.trim();
      if (value) {
        this.addSearchTerm(value);
      }
      // Trigger search after adding term (or immediately if no input)
      this.retrieveAtomsFeatures();
    } else if (event.key === ',' || event.key === ' ') {
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      const value = input.value.trim();
      if (value) {
        this.addSearchTerm(value);
      }
    } else if (event.key === 'Backspace' && !this.searchInputValue) {
      // Remove last search term when backspace is pressed on empty input
      if (this.searchTerms.length > 0) {
        this.removeSearchTerm(this.searchTerms[this.searchTerms.length - 1]);
      }
    }
  }

  onSearchInputBlur(): void {
    const value = this.searchInputValue.trim();
    if (value) {
      this.addSearchTerm(value);
    }
  }

  onSearchInputPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text');
    if (paste) {
      const terms = paste.split(',').map(term => term.trim()).filter(term => term);
      terms.forEach(term => this.addSearchTerm(term));
    }
  }
}
