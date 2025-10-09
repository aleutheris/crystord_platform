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
import { GraphLayoutService } from '../services/graph-layout.service';
import { ReteGraphManagerService } from '../services/rete-graph-manager.service';
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
    GraphRightSidebarComponent
  ]
})
export class ControlOverviewComponent {
  async ngOnInit() {
    await this.reteManager.initializeReteEditor();
  }
  searchText: string;
  isSearchTextValid: boolean | undefined = undefined;
  searchKey: string;
  atomsFeatures: Atom[];
  atomsIndexed: Record<string, NodeElement>;
  atomsFeaturesTexted: AtomTexted[];

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
    private layoutService: GraphLayoutService,
    private reteManager: ReteGraphManagerService,
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
    if (!this.reteManager.isInitialized()) {
      return;
    }

    this.layoutService.rearrangeGraph(this.reteManager.getEditor(), this.reteManager.getArea());
  }

  saveGraph() {
    const atoms = this.atomStore.getAtomsValue();

    // Transform atoms to the format expected by form_atoms API
    const atomInputs = atoms.map(atom => ({
      labels: atom.labels,
      properties: {
        shellies: {
          uuid: atom.properties.shellies.uuid,
          changeHistory: atom.properties.shellies.changeHistory
        },
        nuclearies: {
          title: atom.properties.nuclearies.title,
          description: atom.properties.nuclearies.description,
          content: atom.properties.nuclearies.content,
          constants: atom.properties.nuclearies.constants,
          operation: atom.properties.nuclearies.operation
        }
      }
    }));

    const mq = {
      modification: 'form_atoms',
      args: {
        inputs: atomInputs
      }
    };

    this.atomService.modifyAtoms(mq).subscribe({
      next: (data) => {
        console.log('Atoms saved successfully:', data);
      },
      error: (error) => {
        console.error('There was an error saving the atoms:', error);
      }
    });
  }

  retrieveAtomsFeatures() {
    this.searchKey = this.searchService.updateSearchKey(this.searchText);
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

  handleRetrievedData() {
    this.atomsIndexed = this.transformerService.getIndexedAtoms(this.atomsFeatures);
    this.atomsFeaturesTexted = this.transformerService.atomsContentToString(this.atomsFeatures, this.atomsIndexed);
    this.createReteGraph();
  }

  private async createReteGraph() {
    const initialized = await this.reteManager.initializeReteEditor();
    if (initialized) {
      await this.reteManager.createReteGraph(this.atomsFeatures);
      this.layoutService.rearrangeGraph(this.reteManager.getEditor(), this.reteManager.getArea());
    }
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
