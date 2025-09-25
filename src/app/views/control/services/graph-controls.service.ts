import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface GraphControlAction {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  enabled?: boolean;
  visible?: boolean;
}

export interface GraphControlGroup {
  id: string;
  title: string;
  actions: GraphControlAction[];
  collapsible?: boolean;
  collapsed?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GraphControlsService {
  private controlGroupsSubject = new BehaviorSubject<GraphControlGroup[]>([]);
  public controlGroups$: Observable<GraphControlGroup[]> = this.controlGroupsSubject.asObservable();

  private sidebarStateSubject = new BehaviorSubject<boolean>(true);
  public sidebarExpanded$: Observable<boolean> = this.sidebarStateSubject.asObservable();

  constructor() {
    this.initializeDefaultControls();
  }

  /**
   * Initialize default graph controls
   */
  private initializeDefaultControls(): void {
    const defaultGroups: GraphControlGroup[] = [
      {
        id: 'view-controls',
        title: 'View Controls',
        actions: [
          {
            id: 'zoom-in',
            label: 'Zoom In',
            icon: 'cilZoomIn',
            action: () => this.zoomIn(),
            enabled: true,
            visible: true
          },
          {
            id: 'zoom-out',
            label: 'Zoom Out',
            icon: 'cilZoomOut',
            action: () => this.zoomOut(),
            enabled: true,
            visible: true
          },
          {
            id: 'fit-to-screen',
            label: 'Fit to Screen',
            icon: 'cilFullscreen',
            action: () => this.fitToScreen(),
            enabled: true,
            visible: true
          },
          {
            id: 'reset-view',
            label: 'Reset View',
            icon: 'cilReload',
            action: () => this.resetView(),
            enabled: true,
            visible: true
          }
        ],
        collapsible: true,
        collapsed: false
      },
      {
        id: 'node-controls',
        title: 'Node Controls',
        actions: [
          {
            id: 'add-node',
            label: 'Add Node',
            icon: 'cilPlus',
            action: () => this.addNode(),
            enabled: true,
            visible: true
          },
          {
            id: 'delete-selected',
            label: 'Delete Selected',
            icon: 'cilTrash',
            action: () => this.deleteSelected(),
            enabled: false,  // Disabled until selection
            visible: true
          }
        ],
        collapsible: true,
        collapsed: false
      }
    ];

    this.controlGroupsSubject.next(defaultGroups);
  }

  /**
   * Add a new control group
   */
  addControlGroup(group: GraphControlGroup): void {
    const currentGroups = this.controlGroupsSubject.value;
    this.controlGroupsSubject.next([...currentGroups, group]);
  }

  /**
   * Remove a control group by ID
   */
  removeControlGroup(groupId: string): void {
    const currentGroups = this.controlGroupsSubject.value;
    const filtered = currentGroups.filter(group => group.id !== groupId);
    this.controlGroupsSubject.next(filtered);
  }

  /**
   * Update control group enabled/disabled state
   */
  updateActionState(groupId: string, actionId: string, enabled: boolean): void {
    const currentGroups = this.controlGroupsSubject.value;
    const updatedGroups = currentGroups.map(group => {
      if (group.id === groupId) {
        const updatedActions = group.actions.map(action => {
          if (action.id === actionId) {
            return { ...action, enabled };
          }
          return action;
        });
        return { ...group, actions: updatedActions };
      }
      return group;
    });
    this.controlGroupsSubject.next(updatedGroups);
  }

  /**
   * Set sidebar expanded state
   */
  setSidebarExpanded(expanded: boolean): void {
    this.sidebarStateSubject.next(expanded);
  }

  /**
   * Get current sidebar state
   */
  getSidebarExpanded(): boolean {
    return this.sidebarStateSubject.value;
  }

  // Placeholder methods for graph control actions
  // These will be implemented to interact with the Rete graph
  private zoomIn(): void {
    console.log('Zoom In action triggered');
    // TODO: Implement zoom in functionality
  }

  private zoomOut(): void {
    console.log('Zoom Out action triggered');
    // TODO: Implement zoom out functionality
  }

  private fitToScreen(): void {
    console.log('Fit to Screen action triggered');
    // TODO: Implement fit to screen functionality
  }

  private resetView(): void {
    console.log('Reset View action triggered');
    // TODO: Implement reset view functionality
  }

  private addNode(): void {
    console.log('Add Node action triggered');
    // TODO: Implement add node functionality
  }

  private deleteSelected(): void {
    console.log('Delete Selected action triggered');
    // TODO: Implement delete selected functionality
  }
}
