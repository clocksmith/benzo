# Benzo

LDR is a system for modeling and optimizing complex workflows, using a combination of dynamic weighted graphs, Large Language Models (LLMs), human-in-the-loop feedback, scripting, deliberation, and sub-graph exploration.  This README describes the core concepts, the LDR scripting language, and how the system works. This project is currently implemented with HTML, CSS, and JavaScript (using *no* external libraries, for maximum portability and transparency) and provides a visual, interactive representation of the graph and script execution.

## Core Concepts

The system represents workflows as a **dynamic, weighted, directed graph**.

*   **Nodes:** Represent different elements of the workflow:
    *   **Start Node:** The initiation point of a workflow or sub-goal.
    *   **Task Nodes:** Individual tasks within the workflow (e.g., "Identify Font," "Generate Code").
    *   **Solution Nodes:** Potential ways to accomplish a task (e.g., "Manual," "AI Agent").
    *   **End Node:** The completion point of a workflow or sub-goal.
    *   **Decision Nodes:** Points where the system (or an LLM) chooses between different paths.
*   **Edges:** Represent the flow and dependencies between nodes. Edges have *weights* that represent the "cost" of taking that path.  Cost can include:
    *   **Time Estimate:**  Estimated time to complete the task/solution.
    *   **Pain Level:**  The undesirability or tedium of the task for a human.
    *   **Complexity:**  The cognitive load or skill required.
    *   **Human-in-the-Loop Cost:**  The time/effort required for human review.
    *   **Resource Cost:** (Optional) Computational cost, subscription fees, etc.
    *   **Probability of Success:** (Especially important for LLM-driven solutions).

*   **Dynamic Graph:** The graph is *dynamic*.  Its structure (nodes and edges) and the weights on the edges can change during execution based on:
    *   **LLM Suggestions:** The LLM can suggest new tasks, solutions, or even compressions.
    *   **Human Feedback:**  Humans can provide feedback, add tasks, or modify the graph.
    *   **Task Outcomes:**  The success or failure of a task can influence the weights.
    * **Deliberation results**: When LLM or human personas deliberate, the graph changes.

*   **Dynamic Programming (Memoization):** The system uses dynamic programming to avoid redundant calculations by storing the optimal paths for sub-problems (e.g., "the best way to generate placeholder content").

*   **A\* Search:** The A\* algorithm is used to find the optimal (lowest cost) path through the graph, taking into account the weights on the edges and a heuristic estimate of the remaining cost to the goal. The LLM can provide this heuristic.

*   **LLM Roles:**
    *   **Action Selection:**  At decision nodes, the LLM chooses the best next action (e.g., which solution to use for a task).
    *   **Task Suggestion:** The LLM can analyze the current state and suggest new tasks that weren't initially considered.
    *   **Heuristic Generation:**  The LLM provides estimates of the remaining cost to the goal, improving the efficiency of A\*.
    *   **Code/Script Generation:** The LLM can generate code (e.g., Python, JavaScript) to automate tasks.
    *   **Deliberation:** Multiple LLM "personas" (with different expertise or perspectives) can engage in a structured debate to arrive at a better solution.

*   **Human-in-the-Loop:**  Human designers can:
    *   Provide feedback on LLM suggestions (ratings, corrections, explanations).
    *   Add new tasks or modify existing ones.
    *   Perform tasks that require human judgment or creativity.
    *   Participate in deliberation alongside LLM personas.

* **Sub-Graphs:** Allow for focused work on complex tasks. These represent a temporary "branching"
   of effort. Sub-graphs have the same algorithmic properties and rules as the root graph.
    * Triggered manually by a human or automatically by an LLM.
    * Subgraph work is merged into the main graph when complete (or rolled back).

*   **Compression:** Frequently used sequences of tasks can be compressed into single, higher-level tasks, simplifying the graph and improving efficiency. The LLM can suggest compressions.

* **Deliberation:** Multiple AI or human *personas* review options and provide reason, critique and suggestions. A moderator synthesizes all the inforamtion.

## LDR Scripting Language

The LDR Scripting Language is a JSON-based language for defining sequences of actions (visualizations) to be performed on the graph. It is used for:

*   **Demonstration:**  Illustrating the system's capabilities and how it works.
*   **Visualization:**  Providing a visual representation of the graph manipulation process.
*   **Testing:**  Creating reproducible test cases.
*   **Automation:** Defining and running pre-set graph operations (though the core system is designed for dynamic decision-making, not just script execution).

Scripts are JSON objects. Keys are step names (e.g., "step1"), and values are action objects. Steps run sequentially.

**LDR Action Types:**

*   `"reset": null` - Resets the graph to its initial state (clears all nodes and edges).
*   `"add_node": { "id": "node_id", "data": { ... }, "type": "task" }` - Adds a new node.  `id` is a unique identifier. `data` is an object containing node-specific data (e.g., task details). `type` is a string indicating the node type (e.g., "task", "solution", "start", "end", "decision").
*   `"remove_node": null` - Removes the *last added* node.  (For more precise control, a future version might allow specifying a node ID).
*   `"connect_nodes": { "node1": "node_id_1", "node2": "node_id_2" }` - Creates an edge between two existing nodes.
*   `"add_circular_rings": [ring_size_1, ring_size_2, ...]` - Creates concentric rings of nodes.  The array specifies the number of nodes in each ring.
*   `"add_triangular_grid": number_of_rings` - Creates a triangular grid of nodes.
*   `"select_path": [node_id_1, node_id_2, ...]` - Selects a sequence of nodes, highlighting them.
*   `"copy_move_to_focus": null` - Copies the currently selected path to a separate "focus area" (observatory) for closer examination.
*   `"straighten_path": null` - Arranges the nodes in the focus area in a horizontal line.
*   `"compress_path": null` - Visually compresses the path in the focus area, replacing the intermediate nodes with a single edge.
*   `"add_compressed_path_to_graph": null` - Adds a compressed path (represented by a single edge) back to the main graph.
* `"create_subgraph": { "parentNodeId": "node_id", "subGraphId": "goal_description" }` -  Visually indicates the creation of a sub-graph, associated with a parent node.
* `"merge_subgraph": { "parentNodeId": "node_id", "subGraphId": "goal_description", "mergeStrategy": "add_nodes" }` - Visually indicates merging a sub-graph.  `mergeStrategy` can be "add_nodes" (add all sub-graph nodes and edges), "update_parent" (update parent node data), or "compress" (create a compressed task).

**Example LDR Script:**

```json
{
  "my_script": {
    "step1": { "reset": null, "message": "Initial state." },
    "step2": { "add_node": { "id": "start", "type": "start", "data": {} }, "message": "Add start node."},
    "step3": { "add_node": { "id": "task1", "type": "task", "data": { "title": "My Task" } } },
    "step4": { "connect_nodes": { "node1": "start", "node2": "task1" } },
    "step5": { "add_node": { "id": "end", "type": "end", "data": {} } },
    "step6": { "connect_nodes": { "node1": "task1", "node2": "end" } },
    "step7": { "select_path": ["start", "task1", "end"] },
    "step8": { "copy_move_to_focus": null },
    "step9": { "straighten_path": null },
      "step10": {
      "message": "Creating a sub-graph for detailed task analysis."
    },
    "step11": {
      "create_subgraph": { "parentNodeId": "task1", "subGraphId": "Analyze Task 1 Options" }
    },
        "step12": {
            "message": "Sub-graph work complete, merging back."
        },
        "step13": {
            "merge_subgraph": { "parentNodeId": "task1", "subGraphId": "Analyze Task 1 Options", "mergeStrategy": "add_nodes" }
        },
    "step14": { "compress_path": null },
    "step15": { "add_compressed_path_to_graph": null }
  }
}

## Setup

Simply open the index.html file in a web browser.

Interaction: Use the controls in the left panel to manipulate the graph, run scripts, and adjust settings. The main graph is displayed in the center, and the "observatory" area at the top is used for focused views.

Scripts:

The 'script.js' file should export a const called 'scripts' which is a map of script-keys to LDR scripts. For example

```
export const scripts = {
    "script-key-1": { //LDR script },
    "script-key-2": { //LDR script }
 };
 ```

## TODOs

TODO: Full LLM Integration - Replace the mocked LLM calls with connections to real LLM APIs.

TODO: Deliberation iteration - Implement sophisticated methods for synthesizing persona responses in deliberations.

TODO Subgraph execution - Enable full execution of workflows within sub-graphs, including recursive sub-graph creation.

TODO Save state, continuation, persistance - Implement mechanisms for saving and loading graph data.

TODO: UX improvements - Enhance the UI for better usability and visual clarity.

TODO: Additional LDR commands - allow for more functionality directly from LDR scripting