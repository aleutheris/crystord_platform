import { Injectable } from '@angular/core';
import { NodeTemplate } from '../models/node-template.types';
import { TemplateLoaderService } from './template-loader.service';

@Injectable({ providedIn: 'root' })
export class TemplateRegistryService {
  private templates = new Map<string, NodeTemplate>(); // key: template id
  private categories = new Map<string, string>(); // id -> label

  constructor(private loader: TemplateLoaderService) {}

  register(template: NodeTemplate): void {
    if (!template?.id) return;
    this.templates.set(template.id, template);
    if (template.category && !this.categories.has(template.category)) {
      // Default label capitalization if not provided elsewhere
      const label = template.category.charAt(0).toUpperCase() + template.category.slice(1);
      this.categories.set(template.category, label);
    }
  }

  getTemplate(id: string): NodeTemplate | undefined {
    return this.templates.get(id);
  }

  list(category?: string): NodeTemplate[] {
    const vals = Array.from(this.templates.values());
    return category ? vals.filter(t => t.category === category) : vals;
  }

  listCategories(): { id: string; label: string }[] {
    return Array.from(this.categories.entries()).map(([id, label]) => ({ id, label }));
  }

  // Lazy load a category's templates (id like 'arithmetic')
  async ensureCategoryLoaded(categoryId: string): Promise<void> {
    const templates = await this.loader.loadCategory(categoryId);
    templates.forEach(t => this.register(t));
  }
}
