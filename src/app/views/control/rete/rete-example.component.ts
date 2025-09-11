import { AfterViewInit, Component, DestroyRef, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeEditor, GetSchemes, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
// Use Angular 18 renderer build (compatible with Angular v18)
import { AngularPlugin, Presets, AngularArea2D, ReteModule } from 'rete-angular-plugin/18';
import { Injector } from '@angular/core';

type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;

type AreaExtra = AngularArea2D<Schemes>;

@Component({
  selector: 'app-rete-example',
  standalone: true,
  imports: [CommonModule, ReteModule],
  templateUrl: './rete-example.component.html',
  styleUrls: ['./rete-example.component.scss']
})
export class ReteExampleComponent implements AfterViewInit {
  @ViewChild('reteContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  private injector = inject(Injector);
  private destroyRef = inject(DestroyRef);

  // Keep references to dispose on destroy
  private editor?: NodeEditor<Schemes>;
  private area?: AreaPlugin<Schemes, AreaExtra>;

  async ngAfterViewInit(): Promise<void> {
    const container = this.containerRef.nativeElement;

    // Initialize editor and rendering area
    const editor = new NodeEditor<Schemes>();
    const area = new AreaPlugin<Schemes, AreaExtra>(container);

    const render = new AngularPlugin<Schemes, AreaExtra>({ injector: this.injector });
    render.addPreset(Presets.classic.setup());

    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    connection.addPreset(ConnectionPresets.classic.setup());

    editor.use(area);
    area.use(render);
    area.use(connection);

    // Create a simple example graph with two nodes that can be dragged and connected
    const socket = new ClassicPreset.Socket('socket');

    const nodeA = new ClassicPreset.Node('Node A');
    nodeA.addControl('a', new ClassicPreset.InputControl('text', { initial: 'Hello' }));
    nodeA.addOutput('out', new ClassicPreset.Output(socket));

    const nodeB = new ClassicPreset.Node('Node B');
    nodeB.addControl('b', new ClassicPreset.InputControl('text', { initial: 'World' }));
    nodeB.addInput('in', new ClassicPreset.Input(socket));

    await editor.addNode(nodeA);
    await editor.addNode(nodeB);

    // Position nodes so they're visible apart
    await area.translate(nodeA.id, { x: 0, y: 0 });
    await area.translate(nodeB.id, { x: 300, y: 0 });

    // Add initial connection
    await editor.addConnection(new ClassicPreset.Connection(nodeA, 'out', nodeB, 'in'));

    // Store refs before scheduling viewport fit
    this.editor = editor;
    this.area = area;

    // Fit viewport to content after views are rendered
    setTimeout(() => {
      if (this.area && this.editor) {
        AreaExtensions.zoomAt(this.area, this.editor.getNodes());
      }
    }, 0);

    // Clean up on destroy
    this.destroyRef.onDestroy(() => {
      try {
        this.area?.destroy();
      } catch { /* noop */ }
    });
  }
}
