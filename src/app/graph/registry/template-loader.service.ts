import { Injectable } from '@angular/core';
import { NodeTemplate } from '../models/node-template.types';

@Injectable({ providedIn: 'root' })
export class TemplateLoaderService {
  /**
   * Lazily load a category by its id (e.g., 'arithmetic').
   * This uses dynamic imports so templates are code-split by category.
   */
  async loadCategory(categoryId: string): Promise<NodeTemplate[]> {
    switch (categoryId) {
      case 'arithmetic': {
        const mod = await import('../templates/arithmetic/index');
        const list: NodeTemplate[] = [];
        if (mod.ARITHMETIC_TEMPLATES) list.push(...mod.ARITHMETIC_TEMPLATES);
        return list;
      }
      default:
        return [];
    }
  }
}
