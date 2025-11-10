import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormsModule } from '@angular/forms';
import { Atom } from '../atomhall/atom.model';
import { AtomService } from '../atomhall/atom.service';
import { AtomStoreService } from '../services/atom-store.service';

// Import refactored services and models
import { NodeElement, AtomTexted, UpdateQuery } from '../models/atom-models';
import { AtomSearchService } from '../services/atom-search.service';
import { AtomTransformerService } from '../services/atom-transformer.service';
import { GraphCanvasComponent, GraphNode } from '../../../graph/canvas/graph-canvas.component';
import { computeDagreLayout } from '../../../graph/layout/dagre-layout';
import { ViewChild } from '@angular/core';
import { GraphControlsService } from '../services/graph-controls.service';
import { GraphRightSidebarComponent, GraphSidebarConfig } from '../components/graph-right-sidebar';


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
    GraphCanvasComponent
  ]
})
export class ControlOverviewComponent {
  @ViewChild(GraphCanvasComponent) private graphCanvas?: GraphCanvasComponent; // still available if needed later
  async ngOnInit() {}
  searchText: string;
  isSearchTextValid: boolean | undefined = undefined;
  searchKey: string;
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
  private atomStore: AtomStoreService
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
    this.updateGraphNodes();
  }

  retrieveAtomsFeatures() {
    this.searchKey = this.searchService.updateSearchKey(this.searchText);
    if (this.searchKey === 'uuid') {
      const uuid = this.searchText.split('=')[1];
      this.atomService.readAtoms({ uuid }).subscribe({
        next: (data) => {
          this.atomsFeatures = data['result'];
          this.atomStore.setAtoms(this.atomsFeatures); // update atom store
          this.handleRetrievedData();
          this.isSearchTextValid = true;
        },
        error: (error) => {
          console.error('There was an error retrieving the atom:', error);
          this.isSearchTextValid = false;
        }
      });
    } else {
      const retrievalInteraction = this.searchService.chooseRetrievalInteraction(this.searchKey);
      const query = this.searchService.parseSearchTextIntoQuery(this.searchText, retrievalInteraction);

      this.atomService.readAtoms(query).subscribe({
        next: (data) => {
          this.atomsFeatures = data['result'];
          this.atomStore.setAtoms(this.atomsFeatures); // update atom store
          this.handleRetrievedData();
          this.isSearchTextValid = true;
        },
        error: (error) => {
          console.error('There was an error searching for atoms:', error);
          this.isSearchTextValid = false;
        }
      });
    }
  }

  handleRetrievedData() {
    this.atomsIndexed = this.transformerService.getIndexedAtoms(this.atomsFeatures);
    this.atomsFeaturesTexted = this.transformerService.atomsContentToString(this.atomsFeatures, this.atomsIndexed);
    this.updateGraphNodes();
  }

  private updateGraphNodes() {
    const nodes = this.atomsFeatures.map(atom => ({
      id: atom.properties.shellies.uuid,
      data: {
        title: atom.properties.nuclearies.title || 'Atom',
        content: typeof atom.properties.nuclearies.content === 'string'
          ? atom.properties.nuclearies.content
          : JSON.stringify(atom.properties.nuclearies.content)
      }
    }));

    const edges = this.atomsFeatures.flatMap(atom => {
      const fromId = atom.properties.shellies.uuid;
      const bonds = atom.bonds ?? [];
      return bonds.map(b => b.direction === 'from' ? { from: b.uuid, to: fromId } : { from: fromId, to: b.uuid });
    });

    try {
      const positioned = computeDagreLayout(
        nodes.map(n => ({ id: n.id, width: 220, height: 140 })),
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
      console.warn('[Graph] Dagre layout failed, falling back to grid:', e);
      const baseX = 120;
      const baseY = 120;
      const dx = 240;
      const dy = 180;
      this.graphNodes = nodes.map((node, i) => ({
        id: node.id,
        x: baseX + (i % 4) * dx,
        y: baseY + Math.floor(i / 4) * dy,
        data: node.data
      }));
    }

    console.debug('[Graph] Nodes updated:', this.graphNodes.length);
    // Fit the view to show all nodes
    this.graphCanvas?.fitToView();
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

}
