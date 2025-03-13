/**
 * @file ldr.js
 * Defines the LDR(S) (Lucid Diagram RenderScript) language and its commands.
 */

// Lexiographic order.
export const commandNames = [
    'add_circular_rings',
    'add_compressed_path_to_graph',
    'add_node',
    'add_triangular_grid',
    'compress_path',
    'connect_nodes',
    'copy_move_to_focus',
    'create_subgraph',
    'merge_subgraph',
    'message_only',
    'remove_node',
    'reset',
    'select_path',
    'straighten_path',
];
const commands = new Set(commandNames);


/**
 * Example processor an LDR script defined as a JSON object.
 *
 * @param {object} ldrsScript - JSON object representing the LDRS script.
 *                               Keys are step numbers, values are step definitions.
 *                               Each step definition is an object where:
 *                                 - key string - The command to execute (see list of commands below).
 *                                 - value: params object - Parameters for the command (command-specific, see below).
 *                                   - message: string - Description of the step (optional, included in params).
 *
 * **LDRS Commands:**
 *
 * {@link LDR.add_circular_rings} - Adds circular rings of nodes to the diagram.
 * {@link LDR.add_compressed_path_to_graph} - Adds a compressed path to the graph.
 * {@link LDR.add_node} - Adds a node to the diagram.
 * {@link LDR.add_triangular_grid} - Adds a triangular grid of nodes to the diagram.
 * {@link LDR.compress_path} - Compresses a path in the diagram.
 * {@link LDR.connect_nodes} - Connects two nodes in the diagram.
 * {@link LDR.copy_move_to_focus} - Copies and moves nodes to focus.
 * {@link LDR.create_subgraph} - Creates a subgraph.
 * {@link LDR.merge_subgraph} - Merges a subgraph.
 * {@link LDR.message_only} - Displays a message without performing any diagram operation.
 * {@link LDR.remove_node} - Removes a node from the diagram.
 * {@link LDR.reset} - Resets the diagram display.
 * {@link LDR.select_path} - Selects a path in the diagram.
 * {@link LDR.straighten_path} - Straightens a path in the diagram.
 */
function exampleLdrProcessor(ldrsScript) {
    if (!ldrsScript) {
        console.error("LDR Script is empty or null.");
        return;
    }

    const commandRenderMap = new Map([
        ['add_circular_rings', renderAddCircularRings],
        ['add_compressed_path_to_graph', renderAddCompressedPath],
        ['add_node', renderAddNode],
        ['add_triangular_grid', renderAddTriangularGrid],
        ['compress_path', renderCompressPath],
        ['connect_nodes', renderConnectNodes],
        ['copy_move_to_focus', renderCopyMoveToFocus],
        ['create_subgraph', renderCreateSubGraph],
        ['merge_subgraph', renderMergeSubGraph],
        ['message_only', renderMessageOnly],
        ['remove_node', renderRemoveNode],
        ['reset', resetDisplay],
        ['select_path', renderSelectPath],
        ['straighten_path', renderStraightenPath],
    ]);


    for (const stepNumber in ldrsScript) {
        if (ldrsScript.hasOwnProperty(stepNumber)) {
            const stepDefinition = ldrsScript[stepNumber];
            if (!stepDefinition) {
                console.warn(`Step ${stepNumber} is invalid.`);
                continue;
            }

            const commandName = Object.keys(stepDefinition)[0];
            const params = stepDefinition[commandName];

            if (!commandName) {
                console.warn(`Step ${stepNumber} is missing command.`);
                continue;
            }

            const renderFunction = commandRenderMap.get(commandName);
            if (renderFunction) {
                console.log(`Executing Step ${stepNumber}: ${commandName} - ${params.message || ''}`);
                renderFunction(params);
            } else {
                console.warn("Unknown render action:", commandName);
            }
        }
    }
}

/**
 * **LDRS Command:** Adds circular rings of nodes to the diagram.
 * @function LDR.add_circular_rings
 * @param {number[]} params.ringSizes - Array of sizes for each circular ring.
 * @param {string} [params.message] - Description of the step (optional).
 * @example
 * {
 *   "command": "add_circular_rings",
 *   "params": {
 *     "ringSizes": [5, 10, 15],
 *     "message": "Adding circular rings of nodes"
 *   }
 * }
 */
function renderAddCircularRings(params) {
    const { ringSizes } = params;
    console.log("renderAddCircularRings", ringSizes);
    // Implement your diagram rendering logic here to add circular rings.
}

/**
 * **LDRS Command:** Adds a compressed path to the graph.
 * @function LDR.add_compressed_path_to_graph
 * @param {string} params.startNodeId - ID of the start node of the compressed path.
 * @param {string} params.endNodeId - ID of the end node of the compressed path.
 * @param {string} params.compressedNodeId - ID of the compressed node representing the path.
 * @param {number} params.compressedWeight - Weight of the compressed path.
 * @param {string} [params.message] - Description of the step (optional).
 * @example
 * {
 *   "command": "add_compressed_path_to_graph",
 *   "params": {
 *     "startNodeId": "M",
 *     "endNodeId": "O",
 *     "compressedNodeId": "M-O",
 *     "compressedWeight": 5,
 *     "message": "Adding compressed path M-O"
 *   }
 * }
 */
function renderAddCompressedPath(params) {
    const { startNodeId, endNodeId, compressedNodeId, compressedWeight } = params;
    console.log("renderAddCompressedPath", startNodeId, endNodeId, compressedNodeId, compressedWeight);
    // Implement your diagram rendering logic here to add a compressed path.
}


/**
 * **LDRS Command:** Adds a node to the diagram.
 * @function LDR.add_node
 * @param {string} params.nodeId - The ID of the node to add.
 * @param {object} params.data - Data associated with the node.
 * @param {string} params.kind - Kind of the node.
 * @param {string} [params.message] - Description of the step (optional).
 * @example
 * {
 *   "add_node": {
 *     "nodeId": "myNode",
 *     "data": { "label": "My Node" },
 *     "kind": "circle",
 *     "message": "Adding a new node"
 *   }
 * }
 */
function renderAddNode(params) {
    const { nodeId, data, kind } = params;
    console.log("renderAddNode", nodeId, data, kind);
    // Implement your diagram rendering logic here to add a node.
}

/**
 * **LDRS Command:** Adds a triangular grid of nodes to the diagram.
 * @function LDR.add_triangular_grid
 * @param {number} params.numRings - Number of rings in the triangular grid.
 * @param {string} [params.message] - Description of the step (optional).
 * @example
 * {
 *   "command": "add_triangular_grid",
 *   "params": {
 *     "numRings": 4,
 *     "message": "Adding a triangular grid"
 *   }
 * }
 */
function renderAddTriangularGrid(params) {
    const { numRings } = params;
    console.log("renderAddTriangularGrid", numRings);
    // Implement your diagram rendering logic here to add a triangular grid.
}

/**
 * **LDRS Command:** Compresses a path in the diagram.
 * @function LDR.compress_path
 * @param {string} params.startNodeId - ID of the starting node of the path.
 * @param {string} params.endNodeId - ID of the ending node of the path.
 * @param {string[]} params.intermediateNodes - Array of IDs of intermediate nodes in the path.
 * @param {string} [params.message] - Description of the step (optional).
 * @example
 * {
 *   "command": "compress_path",
 *   "params": {
 *     "startNodeId": "J",
 *     "endNodeId": "L",
 *     "intermediateNodes": ["K"],
 *     "message": "Compressing path J-K-L"
 *   }
 * }
 */
function renderCompressPath(params) {
    const { startNodeId, endNodeId, intermediateNodes } = params;
    console.log("renderCompressPath", startNodeId, endNodeId, intermediateNodes);
    // Implement your diagram rendering logic here to compress a path.
}

/**
 * **LDRS Command:** Connects two nodes in the diagram.
 * @function LDR.connect_nodes
 * @param {string} params.node1 - ID of the first node.
 * @param {string} params.node2 - ID of the second node.
 * @param {number} [params.weight] - Weight of the connection (optional).
 * @param {string} [params.edgeType] - Kind of the edge (optional).
 * @param {string} [params.message] - Description of the step (optional).
 * @example
 * {
 *   "connect_nodes": {
 *     "node1": "A",
 *     "node2": "B",
 *     "weight": 2,
 *     "edgeType": "dashed",
 *     "message": "Connecting nodes A and B"
 *   }
 * }
 */
function renderConnectNodes(params) {
    const { node1, node2, weight, edgeType } = params;
    console.log("renderConnectNodes", node1, node2, weight, edgeType);
    // Implement your diagram rendering logic here to connect nodes.
}

/**
 * **LDRS Command:** Copies and moves nodes to focus in the diagram.
 * @function LDR.copy_move_to_focus
 * @param {string[]} params.nodeIds - Array of node IDs to copy and move.
 * @param {string} [params.message] - Description of the step (optional).
 * @example
 * {
 *   "copy_move_to_focus": {
 *     "nodeIds": ["E", "F"],
 *     "message": "Focusing on nodes E and F"
 *   }
 * }
 */
function renderCopyMoveToFocus(params) {
    const { nodeIds } = params;
    console.log("renderCopyMoveToFocus", nodeIds);
    // Implement your diagram rendering logic here to copy and move nodes to focus.
}

/**
 * **LDRS Command:** Creates a subgraph.
 * @function LDR.create_subgraph
 * @param {string} params.parentNodeId - ID of the parent node for the subgraph.
 * @param {string} params.subGraphId - ID for the new subgraph.
 * @param {string} [params.message] - Description of the step (optional).
 * @example
 * {
 *   "create_subgraph": {
 *     "parentNodeId": "P",
 *     "subGraphId": "subgraph1",
 *     "message": "Creating subgraph under node P"
 *   }
 * }
 */
function renderCreateSubGraph(params) {
    const { parentNodeId, subGraphId } = params;
    console.log("renderCreateSubGraph", parentNodeId, subGraphId);
    // Implement your diagram rendering logic here to create a subgraph.
}

/**
 * **LDRS Command:** Merges a subgraph.
 * @function LDR.merge_subgraph
 * @param {string} params.parentNodeId - ID of the parent node where subgraph is located.
 * @param {string} params.subGraphId - ID of the subgraph to merge.
 * @param {string} [params.mergeStrategy] - Strategy for merging (optional).
 * @param {string} [params.message] - Description of the step (optional).
 * @example
 * {
 *   "merge_subgraph": {
 *     "parentNodeId": "Q",
 *     "subGraphId": "subgraph1",
 *     "mergeStrategy": "replace",
 *     "message": "Merging subgraph into node Q"
 *   }
 * }
 */
function renderMergeSubGraph(params) { //TODO: For advanced vis
    const { parentNodeId, subGraphId, mergeStrategy } = params;
    console.log("renderMergeSubGraph", parentNodeId, subGraphId, mergeStrategy);
    // Implement your diagram rendering logic here to merge a subgraph.
}

/**
 * **LDRS Command:** Displays a message only.
 * @function LDR.message_only
 * @param {string} params.message - The message to display.
 * @example
 * {
 *   "message_only": {
 *     "message": "Just displaying a message"
 *   }
 * }
 */
function renderMessageOnly(params) {
    const { message } = params;
    console.log("Message Step:", message);
    // Implement any logic for displaying a message, or just log it.
}


/**
 * **LDRS Command:** Removes a node from the diagram.
 * @function LDR.remove_node
 * @param {string} params.nodeId - ID of the node to remove.
 * @param {string} [params.message] - Description of the step (optional).
 * @example
 * {
 *   "remove_node": {
 *     "nodeId": "C",
 *     "message": "Removing node C"
 *   }
 * }
 */
function renderRemoveNode(params) {
    const { nodeId } = params;
    console.log("renderRemoveNode", nodeId);
    // Implement your diagram rendering logic here to remove a node.
}

/**
 * **LDRS Command:** Resets the diagram display.
 * @function LDR.reset
 * @param {string} [params.message] - Description of the step (optional).
 * @example
 * {
 *   "reset": {
 *     "message": "Clearing the diagram"
 *   }
 * }
 */
function resetDisplay(params = {}) {
    console.log("resetDisplay");
    // Implement your diagram rendering logic here to reset the display.
}

/**
 * **LDRS Command:** Selects a path in the diagram.
 * @function LDR.select_path
 * @param {string[]} params.nodeIds - Array of node IDs representing the path.
 * @param {string} [params.message] - Description of the step (optional).
 * @example
 * {
 *   "select_path": {
 *     "nodeIds": ["A", "B", "D"],
 *     "message": "Selecting path A-B-D"
 *   }
 * }
 */
function renderSelectPath(params) {
    const { nodeIds } = params;
    console.log("renderSelectPath", nodeIds);
    // Implement your diagram rendering logic here to select a path.
}

/**
 * **LDRS Command:** Straightens a path in the diagram.
 * @function LDR.straighten_path
 * @param {string[]} params.nodeIds - Array of node IDs representing the path to straighten.
 * @param {string} [params.message] - Description of the step (optional).
 * @example
 * {
 *   "straighten_path": {
 *     "nodeIds": ["G", "H", "I"],
 *     "message": "Straightening path G-H-I"
 *   }
 * }
 */
function renderStraightenPath(params) {
    const { nodeIds } = params;
    console.log("renderStraightenPath", nodeIds);
    // Implement your diagram rendering logic here to straighten a path.
}

// Example LDR Scripst in JSON format.

export const simpleLdr = {
    "1": { "reset": { "message": "Resetting the diagram" } },
    "2": { "add_node": { "nodeId": "A", "data": { "label": "Node A", "x": 100, "y": 100 }, "kind": "circle", "message": "Adding node A" } },
    "3": { "add_node": { "nodeId": "B", "data": { "label": "Node B", "x": 300, "y": 100 }, "kind": "square", "message": "Adding node B" } },
    "4": { "connect_nodes": { "node1": "A", "node2": "B", "weight": 1, "edgeType": "solid", "message": "Connecting node A and B" } },
    "5": { "select_path": { "nodeIds": ["A", "B"], "message": "Selecting path A to B" } }
};

export const ringDemoLrd = {
    "1": { 'reset': { "message": "Clear graph and prepare for visualization." } },
    "2": { 'add_circular_rings': { "ringSizes": [6, 12, 18], "message": "Adding circular rings of nodes" } },
    "3": { "add_node": { "nodeId": "start", "kind": "start", "data": { "title": "Start Project", "x": 400, "y": 100 }, "message": "Add start node for the design project." } },
    "4": { "add_node": { "nodeId": "end", "kind": "end", "data": { "title": "End Project", "x": 400, "y": 500 }, "message": "Add end node for the design project." } },
    "5": { "add_node": { "nodeId": "task_identify_font", "kind": "task", "data": { "title": "Identify Font from Image", "description": "Identify a font in a screenshot.", "potential_solutions": { "manual_human": {}, "agent_font_recognition": {} }, "x": 400, "y": 300 }, "message": "Add task: Identify Font from Image." } },
    "6": { "connect_nodes": { "node1": "start", "node2": "task_identify_font", "message": "Connect start node to the font identification task." } },
    "7": { "add_node": { "nodeId": "task_identify_font_manual", "kind": "solution", "data": { "name": "Manual Font Identification", "description": "Compare image to font libraries.", "pain_level": 3, "complexity": 1, "time_estimate": 2, "human_in_loop_feedback_initial": 1, "human_in_loop_feedback_refined": 1, "x": 250, "y": 380 }, "message": "Add manual solution node." } },
    "8": { "connect_nodes": { "node1": "task_identify_font", "node2": "task_identify_font_manual", "message": "Connect task to manual solution." } },
    "9": { "add_node": { "nodeId": "task_identify_font_agent", "kind": "solution", "data": { "name": "AI Font Recognition Agent", "description": "Use image recognition to identify fonts.", "pain_level": 1, "complexity": 1, "time_estimate": 1, "human_in_loop_feedback_initial": 4, "human_in_loop_feedback_refined": 2, "x": 550, "y": 380 }, "message": "Add AI agent solution node." } },
    "10": { "connect_nodes": { "node1": "task_identify_font", "node2": "task_identify_font_agent", "message": "Connect task to AI agent solution." } },
    "11": { "select_path": { "nodeIds": ["task_identify_font", "task_identify_font_manual", "task_identify_font_agent"], "message": "Highlighting task and solution options." } },
    "12": { "copy_move_to_focus": { "message": "Copying selected path to focus area." } }, // nodeIds: null removed - using selectedPath
    "13": { "straighten_path": { "message": "Arranging nodes linearly in focus area." } }, // nodeIds: null removed - using focusArea
}

export const designCujLdr = {
    "1": { "reset": { "message": "Initialize graph and prepare for visualization." } },
    "2": { "add_node": { "nodeId": "start", "kind": "start", "data": { "title": "Start Project", "x": 100, "y": 100 }, "message": "Add start node for the design project." } },
    "3": { "add_node": { "nodeId": "end", "kind": "end", "data": { "title": "End Project", "x": 700, "y": 500 }, "message": "Add end node for the design project." } },
    "4": { "add_node": { "nodeId": "task_identify_font", "kind": "task", "data": { "title": "Identify Font from Image", "description": "Identify a font in a screenshot.", "potential_solutions": { "manual_human": {}, "agent_font_recognition": {} }, "x": 250, "y": 200 }, "message": "Add task: Identify Font from Image." } },
    "5": { "connect_nodes": { "node1": "start", "node2": "task_identify_font", "message": "Connect start node to the font identification task." } },
    "6": { "add_node": { "nodeId": "task_identify_font_manual", "kind": "solution", "data": { "name": "Manual Font Identification", "description": "Compare image to font libraries.", "pain_level": 3, "complexity": 1, "time_estimate": 2, "human_in_loop_feedback_initial": 1, "human_in_loop_feedback_refined": 1, "x": 200, "y": 300 }, "message": "Add manual solution node." } },
    "7": { "connect_nodes": { "node1": "task_identify_font", "node2": "task_identify_font_manual", "message": "Connect task to manual solution." } },
    "8": { "add_node": { "nodeId": "task_identify_font_agent", "kind": "solution", "data": { "name": "AI Font Recognition Agent", "description": "Use image recognition to identify fonts.", "pain_level": 1, "complexity": 1, "time_estimate": 1, "human_in_loop_feedback_initial": 4, "human_in_loop_feedback_refined": 2, "x": 300, "y": 300 }, "message": "Add AI agent solution node." } },
    "9": { "connect_nodes": { "node1": "task_identify_font", "node2": "task_identify_font_agent", "message": "Connect task to AI agent solution." } },
    "10": { "select_path": { "nodeIds": ["task_identify_font", "task_identify_font_manual", "task_identify_font_agent"], "message": "Highlighting task and solution options." } },
    "11": { "copy_move_to_focus": { "message": "Copying selected path to focus area." } }, // nodeIds: null removed - using selectedPath
    "12": { "straighten_path": { "message": "Arranging nodes linearly in focus area." } }, // nodeIds: null removed - using focusArea
    "13": { "message_only": { "message": "Adding a second Task" } },
    "14": { "add_node": { "nodeId": "task_svg_convert", "kind": "task", "data": { "title": "Convert SVG to Optimized Raster", "description": "Export SVGs in raster formats.", "potential_solutions": { "manual_human": {}, "script_batch_conversion": {}, "agent_intelligent_optimization": {} }, "x": 500, "y": 200 }, "message": "Add task, convert SVG" } },
    "15": { "connect_nodes": { "node1": "task_identify_font", "node2": "task_svg_convert", "message": "Connect the first task to the second task" } },
    "16": { "add_node": { "nodeId": "task_svg_convert_manual", "kind": "solution", "data": { "name": "Manual SVG Export & Optimization", "description": "Designer manually exports SVGs from design software and uses separate image optimization tools.", "pain_level": 2, "complexity": 1, "time_estimate": 2, "human_in_loop_feedback_initial": 1, "human_in_loop_feedback_refined": 1, "x": 450, "y": 300 }, "message": "Adding the manual svg solution" } },
    "17": { "connect_nodes": { "node1": "task_svg_convert", "node2": "task_svg_convert_manual", "message": "Connect task to manual solution." } },
    "18": { "add_node": { "nodeId": "task_svg_convert_script", "kind": "solution", "data": { "name": "Scripted Batch Conversion", "description": "Script automates SVG to raster conversion and basic optimization for multiple files.", "pain_level": 1, "complexity": 2, "time_estimate": 2, "human_in_loop_feedback_initial": 3, "human_in_loop_feedback_refined": 2, "x": 550, "y": 300 }, "message": "Adding the script solution" } },
    "19": { "connect_nodes": { "node1": "task_svg_convert", "node2": "task_svg_convert_script", "message": "Connect task to script solution." } },
    "20": { "add_node": { "nodeId": "task_svg_convert_agent", "kind": "solution", "data": { "name": "AI-Powered Optimization Agent", "description": "Agent intelligently optimizes raster output based on context and platform requirements.", "pain_level": 1, "complexity": 2, "time_estimate": 1, "human_in_loop_feedback_initial": 4, "human_in_loop_feedback_refined": 2, "x": 650, "y": 300 }, "message": "Adding the agent solution" } },
    "21": { "connect_nodes": { "node1": "task_svg_convert", "node2": "task_svg_convert_agent", "message": "Connect task to agent solution." } },
    "22": { "connect_nodes": { "node1": "task_svg_convert", "node2": "end", "message": "Connect the svg convert task to end node" } },
    "23": { "select_path": { "nodeIds": ["start", "task_identify_font", "task_svg_convert", "end"], "message": "Selecting the entire path." } },
    "24": { "copy_move_to_focus": { "message": "Copy the main path to the focus area." } }, // nodeIds: null removed - using selectedPath
    "25": { "message_only": { "message": "Demonstrate the scales, by removing the current nodes first" } },
    "26": { "remove_node": { "nodeId": "start", "message": "removing start node" } },
    "27": { "remove_node": { "nodeId": "end", "message": "removing end node" } },
    "28": { "remove_node": { "nodeId": "task_identify_font", "message": "removing find font node" } },
    "29": { "remove_node": { "nodeId": "task_identify_font_manual", "message": "removing font manual solution node" } },
    "30": { "remove_node": { "nodeId": "task_identify_font_agent", "message": "removing font ai solution node" } },
    "31": { "remove_node": { "nodeId": "task_svg_convert", "message": "remove convert node" } },
    "32": { "remove_node": { "nodeId": "task_svg_convert_manual", "message": "remove convert manual solution" } },
    "33": { "remove_node": { "nodeId": "task_svg_convert_script", "message": "remove convert script solution" } },
    "34": { "remove_node": { "nodeId": "task_svg_convert_agent", "message": "remove convert agent solution" } },
    "35": { "message_only": { "message": "Recreate scales as per the JSON." } },
    "36": { "add_circular_rings": { "ringSizes": [6, 12, 18], "message": "Creating circular rings to represent scales" } },
    "37": { "select_path": { "nodeIds": ["node-0", "node-1", "node-2", "node-3", "node-4", "node-5"], "message": "Selecting time estimate nodes" } },
    "38": { "copy_move_to_focus": { "message": "Moving time estimate to focus area" } }, // nodeIds: null removed - using selectedPath
    "39": { "straighten_path": { "message": "Straightening for better view of Time Estimates" } }, // nodeIds: null removed - using focusArea
    "40": { "message_only": { "message": "Compressing..." } },
    "41": { "compress_path": { "message": "Compressing scale titles path" } }, // Params removed - using focusArea
    "42": { "add_compressed_path_to_graph": { "message": "Add compressed path", "startNodeId": "node-0", "endNodeId": "node-5" } } // Added startNodeId and endNodeId
};

export const genCompLdr = {
    "1": { "reset": { "message": "Initialize graph for dynamic UI component generation." } },
    "2": { "add_node": { "nodeId": "start", "kind": "start", "data": { "title": "Start Component Generation", "x": 100, "y": 100 }, "message": "Add start node." } },
    "3": { "add_node": { "nodeId": "end", "kind": "end", "data": { "title": "End Component Generation", "x": 700, "y": 500 }, "message": "Add end node." } },
    "4": { "add_node": { "nodeId": "define_brand", "kind": "task", "data": { "title": "Define Brand Guidelines", "description": "Establish color palette, typography, and overall style.", "potential_solutions": { "manual_human": { "name": "Manual Definition" }, "llm_brand_suggestion": { "name": "LLM Brand Suggestion" } }, "x": 250, "y": 200 }, "message": "Add task: Define Brand Guidelines." } },
    "5": { "connect_nodes": { "node1": "start", "node2": "define_brand", "message": "Connect start node to branding task." } },
    "6": { "add_node": { "nodeId": "define_brand_manual", "kind": "solution", "data": { "name": "Manual Definition", "x": 200, "y": 300 }, "message": "Add manual solution for branding." } },
    "7": { "connect_nodes": { "node1": "define_brand", "node2": "define_brand_manual", "message": "Connect branding task to manual solution." } },
    "8": { "add_node": { "nodeId": "define_brand_llm", "kind": "solution", "data": { "name": "LLM Brand Suggestion", "x": 300, "y": 300 }, "message": "Add LLM solution for branding." } },
    "9": { "connect_nodes": { "node1": "define_brand", "node2": "define_brand_llm", "message": "Connect branding task to LLM solution." } },
    "10": { "message_only": { "message": "Triggering a delibration to choose best branding." } },
    "11": { "add_node": { "nodeId": "create_button", "kind": "task", "data": { "title": "Create Button Component", "description": "Generate a reusable button component.", "potential_solutions": { "manual_human": { "name": "Manual Coding (React/Flutter)" }, "llm_code_generation": { "name": "LLM Code Generation" }, "llm_code_generation_flutter": { "name": "LLM Code Generation - Flutter" } }, "x": 250, "y": 400 }, "message": "Add task: Create Button Component." } },
    "12": { "connect_nodes": { "node1": "define_brand", "node2": "create_button", "message": "Connect branding task to button creation." } },
    "13": { "add_node": { "nodeId": "create_button_manual", "kind": "solution", "data": { "name": "Manual Coding (React/Flutter)", "x": 200, "y": 500 }, "message": "Adding manual coding solution" } },
    "14": { "connect_nodes": { "node1": "create_button", "node2": "create_button_manual", "message": "connect button task to manual solution" } },
    "15": { "add_node": { "nodeId": "create_button_llm", "kind": "solution", "data": { "name": "LLM Code Generation", "x": 300, "y": 500 }, "message": "Adding LLM solution" } },
    "16": { "connect_nodes": { "node1": "create_button", "node2": "create_button_llm", "message": "connect button task to llm solution" } },
    "17": { "add_node": { "nodeId": "create_button_llm_flutter", "kind": "solution", "data": { "name": "LLM Code Generation - Flutter", "x": 300, "y": 600 }, "message": "Adding LLM Flutter solution" } },
    "18": { "connect_nodes": { "node1": "create_button", "node2": "create_button_llm_flutter", "message": "connect button task to llm flutter solution" } },
    "19": { "message_only": { "message": "Trigger a sub-graph to explore button variations." } },
    "20": { "create_subgraph": { "parentNodeId": "create_button", "subGraphId": "Explore Button Variations", "message": "Creating a sub-graph for exploring button variations" } },
    "21": { "add_node": { "nodeId": "create_slider", "kind": "task", "data": { "title": "Create Slider Component", "description": "Generate a reusable slider component.", "potential_solutions": { "manual_human": { "name": "Manual Coding (React/Flutter)" }, "llm_code_generation": { "name": "LLM Code Generation" }, "llm_code_generation_flutter": { "name": "LLM Code Generation - Flutter" } }, "x": 500, "y": 400 }, "message": "Add task: Create Slider Component." } },
    "22": { "connect_nodes": { "node1": "create_button", "node2": "create_slider", "message": "connect button to slider task" } },
    "23": { "add_node": { "nodeId": "create_slider_manual", "kind": "solution", "data": { "name": "Manual Coding (React/Flutter)", "x": 450, "y": 500 }, "message": "Adding manual coding solution" } },
    "24": { "connect_nodes": { "node1": "create_slider", "node2": "create_slider_manual", "message": "connect slider task to manual solution" } },
    "25": { "add_node": { "nodeId": "create_slider_llm", "kind": "solution", "data": { "name": "LLM Code Generation", "x": 550, "y": 500 }, "message": "Adding LLM solution" } },
    "26": { "connect_nodes": { "node1": "create_slider", "node2": "create_slider_llm", "message": "connect slider task to LLM solution" } },
    "27": { "add_node": { "nodeId": "create_slider_llm_flutter", "kind": "solution", "data": { "name": "LLM Code Generation - Flutter", "x": 550, "y": 600 }, "message": "Adding LLM flutter solution" } },
    "28": { "connect_nodes": { "node1": "create_slider", "node2": "create_slider_llm_flutter", "message": "connect slider task to LLM flutter solution" } },
    "29": { "add_node": { "nodeId": "create_input", "kind": "task", "data": { "title": "Create Input Field Component", "description": "Generate a reusable input field component.", "potential_solutions": { "manual_human": { "name": "Manual Coding" }, "llm_code_generation": { "name": "LLM Code Generation" } }, "x": 500, "y": 200 }, "message": "Add task: Create Input Field Component." } },
    "30": { "connect_nodes": { "node1": "create_slider", "node2": "create_input", "message": "Connect create slider to input" } },
    "31": { "connect_nodes": { "node1": "create_input", "node2": "end", "message": "Connecting the input to the end." } },
    "32": { "add_node": { "nodeId": "create_input_manual", "kind": "solution", "data": { "name": "Manual Coding (React/Flutter)", "x": 450, "y": 300 }, "message": "Adding manual coding solution" } },
    "33": { "connect_nodes": { "node1": "create_input", "node2": "create_input_manual", "message": "Connect input task to manual solution" } },
    "34": { "add_node": { "nodeId": "create_input_llm", "kind": "solution", "data": { "name": "LLM Code Generation", "x": 550, "y": 300 }, "message": "Adding LLM solution" } },
    "35": { "connect_nodes": { "node1": "create_input", "node2": "create_input_llm", "message": "Connect input task to LLM solution" } },
    "36": { "add_node": { "nodeId": "create_input_llm_flutter", "kind": "solution", "data": { "name": "LLM Code Generation - Flutter", "x": 550, "y": 200 }, "message": "Adding LLM flutter solution" } },
    "37": { "connect_nodes": { "node1": "create_input", "node2": "create_input_llm_flutter", "message": "connect input task to LLM flutter solution" } },
    "38": { "select_path": { "nodeIds": ["start", "define_brand", "create_button", "create_slider", "create_input", "end"], "message": "Selecting the main path." } },
    "39": { "copy_move_to_focus": { "message": "Copying the main path to the focus area." } }, // nodeIds: null removed - using selectedPath
    "40": { "straighten_path": { "message": "Straighten the path" } }, // nodeIds: null removed - using focusArea
    "41": { "message_only": { "message": "Demonstrate adding more nodes to graph, will be removed." } },
    "42": { "add_node": { "message": "Add a temporary node", "nodeId": "temp_node_1", "data": { "x": 150, "y": 600 } } }, // Added nodeId and position
    "43": { "add_node": { "message": "and another node", "nodeId": "temp_node_2", "data": { "x": 200, "y": 650 } } }, // Added nodeId and position
    "44": { "remove_node": { "nodeId": "temp_node_1", "message": "Remove the nodes." } }, // Corrected nodeIds
    "45": { "remove_node": { "nodeId": "temp_node_2", "message": "removing other extra node" } }, // Corrected nodeIds
    "46": { "message_only": { "message": "Now back to the graph at hand." } },
    "47": { "compress_path": { "message": "Compressing path in focus area." } }, // Params removed - using focusArea
    "48": { "add_compressed_path_to_graph": { "message": "Adding compressed path back to the main graph.", "startNodeId": "start", "endNodeId": "end" } }, // Added startNodeId and endNodeId
    "49": { "message_only": { "message": "Script complete. Components generated (conceptually)." } }
}

const scripts = { simpleLdr, ringDemoLrd, designCujLdr, genCompLdr };

export { exampleLdrProcessor, scripts }