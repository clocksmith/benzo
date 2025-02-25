# Benzo: Simple Graph Builder v1

This is a basic, browser-based graph builder created with pure HTML, CSS, and JavaScript (no frameworks or external libraries). It allows you to create and manipulate graphs with nodes and edges directly in your web browser.

## Features

*   **Dark/Light Mode Toggle:** Switch between dark and light themes using the sun/moon icon in the top right corner.
*   **Graph Actions:**
    *   **Reset All:** Clears the entire graph, removing all nodes and edges.
    *   **Add Node:** Adds a new node at a random position on the canvas.
    *   **Remove Node:** Removes the most recently added node.
    *   **Connect Nodes:** Activates edge connection mode. Click on two nodes to create an edge between them. Click "Connect Nodes" again to deactivate.
*   **Templates:**
    *   **Add Circular Rings:**  Creates a series of concentric rings of nodes. Input a JSON array specifying the number of nodes in each ring (e.g., `[6,12,18]`).
    *   **Add Triangular Grid:** Creates a triangular grid layout of nodes. Input a number specifying the number of rings in the grid (e.g., `3`).

## How to Use

1.  **Save the `index.html` file:** Save the provided HTML code as `index.html` in a directory on your computer.
2.  **Open in Browser:** Open the `index.html` file in any modern web browser (ideally Chromium-based for best compatibility as this was the target environment).
3.  **Interact with the Graph:** Use the control panel on the left to add, remove, connect nodes, and apply graph templates.

## v1 Notes

This is the first version of the graph builder, focusing on core functionality and a clean black and white interface. Future versions may include more features, styling options, and graph algorithms visualizations.