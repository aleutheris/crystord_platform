import {
	AfterViewChecked,
	AfterViewInit,
	Component,
	ElementRef,
	Input,
	QueryList,
	ViewChild,
	ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	ArithmeticNodeComponent,
	NodePortPointerEvent,
	NodePortType,
} from '../templates/arithmetic/node/arithmetic-node.component';

export interface GraphNodeData {
	title: string;
	content: string;
}

export interface GraphNode {
	id: string;
	x: number;
	y: number;
	data: GraphNodeData;
}

interface PortRef {
	nodeId: string;
	portId: string;
	type: NodePortType;
}

interface Connection {
	id: number;
	from: PortRef;
	to: PortRef;
}

interface Point {
	x: number;
	y: number;
}

interface DragConnection {
	startPort: PortRef;
	originConnectionId?: number;
	startPoint: Point;
	currentPoint: Point;
}

interface ViewportState {
	scale: number;
	x: number;
	y: number;
}

const DEFAULT_NODES: GraphNode[] = [
	{
		id: 'node-1',
		x: 120,
		y: 120,
		data: { title: 'Arithmetic', content: 'demo' }
	},
	{
		id: 'node-2',
		x: 360,
		y: 140,
		data: { title: 'Arithmetic 2', content: 'second' }
	}
];

@Component({
	selector: 'app-graph-canvas',
	templateUrl: './graph-canvas.component.html',
	styleUrls: ['./graph-canvas.component.scss'],
	standalone: true,
	imports: [CommonModule, ArithmeticNodeComponent]
})
export class GraphCanvasComponent implements AfterViewInit, AfterViewChecked {
	private _nodes: GraphNode[] = DEFAULT_NODES.map(node => ({ ...node, data: { ...node.data } }));

	@Input() set nodes(value: GraphNode[] | null | undefined) {
		this._nodes = (value && value.length)
			? value
			: DEFAULT_NODES.map(node => ({ ...node, data: { ...node.data } }));
	}

	get nodes(): GraphNode[] {
		return this._nodes;
	}

	@ViewChild('canvasRef', { static: true })
	private canvasRef!: ElementRef<HTMLDivElement>;

	@ViewChildren(ArithmeticNodeComponent)
	private nodeComponents!: QueryList<ArithmeticNodeComponent>;

	connections: Connection[] = [];
	dragConnection: DragConnection | null = null;
	selectedIndex: number | null = null;

	viewport: ViewportState = { scale: 1, x: 0, y: 0 };

	private isPanning = false;
	private panStart: Point | null = null;
	private viewportStart: Point | null = null;

	private hoveredPort: PortRef | null = null;
	private draggingNodeIndex: number | null = null;
	private dragOffsetX = 0;
	private dragOffsetY = 0;
	private nextConnectionId = 1;
	private nodeComponentMap = new Map<string, ArithmeticNodeComponent>();
	private canvasRect?: DOMRect;

	/**
	 * Bindable input: list of directed edges as node id pairs.
	 * Each pair links the output port ('default') of `from` node to the input port ('default') of `to` node.
	 */
	@Input() set autoConnections(pairs: { from: string; to: string }[] | null | undefined) {
		this.applyConnectionPairs(pairs ?? []);
	}

	private applyConnectionPairs(pairs: { from: string; to: string }[]): void {
		const nodeIds = new Set(this.nodes.map(n => n.id));
		this.connections = [];
		pairs.forEach(pair => {
			if (!pair.from || !pair.to || pair.from === pair.to) return;
			if (!nodeIds.has(pair.from) || !nodeIds.has(pair.to)) return;
			const fromPort: PortRef = { nodeId: pair.from, portId: 'default', type: 'output' };
			const toPort: PortRef = { nodeId: pair.to, portId: 'default', type: 'input' };
			this.connections.push({ id: this.nextConnectionId++, from: fromPort, to: toPort });
		});
	}

	ngAfterViewInit(): void {
		this.syncNodeComponentMap();
		this.updateCanvasRect();
	}

	ngAfterViewChecked(): void {
		this.syncNodeComponentMap();
	}

	trackNode(index: number, node: GraphNode): string {
		return node.id ?? String(index);
	}

	onCanvasPointerDown(event: PointerEvent): void {
		if (this.isBlankArea(event)) {
			this.selectedIndex = null;
			this.hoveredPort = null;
			this.blurActiveEditable();
			this.isPanning = true;
			this.panStart = { x: event.clientX, y: event.clientY };
			this.viewportStart = { x: this.viewport.x, y: this.viewport.y };
		}
	}

	onNodePointerDown(event: PointerEvent, index: number): void {
		if (!this.nodes[index]) return;
		this.selectedIndex = index;
		this.updateCanvasRect();

		const pointer = this.getPointerPosition(event);
		const node = this.nodes[index];
		this.draggingNodeIndex = index;
		this.dragOffsetX = pointer.x - node.x;
		this.dragOffsetY = pointer.y - node.y;

		this.blurActiveEditable();
		event.preventDefault();
		event.stopPropagation();
	}

	onNodePointerUp(): void {
		this.draggingNodeIndex = null;
	}

	onPortPointerDown(payload: NodePortPointerEvent, nodeIndex: number): void {
		const node = this.nodes[nodeIndex];
		if (!node) return;

		const portRef: PortRef = {
			nodeId: node.id,
			portId: payload.portId,
			type: payload.type
		};

		// Prevent node drag when starting from a port
		this.draggingNodeIndex = null;
		this.selectedIndex = nodeIndex;
		this.updateCanvasRect();

		if (payload.type === 'input') {
			const existing = this.findConnectionTo(portRef);
			if (!existing) {
				return; // inputs without connection cannot initiate a drag
			}
			this.removeConnection(existing.id);
			const fromPort = existing.from;
			const startPoint = this.getPortCenter(fromPort);
			if (!startPoint) {
				return;
			}
			this.dragConnection = {
				startPort: fromPort,
				originConnectionId: existing.id,
				startPoint,
				currentPoint: startPoint
			};
			this.blurActiveEditable();
			payload.event.preventDefault();
			payload.event.stopPropagation();
			return;
		}

		// Start a brand-new connection from an output port
		const startPoint = this.getPortCenter(portRef);
		if (!startPoint) {
			return;
		}
		this.dragConnection = {
			startPort: portRef,
			startPoint,
			currentPoint: startPoint
		};
		this.blurActiveEditable();
		payload.event.preventDefault();
		payload.event.stopPropagation();
	}

	onPortPointerEnter(payload: Omit<NodePortPointerEvent, 'event'>, nodeIndex: number): void {
		const node = this.nodes[nodeIndex];
		if (!node) return;
		this.hoveredPort = {
			nodeId: node.id,
			portId: payload.portId,
			type: payload.type
		};
	}

	onPortPointerLeave(payload: Omit<NodePortPointerEvent, 'event'>, nodeIndex: number): void {
		if (!this.hoveredPort) return;
		const node = this.nodes[nodeIndex];
		if (!node) return;
		if (
			this.hoveredPort.nodeId === node.id &&
			this.hoveredPort.portId === payload.portId &&
			this.hoveredPort.type === payload.type
		) {
			this.hoveredPort = null;
		}
	}

	onPointerMove(event: PointerEvent): void {
		if (!this.canvasRef) return;

		if (this.isPanning && this.panStart && this.viewportStart) {
			const dx = event.clientX - this.panStart.x;
			const dy = event.clientY - this.panStart.y;
			this.viewport.x = this.viewportStart.x + dx;
			this.viewport.y = this.viewportStart.y + dy;
		}

		if (this.draggingNodeIndex !== null) {
			this.updateCanvasRect();
			const pointer = this.getPointerPosition(event);
			const node = this.nodes[this.draggingNodeIndex];
			node.x = pointer.x - this.dragOffsetX;
			node.y = pointer.y - this.dragOffsetY;
			event.preventDefault();
		}

		if (this.dragConnection) {
			this.updateCanvasRect();
			this.dragConnection.currentPoint = this.getPointerPosition(event);
			event.preventDefault();
		}
	}

	onPointerUp(event: PointerEvent): void {
		this.draggingNodeIndex = null;
		this.isPanning = false;
		this.panStart = null;
		this.viewportStart = null;

		if (!this.dragConnection) {
			return;
		}

		const dropPort = this.hoveredPort;
		if (dropPort && this.isValidConnection(this.dragConnection.startPort, dropPort)) {
			const { outputPort, inputPort } = this.normalizePorts(this.dragConnection.startPort, dropPort);
			if (!outputPort || !inputPort) {
				this.dragConnection = null;
				this.hoveredPort = null;
				return;
			}

			// Enforce single connection per input port (Rete-style behaviour)
			const existing = this.findConnectionTo(inputPort);
			if (existing) {
				this.removeConnection(existing.id);
			}

			const id = this.dragConnection.originConnectionId ?? this.nextConnectionId++;
			this.connections.push({ id, from: outputPort, to: inputPort });
		}

		// If drop target invalid and we detached an existing connection, it remains removed.
		this.dragConnection = null;
		this.hoveredPort = null;
		this.blurActiveEditable();
		if (event.type === 'pointerup') {
			event.preventDefault();
		}
	}

	buildConnectionPath(connection: Connection): string {
		const start = this.getPortCenter(connection.from);
		const end = this.getPortCenter(connection.to);
		if (!start || !end) {
			return '';
		}
		return this.buildCurve(start, end);
	}

	buildDragPath(): string {
		if (!this.dragConnection) {
			return '';
		}
		const start = this.dragConnection.startPoint;
		const end = this.hoveredPort ? (this.getPortCenter(this.hoveredPort) ?? this.dragConnection.currentPoint) : this.dragConnection.currentPoint;
		return this.buildCurve(start, end);
	}

	private buildCurve(start: Point, end: Point): string {
		const dx = Math.max(Math.abs(end.x - start.x), 40);
		const controlOffset = dx * 0.5;
		const c1x = start.x + controlOffset;
		const c2x = end.x - controlOffset;
		return `M ${start.x} ${start.y} C ${c1x} ${start.y}, ${c2x} ${end.y}, ${end.x} ${end.y}`;
	}

	private normalizePorts(start: PortRef, target: PortRef): { outputPort?: PortRef; inputPort?: PortRef } {
		if (start.type === 'output' && target.type === 'input') {
			return { outputPort: start, inputPort: target };
		}
		if (start.type === 'input' && target.type === 'output') {
			return { outputPort: target, inputPort: start };
		}
		return {};
	}

	private isValidConnection(start: PortRef, target: PortRef): boolean {
		if (start.nodeId === target.nodeId && start.type === target.type) {
			return false;
		}
		return (start.type === 'output' && target.type === 'input') || (start.type === 'input' && target.type === 'output');
	}

	private findConnectionTo(port: PortRef): Connection | undefined {
		return this.connections.find(conn => conn.to.nodeId === port.nodeId && conn.to.portId === port.portId);
	}

	private removeConnection(id: number): void {
		this.connections = this.connections.filter(conn => conn.id !== id);
	}

	private getPortCenter(portRef: PortRef): Point | null {
		const component = this.nodeComponentMap.get(portRef.nodeId);
		if (!component) {
			return null;
		}
		const rect = component.getPortRect(portRef.type);
		if (!rect) {
			return null;
		}
		this.updateCanvasRect();
		const canvasRect = this.canvasRect;
		if (!canvasRect) {
			return null;
		}
		const canvasEl = this.canvasRef.nativeElement;
		// Screen/local coords of port center
		const screenX = rect.left - canvasRect.left + rect.width / 2 + canvasEl.scrollLeft;
		const screenY = rect.top - canvasRect.top + rect.height / 2 + canvasEl.scrollTop;
		// Convert to world
		return this.screenToWorld(screenX, screenY);
	}

	private getPointerPosition(event: PointerEvent): Point {
		this.updateCanvasRect();
		const canvasRect = this.canvasRect!;
		const canvasEl = this.canvasRef.nativeElement;
		// Convert screen to canvas local, then to world (inverse viewport transform)
		const localX = event.clientX - canvasRect.left + canvasEl.scrollLeft;
		const localY = event.clientY - canvasRect.top + canvasEl.scrollTop;
		return this.screenToWorld(localX, localY);
	}

	// Coordinate transforms
	private worldToScreen(x: number, y: number): Point {
		return {
			x: (x * this.viewport.scale) + this.viewport.x,
			y: (y * this.viewport.scale) + this.viewport.y
		};
	}

	private screenToWorld(x: number, y: number): Point {
		return {
			x: (x - this.viewport.x) / this.viewport.scale,
			y: (y - this.viewport.y) / this.viewport.scale
		};
	}

	zoomIn() { this.applyZoom(1.1); }
	zoomOut() { this.applyZoom(1/1.1); }

	private applyZoom(factor: number) {
		const prev = this.viewport.scale;
		let next = prev * factor;
		next = Math.min(3, Math.max(0.25, next));
		// Zoom towards center of canvas
		const canvasRect = this.canvasRef.nativeElement.getBoundingClientRect();
		const cx = canvasRect.width / 2;
		const cy = canvasRect.height / 2;
		// world point at center before
		const worldBefore = this.screenToWorld(cx, cy);
		this.viewport.scale = next;
		// adjust pan so that the same world point stays at center
		const screenAfter = this.worldToScreen(worldBefore.x, worldBefore.y);
		this.viewport.x += (cx - screenAfter.x);
		this.viewport.y += (cy - screenAfter.y);
	}

	private updateCanvasRect(): void {
		this.canvasRect = this.canvasRef?.nativeElement.getBoundingClientRect();
	}

	private syncNodeComponentMap(): void {
		if (!this.nodeComponents) {
			return;
		}
		const components = this.nodeComponents.toArray();
		this.nodeComponentMap.clear();
		components.forEach((component, index) => {
			const node = this.nodes[index];
			if (node) {
				this.nodeComponentMap.set(node.id, component);
			}
		});
	}

	private blurActiveEditable(): void {
		const active = document.activeElement as HTMLElement | null;
		if (!active) {
			return;
		}
		const tag = active.tagName.toLowerCase();
		if (tag === 'input' || tag === 'textarea' || active.isContentEditable) {
			active.blur();
		}
	}

	private isBlankArea(event: PointerEvent): boolean {
		const path = (event.composedPath?.() ?? []) as Array<EventTarget>;
		for (const t of path) {
			if (!(t instanceof HTMLElement)) continue;
			if (t.classList.contains('graph-node')) return false;
			if (t.classList.contains('df-node__port')) return false;
		}
		return true;
	}
}
