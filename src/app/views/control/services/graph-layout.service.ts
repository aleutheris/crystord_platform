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
  constructor() { }

  async rearrangeGraph(
    editor: NodeEditor<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>
  ): Promise<void> {
    if (!editor || !area) {
      return;
    }

    const arrange = new AutoArrangePlugin<Schemes>();
    arrange.addPreset(ArrangePresets.classic.setup());
    area.use(arrange);

    const applier = new ArrangeAppliers.TransitionApplier<Schemes, never>({
      duration: 500,
      timingFunction: (t) => t,
      async onTick() {
        await AreaExtensions.zoomAt(area, editor.getNodes());
      }
    });

    await arrange.layout({ applier });
    await AreaExtensions.zoomAt(area, editor.getNodes());
  }
}
