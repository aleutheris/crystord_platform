import { Injectable } from '@angular/core';
import { NodeEditor } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { AutoArrangePlugin, Presets as ArrangePresets, ArrangeAppliers } from 'rete-auto-arrange-plugin';
import { GetSchemes, ClassicPreset } from 'rete';
import { Schemes } from '../graph/rete-schemes';
// Use Schemes (with ExtendedNode) for auto-arrange plugin
import { AreaExtra } from '../config/rete-config';
@Injectable({
  providedIn: 'root'
})
export class GraphLayoutService {
  private arrange?: AutoArrangePlugin<Schemes>;
  private applier?: ArrangeAppliers.TransitionApplier<Schemes, never>;

  constructor() { }

  async rearrangeGraph(
    editor: NodeEditor<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>
  ): Promise<void> {
    if (!editor || !area) {
      return;
    }

    // Initialize AutoArrangePlugin if not already
    if (!this.arrange) {
      this.arrange = new AutoArrangePlugin<Schemes>();
      this.arrange.addPreset(ArrangePresets.classic.setup());
      area.use(this.arrange);
    }

    // Setup animated transition applier if not already
    if (!this.applier) {
      this.applier = new ArrangeAppliers.TransitionApplier<Schemes, never>({
        duration: 500,
        timingFunction: (t) => t,
        async onTick() {
          await AreaExtensions.zoomAt(area, editor.getNodes());
        }
      });
    }

    await this.arrange.layout({ applier: this.applier });
    await AreaExtensions.zoomAt(area, editor.getNodes());
  }
}
