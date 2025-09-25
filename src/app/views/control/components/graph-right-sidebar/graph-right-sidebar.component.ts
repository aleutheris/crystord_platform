import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import {
  SidebarComponent,
  SidebarHeaderComponent,
  SidebarFooterComponent,
  SidebarToggleDirective,
  ButtonDirective,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective
} from '@coreui/angular';
import { Atom } from '../../atomhall/atom.model';
import { AtomService } from '../../atomhall/atom.service';

export interface GraphSidebarConfig {
  width: {
    expanded: string;
    narrow: string;
  };
  defaultExpanded: boolean;
  title: string;
}

@Component({
  selector: 'app-graph-right-sidebar',
  templateUrl: './graph-right-sidebar.component.html',
  styleUrls: ['./graph-right-sidebar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    ButtonDirective,
    IconDirective,
    FormControlDirective,
    InputGroupComponent,
    InputGroupTextDirective
  ]
})
export class GraphRightSidebarComponent implements AfterContentInit {
  @Input() config: GraphSidebarConfig = {
    width: {
      expanded: '600px',
      narrow: '60px'
    },
    defaultExpanded: true,
    title: 'Create Atom'
  };

  @Input() visible: boolean = true;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() toggleEvent = new EventEmitter<boolean>();

  @ContentChild(TemplateRef) contentTemplate!: TemplateRef<any>;

  isExpanded: boolean = true;
  hasProjectedContent: boolean = false;

  // Atom creation properties (copied from detail component)
  newAtom: Atom = this.initializeNewAtom();

  constructor(private atomService: AtomService) {}

  ngOnInit() {
    this.isExpanded = this.config.defaultExpanded;
  }

  ngAfterContentInit() {
    this.hasProjectedContent = !!this.contentTemplate;
  }

  /**
   * Initialize a new atom with default structure (copied from detail component)
   */
  private initializeNewAtom(): Atom {
    return {
      labels: [],
      bonds: [],
      properties: {
        shellies: {
          uuid: '', // Empty string - UUID will be assigned by backend
          changeHistory: []
        },
        nuclearies: {
          title: '',
          description: '',
          content: '',
          constants: '',
          operation: ''
        },
        ionies: {}
      }
    };
  }

  /**
   * Create a new atom (copied exactly from detail component)
   */
  formAtoms() {
    let mq: {
      modification: string,
      args: {
        inputs: {
          labels: string[],
          properties: {
            nuclearies: {
              title: string
            }
          }
        }
      }
    } = {
      modification: 'form_atoms',
      args: {
        inputs: {
          labels: this.newAtom.labels,
          properties: {
            nuclearies: {
              title: this.newAtom.properties.nuclearies.title
            }
          }
        }
      }
    };

    this.atomService.modifyAtoms(mq).subscribe({
      next: (data) => {
        this.newAtom = data['result'];
        console.log('Atom created successfully:', data);
      },
      error: (error) => {
        console.error('There was an error creating the atom:', error);
      }
    });
  }

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
    this.toggleEvent.emit(this.isExpanded);
  }

  closeSidebar() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  get currentWidth(): string {
    return this.isExpanded ? this.config.width.expanded : this.config.width.narrow;
  }
}
