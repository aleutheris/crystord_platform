import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NodeAtomMappingService {
  private nodeIdToUuid = new Map<string, string>();
  private uuidToNodeId = new Map<string, string>();

  /**
   * Register a mapping between a Rete node ID and an atom UUID
   */
  register(nodeId: string, uuid: string): void {
    this.nodeIdToUuid.set(nodeId, uuid);
    this.uuidToNodeId.set(uuid, nodeId);
  }

  /**
   * Get atom UUID by node ID
   */
  getUuidByNodeId(nodeId: string): string | undefined {
    return this.nodeIdToUuid.get(nodeId);
  }

  /**
   * Get node ID by atom UUID
   */
  getNodeIdByUuid(uuid: string): string | undefined {
    return this.uuidToNodeId.get(uuid);
  }

  /**
   * Clear all mappings
   */
  clear(): void {
    this.nodeIdToUuid.clear();
    this.uuidToNodeId.clear();
  }
}
