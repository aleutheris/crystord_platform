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
  async ngOnInit() {}
  searchText: string;
  isSearchTextValid: boolean | undefined = undefined;
  searchKey: string;
  atomsFeatures: Atom[];
  atomsIndexed: Record<string, NodeElement>;
  atomsFeaturesTexted: AtomTexted[];
  graphNodes: GraphNode[] = [];

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
    // Simple auto-layout for Drawflow canvas: arrange nodes in a grid
    const cols = Math.max(1, Math.ceil(Math.sqrt(this.graphNodes.length)));
    const cellW = 220;
    const cellH = 160;
    this.graphNodes = this.graphNodes.map((n, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      return { ...n, x: 120 + c * cellW, y: 120 + r * cellH };
    });
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
    // Map atoms to GraphCanvas nodes
    const baseX = 120;
    const baseY = 120;
    const dx = 240;
    const dy = 180;
    this.graphNodes = this.atomsFeatures.map((atom, i) => ({
      id: atom.properties.shellies.uuid,
      x: baseX + (i % 4) * dx,
      y: baseY + Math.floor(i / 4) * dy,
      data: {
        title: atom.properties.nuclearies.title || 'Atom',
        content: typeof atom.properties.nuclearies.content === 'string'
          ? atom.properties.nuclearies.content
          : JSON.stringify(atom.properties.nuclearies.content)
      }
    }));

    // Trigger change detection by reassigning array (already done) and log for debugging
    console.debug('[Graph] Nodes updated:', this.graphNodes.length);
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

  /**
   * Handle right sidebar toggle event
   */
  onRightSidebarToggle(expanded: boolean): void {
    this.graphControlsService.setSidebarExpanded(expanded);
    console.log('Right sidebar toggled:', expanded ? 'expanded' : 'collapsed');
  }

}
