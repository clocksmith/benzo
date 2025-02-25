# Benzo: Simple Graph Builder v1

This is a basic, browser-based graph builder created with pure HTML, CSS, and JavaScript (no frameworks or external libraries). It allows you to create and manipulate graphs with nodes and edges directly in your web browser. Includes basic script playback for graph animation.

## Features

*   **Dark/Light Mode Toggle:** Switch between dark and light themes using the 🝰 icon in the top right corner.
*   **Script Playback:**
    *   **Script Selector:** Choose from predefined scripts in the dropdown menu at the top of the control panel.
    *   **Playback Controls:** Step forward, step backward, play/pause, and adjust playback speed using the slider.
*   **Graph Actions:**
    *   **Reset All:** Clears the entire graph, removing all nodes and edges.
    *   **Add Node:** Adds a new node at a random position on the canvas.
    *   **Remove Node:** Removes the most recently added node.
    *   **Connect Nodes:** Activates edge connection mode. Click on two nodes to create an edge between them. Click "Connect Nodes" again to deactivate.
*   **Templates:**
    *   **Add Circular Rings:**  Creates a series of concentric rings of nodes. Input a JSON array specifying the number of nodes in each ring (e.g., `[6,12,18]`).
    *   **Add Triangular Grid:** Creates a triangular grid layout of nodes. Input a number specifying the number of rings in the grid (e.g., `3`).

## Scripting Language

Scripts are defined in JSON format. Each script is an object where keys represent step names (e.g., "step1", "step2") and values are action objects. Steps are executed in the order of their keys.

**Action Types:**

*   `"reset": null` - Resets the graph.
*   `"add_node": null` - Adds a node at a random position.
*   `"remove_node": null` - Removes the last added node.
*   `"connect_nodes": { "node1": node_id_1, "node2": node_id_2 }` - Connects node with ID `node_id_1` to node with ID `node_id_2`.
*   `"add_circular_rings": [ring_size_1, ring_size_2, ...]` - Creates circular rings with the specified number of nodes in each ring.
*   `"add_triangular_grid": number_of_rings` - Creates a triangular grid with the specified number of rings.

**Example Script JSON:**

```json
{
  "step1": { "reset": null },
  "step2": { "add_circular_rings": [6] },
  "step3": { "add_node": null },
  "step4": { "add_node": null },
  "step5": { "connect_nodes": { "node1": 0, "node2": 1 } }
}