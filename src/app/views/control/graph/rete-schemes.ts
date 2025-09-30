import { GetSchemes, ClassicPreset } from 'rete';

// Official-style extended Node and Connection classes
export class Node extends ClassicPreset.Node {
	width = 180;
	height = 120;
}

export class Connection<N extends Node = Node> extends ClassicPreset.Connection<N, N> {}

export type Schemes = GetSchemes<Node, Connection<Node>>;

// Add more shared graph types here as needed
