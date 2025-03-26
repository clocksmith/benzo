/**
 * @file combined.js
 * Combines ldr.js, alf.js, and gru.js into a single file with JSDoc separators.
 * Includes LDR language definitions, ALF graph logic, and GRU UI interactions.
 */

/**
 * --- LDR.JS SECTION ---
 * @section LDR
 * Defines the LDR(S) (Lucid Diagram RenderScript) language and its commands.
 */

/**
 * @const {string[]} commandNames - Lexiographically ordered array of LDR command names.
 */
const commandNames = [
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
/**
 * @const {Set<string>} commands - Set of LDR command names for efficient lookup.
 */
const commands = new Set(commandNames);


/**
 * Example processor for an LDR script defined as a JSON object.
 *
 * @function exampleLdrProcessor
 * @param {object} ldrsScript - JSON object representing the LDRS script.
 *   Keys are step numbers, values are step definitions.
 *   Each step definition is an object where:
 *     - key string - The command to execute (see list of commands below).
 *     - value: params object - Parameters for the command (command-specific, see below).
 *       - message: string - Description of the step (optional, included in params).
 *
 * **LDRS Commands:**
 *
 * {@link renderAddCircularRings} - Adds circular rings of nodes to the diagram.
 * {@link renderAddCompressedPath} - Adds a compressed path to the graph.
 * {@link renderAddNode} - Adds a node to the diagram.
 * {@link renderAddTriangularGrid} - Adds a triangular grid of nodes to the diagram.
 * {@link renderCompressPath} - Compresses a path in the diagram.
 * {@link renderConnectNodes} - Connects two nodes in the diagram.
 * {@link renderCopyMoveToFocus} - Copies and moves nodes to focus.
 * {@link renderCreateSubGraph} - Creates a subgraph.
 * {@link renderMergeSubGraph} - Merges a subgraph.
 * {@link renderMessageOnly} - Displays a message without performing any diagram operation.
 * {@link renderRemoveNode} - Removes a node from the diagram.
 * {@link resetDisplay} - Resets the diagram display.
 * {@link renderSelectPath} - Selects a path in the diagram.
 * {@link renderStraightenPath} - Straightens a path in the diagram.
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
        if (Object.hasOwnProperty.call(ldrsScript, stepNumber)) {
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
 * @const {object} simpleLdr - Example LDR script for a simple diagram.
 */
const simpleLdr = {
    "1": { "reset": { "message": "Resetting the diagram" } },
    "2": { "add_node": { "nodeId": "A", "data": { "label": "Node A", "x": 100, "y": 100 }, "kind": "circle", "message": "Adding node A" } },
    "3": { "add_node": { "nodeId": "B", "data": { "label": "Node B", "x": 300, "y": 100 }, "kind": "square", "message": "Adding node B" } },
    "4": { "connect_nodes": { "node1": "A", "node2": "B", "weight": 1, "edgeType": "solid", "message": "Connecting node A and B" } },
    "5": { "select_path": { "nodeIds": ["A", "B"], "message": "Selecting path A to B" } }
};

/**
 * @const {object} ringDemoLrd - Example LDR script demonstrating circular rings.
 */
const ringDemoLrd = {
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

/**
 * @const {object} designCujLdr - Example LDR script for a design customer journey.
 */
const designCujLdr = {
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

/**
 * @const {object} genCompLdr - Example LDR script for dynamic UI component generation.
 */
const genCompLdr = {
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

/**
 * @const {object} scripts - Collection of LDR scripts.
 */
const scripts = { simpleLdr, ringDemoLrd, designCujLdr, genCompLdr };


/**
 * --- ALF.JS SECTION ---
 * @section ALF
 * ALF (Algorithmic Logic File) which is used to create a unique graph algorithim
 * that combines deliberation, dynamic programming, shortest paths, human in the loop,
 * and more.
 */

/**
 * @constant {object} WEIGHTS - Weights for calculating node cost.
 */
const WEIGHTS = {
    TIME: 0.4,
    PAIN: 0.3,
    COMPLEXITY: 0.2,
    HUMAN_IN_LOOP: 0.1,
    SUCCESS_PROBABILITY: 0.5,
};

/**
 * Calculates the weight of a task based on predefined weights and task data.
 *
 * @function calculateWeight
 * @param {object} taskData - Data for the task, including time_estimate, pain_level, complexity, human_in_loop_feedback_refined, and success_probability.
 * @returns {number} - Calculated weight of the task.
 */
function calculateWeight(taskData) {
    const time = taskData.time_estimate || 4;
    const pain = taskData.pain_level || 4;
    const complexity = taskData.complexity || 4;
    const humanLoop = taskData.human_in_loop_feedback_refined || 1;
    const successProb = taskData.success_probability ?? 0.9;

    return (
        WEIGHTS.TIME * time +
        WEIGHTS.PAIN * pain +
        WEIGHTS.COMPLEXITY * complexity +
        WEIGHTS.HUMAN_IN_LOOP * humanLoop +
        WEIGHTS.SUCCESS_PROBABILITY * (1 - successProb)
    );
}

/**
 * Class representing the Graph data structure and its algorithms.
 * @class Graph
 */
class Graph {
    /**
     * Constructor for the Graph class.
     *
     * @constructor
     * @param {function} [renderCallback] - Callback function for rendering graph changes. Defaults to exampleLdrProcessor.
     */
    constructor(renderCallback) {
        /** @type {object} - Nodes in the graph, keyed by nodeId. */
        this.nodes = {};
        /** @type {object} - Memoization cache for A* algorithm. */
        this.memo = {};
        /** @type {number} - Counter for steps, used in default render callback. */
        this.stepCounter = 1;
        /** @type {function} - Callback function to render graph changes. */
        this.renderCallback = renderCallback || this.defaultRenderCallback;
        /** @type {string[]} - Array of nodeIds representing the currently selected path. */
        this.selectedPath = [];
        /** @type {string[]} - Array of nodeIds representing the focus area. */
        this.focusArea = [];
    }

    /**
     * Default render callback that uses exampleLdrProcessor to process LDR scripts.
     * @function defaultRenderCallback
     * @param {object} stepDefinition - Definition of the LDR step to render.
     */
    defaultRenderCallback = (stepDefinition) => {
        const ldrsScript = { [this.stepCounter++]: stepDefinition };
        exampleLdrProcessor(ldrsScript);
    }

    /**
     * Resets the graph to its initial empty state.
     * @function resetGraph
     */
    resetGraph() {
        this.nodes = {};
        this.memo = {};
        this.selectedPath = [];
        this.focusArea = [];
        this.stepCounter = 1;
        this.renderCallback({ "reset": {} });
    }

    /**
     * Adds a node to the graph.
     * @function addNode
     * @param {string} nodeId - Unique ID for the node.
     * @param {object} data - Data associated with the node.
     * @param {string} [kind="task"] - Kind of node (e.g., "task", "solution", "start", "end").
     */
    addNode(nodeId, data, kind = "task") {
        this.nodes[nodeId] = { data, edges: {}, kind };
        this.renderCallback({ "add_node": { nodeId, data, kind } });
    }

    /**
     * Adds a directed edge between two nodes in the graph.
     * @function addEdge
     * @param {string} fromNodeId - ID of the source node.
     * @param {string} toNodeId - ID of the target node.
     * @param {number} [weight=null] - Weight of the edge. If null, calculated based on target node data.
     * @param {string} [edgeType="sequence"] - Type of edge (e.g., "sequence", "solution_selection").
     */
    addEdge(fromNodeId, toNodeId, weight = null, edgeType = "sequence") {
        if (!this.nodes[fromNodeId] || !this.nodes[toNodeId]) return;

        if (weight === null) {
            weight = calculateWeight(this.nodes[toNodeId].data);
        }
        this.nodes[fromNodeId].edges[toNodeId] = { weight, edgeType };
        this.renderCallback({ "connect_nodes": { node1: fromNodeId, node2: toNodeId, weight, edgeType } });
    }

    /**
     * Removes the last added node from the graph.
     * @function removeNode
     */
    removeNode() {
        const lastNodeId = Object.keys(this.nodes).pop();
        if (lastNodeId) {
            delete this.nodes[lastNodeId];
            this.renderCallback({ "remove_node": { nodeId: lastNodeId } });
            this.selectedPath = this.selectedPath.filter(id => id !== lastNodeId);
            this.focusArea = this.focusArea.filter(id => id !== lastNodeId);
        }
    }

    /**
     * Selects a path of nodes, used for visual highlighting or focus operations.
     * @function selectPath
     * @param {string[]} nodeIds - Array of node IDs to select.
     */
    selectPath(nodeIds) {
        this.selectedPath = nodeIds.filter(id => this.nodes[id]);
        // this.renderCallback({ "select_path": { nodeIds: this.selectedPath } }); // <-- REMOVED: Prevent recursive render call
    }

    /**
     * Copies the selected path nodes to the focus area for detailed examination.
     * @function copyMoveToFocus
     */
    copyMoveToFocus() {
        if (this.selectedPath.length === 0) return;
        this.focusArea = [];

        this.selectedPath.forEach(nodeId => {
            const originalNode = this.getNode(nodeId);
            const focusNodeId = `focus_${nodeId}`;
            this.focusArea.push(focusNodeId);
            const focusNodeData = JSON.parse(JSON.stringify(originalNode.data));
            this.renderCallback({ "add_node": { nodeId: focusNodeId, data: focusNodeData, kind: originalNode.kind } });
        });

        this.renderCallback({ "copy_move_to_focus": { nodeIds: this.focusArea } });
    }

    /**
     * Straightens the nodes in the focus area for linear visualization.
     * @function straightenPath
     */
    straightenPath() {
        if (this.focusArea.length === 0) return;
        this.renderCallback({ "straighten_path": { nodeIds: this.focusArea } });
    }

    /**
     * Compresses a path in the focus area, visually removing intermediate nodes.
     * @function compressPath
     */
    compressPath() {
        if (this.focusArea.length < 2) return;
        const startNodeId = this.focusArea[0];
        const endNodeId = this.focusArea[this.focusArea.length - 1];
        this.renderCallback({ "compress_path": { startNodeId, endNodeId, intermediateNodes: this.focusArea.slice(1, -1) } });
    }

    /**
     * Adds a compressed path representation back to the main graph.
     * @async
     * @function addCompressedPathToGraph
     */
    async addCompressedPathToGraph() {
        if (this.focusArea.length < 2) return;

        const startNodeId = this.focusArea[0].replace(/^focus_/, '');
        const endNodeId = this.focusArea[this.focusArea.length - 1].replace(/^focus_/, '');
        const startNode = this.getNode(startNodeId);
        const endNode = this.getNode(endNodeId);

        if (!startNode || !endNode) {
            console.warn("Start/end node not found.");
            return;
        }

        const compressedTaskName = `Compressed_${startNode.data.title}_to_${endNode.data.title}`;
        const compressedTaskData = await this.createTaskDataFromLLMSuggestion(compressedTaskName);
        if (!compressedTaskData) return;

        const compressedNodeId = this.addTask(compressedTaskData);
        const originalPath = this.aStar(startNodeId, endNodeId);
        const compressedWeight = originalPath.cost;

        this.addEdge(startNodeId, compressedNodeId, compressedWeight, "compressed");
        this.addEdge(compressedNodeId, endNodeId, 0, "compressed");

        this.renderCallback({ "add_compressed_path_to_graph": { startNodeId, endNodeId, compressedNodeId, compressedWeight } });
    }

    /**
     * Adds circular rings of nodes to the graph.
     * @function addCircularRings
     * @param {number[]} ringSizes - Array of sizes for each ring.
     */
    addCircularRings(ringSizes) {
        this.renderCallback({ "add_circular_rings": { ringSizes } })
    }

    /**
     * Adds a triangular grid of nodes to the graph.
     * @function addTriangularGrid
     * @param {number} numRings - Number of rings in the grid.
     */
    addTriangularGrid(numRings) {
        this.renderCallback({ "add_triangular_grid": { numRings } })
    }

    /**
     * Creates a subgraph, visually nested under a parent node.
     * @function createSubGraph
     * @param {string} parentNodeId - ID of the parent node.
     * @param {string} goal - Goal or description of the subgraph.
     * @returns {Graph|null} - The newly created subgraph instance or null if parent node not found.
     */
    createSubGraph(parentNodeId, goal) {
        const parentNode = this.getNode(parentNodeId);
        if (!parentNode) {
            console.warn(`Parent node not found: ${parentNodeId}`);
            return null;
        }

        const subGraph = new Graph(this.renderCallback)
        subGraph.addNode("sub_start", { title: `Sub-Graph Start (${goal})` }, "start");
        subGraph.addNode("sub_end", { title: "Sub-Graph End" }, "end");

        // TODO(clocksmith): Pass / copy all context, continuously, as needed.
        if (parentNode.data.designContext) {
            subGraph.designContext = { ...parentNode.data.designContext };
        }

        subGraph.goal = goal;
        subGraph.parentNodeId = parentNodeId;

        this.renderCallback({ "create_subgraph": { parentNodeId, subGraphId: subGraph.goal } });
        return subGraph;
    }

    /**
     * Merges a subgraph back into the main graph.
     * @function mergeSubGraph
     * @param {Graph} subGraph - The subgraph instance to merge.
     * @param {string} [mergeStrategy="add_nodes"] - Strategy for merging ("add_nodes", "update_parent", "compress").
     */
    mergeSubGraph(subGraph, mergeStrategy = "add_nodes") {
        if (!subGraph.parentNodeId) {
            console.warn("Sub-graph has no parent node. Cannot merge.");
            return;
        }

        const parentNode = this.getNode(subGraph.parentNodeId);
        if (!parentNode) {
            console.warn(`Parent node not found: ${subGraph.parentNodeId}`);
            return;
        }

        switch (mergeStrategy) {
            case "add_nodes":
                // Add nodes/edges from sub-graph to main graph.
                for (const nodeId in subGraph.nodes) {
                    if (nodeId == "sub_start" || nodeId == "sub_end") continue;

                    const newNodeId = `${subGraph.parentNodeId}_${nodeId}`;
                    this.addNode(newNodeId, subGraph.nodes[nodeId].data, subGraph.nodes[nodeId].kind);

                    // Connect the new node to parent.
                    if (nodeId != "sub_start") this.addEdge(subGraph.parentNodeId, newNodeId)
                }
                for (const fromNodeId in subGraph.nodes) {
                    for (const toNodeId in subGraph.nodes[fromNodeId].edges) {
                        // Don't add edges that are from or to the start and end nodes.
                        if (fromNodeId == "sub_start" || toNodeId == "sub_end" || fromNodeId == "sub_end" || toNodeId == "sub_start") continue;
                        const newFromNodeId = `${subGraph.parentNodeId}_${fromNodeId}`;
                        const newToNodeId = `${subGraph.parentNodeId}_${toNodeId}`;
                        this.addEdge(newFromNodeId, newToNodeId, subGraph.nodes[fromNodeId].edges[toNodeId].weight, subGraph.nodes[fromNodeId].edges[toNodeId].edgeType);
                    }
                }
                break;
            case "update_parent":
                // TODO(clocksmith): implemnet this.
                console.warn("update_parent merge strategy not implemented yet.");
                break;
            case "compress":
                // TODO(clocksmith): implemnet this.
                console.warn("compress merge strategy not implemented yet.");
                break;

            default:
                console.warn(`Unknown merge strategy: ${mergeStrategy}`);
        }

        this.renderCallback({ "merge_subgraph": { parentNodeId: subGraph.parentNodeId, subGraphId: subGraph.goal, mergeStrategy } });
    }

    /**
     * Gets a node from the graph by its ID.
     * @function getNode
     * @param {string} nodeId - ID of the node to retrieve.
     * @returns {object|undefined} - The node object or undefined if not found.
     */
    getNode(nodeId) {
        return this.nodes[nodeId];
    }

    /**
     * Heuristic function for A* algorithm, estimates distance to end node.
     * @function heuristic
     * @param {string} currentNodeId - ID of the current node.
     * @param {string} endNodeId - ID of the end node.
     * @returns {number} - Estimated heuristic value.
     */
    heuristic(currentNodeId, endNodeId) {
        // TODO:(clocksmith): Simplify, basic distance estimate.
        const currentNodeNumber = parseInt(currentNodeId.match(/\d+/)[0], 10)
        const endNodeNumber = parseInt(endNodeId.match(/\d+/)[0], 10)
        return Math.abs(endNodeNumber - currentNodeNumber);
    }

    /**
     * A* pathfinding algorithm to find the optimal path between two nodes.
     * @function aStar
     * @param {string} startNodeId - ID of the starting node.
     * @param {string} endNodeId - ID of the ending node.
     * @returns {object} - Object containing the path (array of node IDs) and cost.
     */
    aStar(startNodeId, endNodeId) {
        if (this.memo[startNodeId]) return this.memo[startNodeId];

        const openSet = new Set([startNodeId]);
        const cameFrom = {};
        const gScore = { [startNodeId]: 0 };
        const fScore = { [startNodeId]: this.heuristic(startNodeId, endNodeId) };

        while (openSet.size > 0) {
            let current = null;
            let lowestFScore = Infinity;
            for (const nodeId of openSet) {
                if (fScore[nodeId] < lowestFScore) {
                    current = nodeId;
                    lowestFScore = fScore[nodeId];
                }
            }

            if (current === endNodeId) {
                const path = this.reconstructPath(cameFrom, current);
                const cost = gScore[current];
                this.memo[startNodeId] = { path, cost };
                return { path, cost };
            }

            openSet.delete(current);

            const currentNode = this.getNode(current);
            if (!currentNode) continue;

            for (const neighborId in currentNode.edges) {
                const edgeData = currentNode.edges[neighborId];
                const tentativeGScore = gScore[current] + edgeData.weight;

                if (!(neighborId in gScore) || tentativeGScore < gScore[neighborId]) {
                    cameFrom[neighborId] = current;
                    gScore[neighborId] = tentativeGScore;
                    fScore[neighborId] = tentativeGScore + this.heuristic(neighborId, endNodeId);
                    if (!openSet.has(neighborId)) {
                        openSet.add(neighborId);
                    }
                }
            }
        }

        return { path: [], cost: Infinity };
    }

    /**
     * Reconstructs the path from the cameFrom map generated by A*.
     * @function reconstructPath
     * @param {object} cameFrom - Map of node IDs to their predecessors in the path.
     * @param {string} current - ID of the current node.
     * @returns {string[]} - Array of node IDs representing the reconstructed path.
     */
    reconstructPath(cameFrom, current) {
        const totalPath = [current];
        while (current in cameFrom) {
            current = cameFrom[current];
            totalPath.unshift(current);
        }
        return totalPath;
    }

    /**
     * Calls a Large Language Model (LLM) to get suggestions or actions.
     * @async
     * @function callLLM
     * @param {string} prompt - Prompt to send to the LLM.
     * @param {object[]} [personas=null] - Optional array of personas for deliberation.
     * @returns {Promise<object>} - LLM response object.
     */
    async callLLM(prompt, personas = null) {
        console.log("LLM Prompt:", prompt);

        if (personas) {
            const personaResponses = await this.performDeliberation(prompt, personas);
            return this.synthesizeDeliberation(personaResponses);
        } else {
            // Mocked single LLM call. Replace with actual API call.
            const responses = [
                { action: "proceed", suggestedTask: null, feedback: null, updatedWeights: {} },
                { action: "add_task", suggestedTask: "localize_text", feedback: null, updatedWeights: {} },
                { action: "re-evaluate", suggestedTask: null, feedback: "AI response was not helpful", updatedWeights: { "task_xyz": { human_in_loop_feedback_refined: 5 } } },
                { action: "trigger_subgraph", subgraphGoal: "Explore localization options" } // Added subgraph
            ];
            const simulatedResponse = responses[Math.floor(Math.random() * responses.length)];
            return simulatedResponse;
        }
    }

    /**
     * Performs deliberation by prompting multiple LLM personas.
     * @async
     * @function performDeliberation
     * @param {string} prompt - Prompt for deliberation.
     * @param {object[]} personas - Array of persona objects.
     * @returns {Promise<object[]>} - Array of responses from each persona.
     */
    async performDeliberation(prompt, personas) {
        const personaResponses = [];
        for (const persona of personas) {
            const personaPrompt = `Persona: ${persona.name}\nRole: ${persona.description}\n\n${prompt}`;
            console.log(`Prompting Persona: ${persona.name}`);
            const response = await this.callLLM(personaPrompt);
            personaResponses.push({ persona, response });
        }
        return personaResponses;
    }

    /**
     * Synthesizes responses from deliberation to choose a final action.
     * @function synthesizeDeliberation
     * @param {object[]} personaResponses - Array of persona responses.
     * @returns {object} - Synthesized response object.
     */
    synthesizeDeliberation(personaResponses) {
        console.log("Synthesizing deliberation:", personaResponses);
        // Placeholder: return the first response. Replace with a real synthesis.
        const firstResponse = personaResponses[0]?.response;
        if (!firstResponse || !firstResponse.action) {
            return { action: "proceed" };
        }
        return firstResponse;
    }

    /**
     * Selects the next action based on the current node and LLM suggestions.
     * @async
     * @function selectAction
     * @param {string} currentNodeId - ID of the current node.
     * @returns {Promise<string|null>} - ID of the next node or null if workflow completes.
     */
    async selectAction(currentNodeId) {
        const currentNode = this.getNode(currentNodeId);
        if (!currentNode) { console.error(`Node not found: ${currentNodeId}`); return null; }

        const shouldDeliberate = this.shouldTriggerDeliberation(currentNode);

        let prompt = `Current task: ${currentNode.data.title}\nDescription: ${currentNode.data.description}\n`;
        const availableSolutions = Object.entries(currentNode.data.potential_solutions)
            .map(([key, solution]) => `${key}: ${solution.description} (Time: ${solution.time_estimate}, Pain: ${solution.pain_level}, Complexity: ${solution.complexity}, Human: ${solution.human_in_loop_feedback_refined})`)
            .join("\n");

        prompt += `Available solutions:\n${availableSolutions}\nChoose the best solution or suggest a new task:`;

        let llmResponse;
        if (shouldDeliberate) {
            const personas = [
                { name: "EfficiencyExpert", description: "Focuses on minimizing time and effort." },
                { name: "QualityAdvocate", description: "Prioritizes design quality." },
            ];
            llmResponse = await this.callLLM(prompt, personas);
        } else {
            llmResponse = await this.callLLM(prompt);
        }

        switch (llmResponse.action) {
            case "proceed":
                for (let solutionKey in currentNode.data.potential_solutions) {
                    if (currentNode.kind == "task") {
                        let solutionNodeId = `${currentNodeId}_${solutionKey}`
                        this.addNode(solutionNodeId, currentNode.data.potential_solutions[solutionKey], "solution");
                        this.addEdge(currentNodeId, solutionNodeId, null, "solution_selection");
                    }
                }
                return Object.keys(currentNode.edges)[0];

            case "add_task":
                const newTaskData = await this.createTaskDataFromLLMSuggestion(llmResponse.suggestedTask);
                if (newTaskData) {
                    const newNodeId = this.addTask(newTaskData);
                    this.addEdge(currentNodeId, newNodeId, null, "llm_suggested")
                    return newNodeId;
                }
                return null;

            case "re-evaluate":
                console.log("LLM Feedback:", llmResponse.feedback);
                this.updateWeights(llmResponse.updatedWeights);
                const bestPath = this.aStar(currentNodeId, "end");
                return bestPath.path[1] || null;

            case "trigger_subgraph":
                return this.handleSubGraphTrigger(currentNodeId, llmResponse.subgraphGoal);

            default:
                console.warn("Unknown LLM command:", llmResponse.action);
                return null;
        }
    }

    /**
     * Determines if deliberation should be triggered for a given node.
     * @function shouldTriggerDeliberation
     * @param {object} node - The node object.
     * @returns {boolean} - True if deliberation should be triggered, false otherwise.
     */
    shouldTriggerDeliberation(node) {
        if (node.kind === "decision") return true;
        if (node.data.complexity >= 6) return true;
        return false;
    }

    /**
     * Creates task data from an LLM suggestion.
     * @async
     * @function createTaskDataFromLLMSuggestion
     * @param {string} taskName - Name of the task suggested by the LLM.
     * @returns {Promise<object>} - Task data object.
     */
    async createTaskDataFromLLMSuggestion(taskName) {
        const prompt = `Create a JSON object for a new design task named "${taskName}". Include title, description, potential solutions (at least 'manual_human'), and initial estimates (1-7 scale) for time, pain, complexity, and human_in_loop_feedback_initial/refined.`;
        const llmResponse = await this.callLLM(prompt);

        return {
            title: taskName,
            description: `LLM-suggested task: ${taskName}`,
            potential_solutions: {
                manual_human: {
                    name: `Manual ${taskName}`,
                    description: `Manually perform ${taskName}`,
                    pain_level: 4, complexity: 4, time_estimate: 4,
                    human_in_loop_feedback_initial: 1, human_in_loop_feedback_refined: 1,
                },
            },
        };
    }

    /**
     * Adds a task to the graph, including its manual solution.
     * @function addTask
     * @param {object} taskData - Data for the task.
     * @returns {string} - ID of the newly added task node.
     */
    addTask(taskData) {
        const taskId = this.generateUniqueTaskId(taskData.title);
        this.addNode(taskId, taskData);
        const solutionId = `${taskId}_manual_human`;
        this.addNode(solutionId, taskData.potential_solutions.manual_human, "solution");
        this.addEdge(taskId, solutionId);
        return taskId;
    }

    /**
     * Generates a unique task ID based on the task title.
     * @function generateUniqueTaskId
     * @param {string} taskTitle - Title of the task.
     * @returns {string} - Unique task ID.
     */
    generateUniqueTaskId(taskTitle) {
        const baseId = taskTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        let uniqueId = baseId;
        let counter = 1;
        while (this.nodes[uniqueId]) {
            uniqueId = `${baseId}_${counter}`;
            counter++;
        }
        return uniqueId;
    }

    /**
     * Requests human feedback for a given node.
     * @function requestHumanFeedback
     * @param {string} nodeId - ID of the node to request feedback for.
     * @returns {object} - Feedback object.
     */
    requestHumanFeedback(nodeId) {
        const node = this.getNode(nodeId);
        console.log(`Requesting human feedback for task: ${node.data.title}`);
        // Simulated feedback.
        const feedbackTypes = [
            { type: 'rating', scale: 'human_in_loop_feedback_refined', value: 4 },
            { type: 'boolean', question: 'Was the task successful?', value: true },
            { type: 'text', question: 'Describe any issues encountered', value: 'Minor adjustments needed' }
        ];
        const randomFeedback = feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)]
        return randomFeedback
    }

    /**
     * Updates node weights based on feedback.
     * @function updateWeights
     * @param {object} feedback - Feedback data to update weights with.
     */
    updateWeights(feedback) {
        for (const nodeId in feedback) {
            const node = this.getNode(nodeId);
            if (node) {
                if (feedback[nodeId].human_in_loop_feedback_refined) {
                    node.data.human_in_loop_feedback_refined = feedback[nodeId].human_in_loop_feedback_refined
                }
                for (const neighborId in node.edges) {
                    node.edges[neighborId].weight = calculateWeight(this.nodes[neighborId].data);
                }
            }
        }
        this.memo = {};
    }

    /**
     * Executes the workflow from a start node to an end node.
     * @async
     * @function executeWorkflow
     * @param {string} startNodeId - ID of the starting node.
     * @param {string} endNodeId - ID of the ending node.
     * @returns {Promise<string|null>} - ID of the current node or null if workflow completes.
     */
    async executeWorkflow(startNodeId, endNodeId) {
        let current = startNodeId
        let nextNodeId = await this.selectAction(current)

        if (nextNodeId) {
            const nextNode = this.getNode(nextNodeId);

            if (nextNode && nextNode.kind === "solution") {
                console.log(`Executing solution: ${nextNode.data.name}`);
                await new Promise((resolve) => setTimeout(resolve, nextNode.data.time_estimate * 500)); // Simulate

                const feedback = this.requestHumanFeedback(nextNodeId);
                console.log("Feedback received:", feedback);
                this.updateWeightsBasedOnFeedback(nextNodeId, feedback);
                const path = this.aStar(nextNodeId, "end");

                current = path.path[1] || null;
                if (current == null) {
                    console.log("Workflow completed (or no path found).");
                    return;
                }

            } else {
                current = nextNodeId
            }
        } else {
            console.log("Workflow completed (or no path found).");
            return;
        }

        return current
    }

    /**
     * Updates weights based on human feedback for a specific node.
     * @function updateWeightsBasedOnFeedback
     * @param {string} nodeId - ID of the node to update weights for.
     * @param {object} feedback - Feedback object.
     */
    updateWeightsBasedOnFeedback(nodeId, feedback) {
        const node = this.getNode(nodeId);
        if (!node) return;

        if (feedback.type === 'rating' && feedback.scale) {
            node.data[feedback.scale] = feedback.value;
        } else if (feedback.type === 'boolean' && feedback.question.includes('successful')) {
            node.data.success_probability = feedback.value ? 0.95 : 0.5;
        } else if (feedback.type === 'text') {
            console.log(`Text feedback received: ${feedback.value}`);
        }

        for (const neighborId in node.edges) {
            node.edges[neighborId].weight = calculateWeight(this.nodes[neighborId].data);
        }
    }

    /**
     * Loads tasks from a JSON object into the graph.
     * @function loadTasks
     * @param {object} tasksJson - JSON object representing tasks.
     */
    loadTasks(tasksJson) {
        this.addNode("start", { title: "Start Project" }, "start");
        this.addNode("end", { title: "End Project" }, "end");
        let prevTaskId = "start";

        for (const taskId in tasksJson) {
            const taskData = tasksJson[taskId];
            this.addNode(taskId, taskData);
            this.addEdge(prevTaskId, taskId, null, "sequence");
            prevTaskId = taskId;
        }
        this.addEdge(prevTaskId, "end");
    }

    /**
     * Handles the trigger of a subgraph creation.
     * @async
     * @function handleSubGraphTrigger
     * @param {string} currentNodeId - ID of the current node triggering the subgraph.
     * @param {string} subgraphGoal - Goal or description of the subgraph.
     * @returns {Promise<string|null>} - Placeholder for future subgraph execution logic.
     */
    async handleSubGraphTrigger(currentNodeId, subgraphGoal) {
        const subGraph = this.createSubGraph(currentNodeId, subgraphGoal);

        if (subGraph) {
            console.log(`Subgraph created with goal: ${subgraphGoal}`)

            //Option 1: Just create it. Let the main execution loop get back to it.
            return null;

            // Option 2: Run the subgraph immediately and merge when it's done.
            // let currentSub = "sub_start";
            // while (currentSub !== "sub_end" && currentSub !== null) {
            //  currentSub = await subGraph.executeWorkflow(currentSub, "sub_end");
            // }

            // this.mergeSubGraph(subGraph);
            // return this.selectAction(currentNodeId); // Re-evaluate after merge

        }
        console.warn("SubGraph creation failed")
        return null;
    }
}


/**
 * --- GRU.JS SECTION ---
 * @section GRU
 *  Handles the Graph Rendering and User Interface Interactions.
 */

/** @constant {HTMLElement} graphCanvas - The main SVG canvas element. */
const graphCanvas = document.getElementById('graphCanvas');
/** @constant {HTMLElement} darkModeToggleContainer - Container for the dark mode toggle. */
const darkModeToggleContainer = document.getElementById('darkModeToggleContainer');
/** @constant {HTMLElement} resetButton - Button to reset the graph. */
const resetButton = document.getElementById('resetButton');
/** @constant {HTMLElement} addNodeButton - Button to add a node to the graph. */
const addNodeButton = document.getElementById('addNodeButton');
/** @constant {HTMLElement} removeNodeButton - Button to remove a node from the graph. */
const removeNodeButton = document.getElementById('removeNodeButton');
/** @constant {HTMLElement} connectNodesButton - Button to toggle node connection mode. */
const connectNodesButton = document.getElementById('connectNodesButton');
/** @constant {HTMLElement} ringNodesInput - Input field for circular ring node counts. */
const ringNodesInput = document.getElementById('ringNodesInput');
/** @constant {HTMLElement} addRingsButton - Button to add circular rings to the graph. */
const addRingsButton = document.getElementById('addRingsButton');
/** @constant {HTMLElement} triGridRingsInput - Input field for triangular grid ring count. */
const triGridRingsInput = document.getElementById('triGridRingsInput');
/** @constant {HTMLElement} addTriGridButton - Button to add a triangular grid to the graph. */
const addTriGridButton = document.getElementById('addTriGridButton');
/** @constant {HTMLElement} observatory - Container for the focus area observatory. */
const observatory = document.getElementById('observatory');
/** @constant {HTMLElement} scriptSelector - Dropdown for selecting LDR scripts. */
const scriptSelector = document.getElementById('scriptSelector');
/** @constant {HTMLElement} stepBackwardButton - Button to step backward in the script. */
const stepBackwardButton = document.getElementById('stepBackwardButton');
/** @constant {HTMLElement} playPauseButton - Button to play/pause script execution. */
const playPauseButton = document.getElementById('playPauseButton');
/** @constant {HTMLElement} stepForwardButton - Button to step forward in the script. */
const stepForwardButton = document.getElementById('stepForwardButton');
/** @constant {HTMLElement} speedSlider - Slider to control script playback speed. */
const speedSlider = document.getElementById('speedSlider');
/** @constant {HTMLElement} speedLabel - Label displaying the current playback speed. */
const speedLabel = document.getElementById('speedLabel');
/** @constant {HTMLElement} scriptStepDisplay - Element to display the current script step. */
const scriptStepDisplay = document.getElementById('scriptStepDisplay');
/** @constant {HTMLElement} observatorySvg - SVG element inside the observatory. */
const observatorySvg = document.getElementById('observatorySvg');
/** @constant {HTMLElement} mainSvg - Main SVG element for the graph. */
const mainSvg = document.getElementById('mainSvg');

/** @type {boolean} - Flag indicating if node connection mode is active. */
let isConnectingNodes = false;
/** @type {boolean} - Flag indicating dark mode is active. */
let darkMode = true;
/** @type {object|null} - Currently loaded LDR script. */
let currentScript = null;
/** @type {array} - Array of script steps, parsed from the current script. */
let scriptSteps = [];
/** @type {number} - Index of the current step in the script steps array. */
let currentStepIndex = -1;
/** @type {boolean} - Flag indicating if script playback is active. */
let isPlaying = false;
/** @type {number} - Playback speed in milliseconds per step. */
let playSpeed = 500;
/** @type {number|null} - Interval ID for script playback. */
let playInterval;
/** @type {string[]} - Array to store message history for display. */
let messageHistoryArray = [];
/** @type {string|null} - ID of the node selected as the source for connection. */
let selectedNodeIdForConnection = null;
/** @type {number} - Counter for generating unique node IDs. */
let nextNodeId = 0;
/** @type {SVGTextElement|null} - SVG text element to display current step message. */
let currentStepMessage;
/** @type {SVGGElement|null} - SVG group element to display message history. */
let messageHistory;

/** @type {object} - Graph controller instance, manages graph operations. */
let graphController;

/** @constant {Map<string, function>} commandRenderMap - Map of LDR command names to their rendering functions. */
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


/**
 * Renders a single step of the LDR script.
 * @function renderStep
 * @param {object} stepDefinition - Definition of the step to render.
 */
function renderStep(stepDefinition) {
    if (!stepDefinition) {
        console.warn("renderStep: stepDefinition is empty or null.");
        return;
    }

    const commandName = Object.keys(stepDefinition)[0];
    const params = stepDefinition[commandName];

    if (!commandName) {
        console.warn("renderStep: Step is missing command.");
        return;
    }

    const renderFunction = commandRenderMap.get(commandName);
    if (renderFunction) {
        renderFunction(params);
    } else {
        console.warn("renderStep: Unknown render action:", commandName, stepDefinition);
    }
}


/**
 * Renders adding a node to the SVG canvas.
 * @function renderAddNode
 * @param {object} params - Parameters for adding a node.
 * @param {string} params.nodeId - ID of the node.
 * @param {object} params.data - Node data (including x, y coordinates).
 * @param {string} params.kind - Node kind/type.
 */
function renderAddNode(params) {
    const { nodeId, data, kind } = params;
    if (!nodeId) {
        console.warn("renderAddNode: nodeId is undefined or missing in params:", params);
        return;
    }
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', `node ${kind}-node`);
    circle.setAttribute('data-node-id', nodeId);
    circle.setAttribute('r', 6);

    if (data && typeof data.x === 'number' && typeof data.y === 'number') {
        circle.setAttribute('cx', data.x);
        circle.setAttribute('cy', data.y);
    } else {
        circle.setAttribute('cx', graphCanvas.clientWidth / 2);
        circle.setAttribute('cy', graphCanvas.clientHeight / 2);
    }

    circle.addEventListener('click', () => onNodeClick(nodeId));
    mainSvg.appendChild(circle);
    updateEdgePositions();
}

/**
 * Renders connecting two nodes with an edge on the SVG canvas.
 * @function renderConnectNodes
 * @param {object} params - Parameters for connecting nodes.
 * @param {string} params.node1 - ID of the first node.
 * @param {string} params.node2 - ID of the second node.
 * @param {number} [params.weight] - Edge weight (optional).
 * @param {string} [params.edgeType] - Edge type (optional).
 */
function renderConnectNodes(params) {
    const { node1, node2, weight, edgeType } = params;
    if (!node1 || !node2) {
        console.warn("renderConnectNodes: node1 or node2 is undefined or missing in params:", params);
        return;
    }
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', `edge ${edgeType}-edge`);
    line.setAttribute('data-from', node1);
    line.setAttribute('data-to', node2);
    mainSvg.appendChild(line);
    updateEdgePositions();
}

/**
 * Resets the display by clearing the main SVG and observatory SVG.
 * @function resetDisplay
 */
function resetDisplay(params) {
    mainSvg.innerHTML = '';
    observatorySvg.innerHTML = '';
    setupObservatory();
}

/**
 * Renders removing a node from the SVG canvas.
 * @function renderRemoveNode
 * @param {object} params - Parameters for removing a node.
 * @param {string} params.nodeId - ID of the node to remove.
 */
function renderRemoveNode(params) {
    const { nodeId } = params;
    if (!nodeId) {
        console.warn("renderRemoveNode: nodeId is undefined or missing in params:", params);
        return;
    }
    const nodeElement = mainSvg.querySelector(`[data-node-id="${nodeId}"]`);
    if (!nodeElement) {
        console.warn("renderRemoveNode: nodeElement not found in mainSvg for nodeId:", nodeId);
        return;
    }
    if (nodeElement.parentNode === mainSvg) {
        mainSvg.removeChild(nodeElement);
    } else {
        console.warn("renderRemoveNode: nodeElement is not a child of mainSvg, unexpected state for nodeId:", nodeId);
    }


    const edges = mainSvg.querySelectorAll(`[data-from="${nodeId}"], [data-to="${nodeId}"]`);
    edges.forEach(edge => {
        if (edge.parentNode === mainSvg) {
            mainSvg.removeChild(edge);
        }
    });
}

/**
 * Renders selecting a path of nodes on the SVG canvas.
 * @function renderSelectPath
 * @param {object} params - Parameters for selecting a path.
 * @param {string[]} params.nodeIds - Array of node IDs in the path.
 */
function renderSelectPath(params) {
    const { nodeIds } = params;
    if (!nodeIds) {
        console.warn("renderSelectPath: nodeIds is undefined or missing in params:", params);
        return;
    }
    graphController.selectPath(nodeIds);

    mainSvg.querySelectorAll('.node.selected').forEach(node => {
        node.classList.remove('selected');
    });

    nodeIds.forEach(nodeId => {
        const nodeElement = mainSvg.querySelector(`.node[data-node-id="${nodeId}"]`);
        if (!nodeElement) {
            console.warn("renderSelectPath: nodeElement not found in mainSvg for nodeId:", nodeId);
            return;
        }
        nodeElement.classList.add('selected');
    });
}

/**
 * Renders copying and moving selected nodes to the observatory (focus area).
 * @function renderCopyMoveToFocus
 * @param {object} [params] - Optional parameters for copy move to focus.
 * @param {string[]} [params.nodeIds] - Array of node IDs to copy (if not provided, uses selectedPath).
 */
function renderCopyMoveToFocus(params) {
    let nodeIds = params ? params.nodeIds : null;
    if (!nodeIds) {
        nodeIds = graphController.selectedPath; // Use selectedPath if nodeIds is null
        if (!nodeIds || nodeIds.length === 0) {
            console.warn("renderCopyMoveToFocus: No nodeIds provided and selectedPath is empty.");
            observatorySvg.innerHTML = '';
            return;
        }
    }

    observatorySvg.innerHTML = '';
    graphController.resetFocusArea(); // Clear focusArea before copying

    const observatoryRect = observatory.getBoundingClientRect();

    nodeIds.forEach((nodeId, index) => {
        const originalNode = mainSvg.querySelector(`.node[data-node-id="${nodeId}"]`);
        if (!originalNode) {
            console.warn(`renderCopyMoveToFocus: originalNode not found in mainSvg for nodeId: ${nodeId}`);
            return;
        }
        const clonedNode = originalNode.cloneNode(true);
        clonedNode.classList.add('focus-node');
        clonedNode.removeAttribute('data-node-id');
        clonedNode.setAttribute('data-focus-node-id', nodeId);

        const targetX = 20 + (observatoryRect.width - 40) * (index / (nodeIds.length - 1 || 1));
        const targetY = observatoryRect.height / 2;

        clonedNode.setAttribute('cx', targetX);
        clonedNode.setAttribute('cy', targetY);

        observatorySvg.appendChild(clonedNode);
        graphController.focusArea.push(nodeId.replace(/^focus_/, '')); // Update focusArea in graphController, remove 'focus_' prefix
    });

    nodeIds.forEach(fromNodeId => {
        nodeIds.forEach(toNodeId => {
            const edge = mainSvg.querySelector(`.edge[data-from="${fromNodeId}"][data-to="${toNodeId}"]`);
            if (edge) {
                const clonedEdge = edge.cloneNode(true);
                clonedEdge.classList.add('focus-edge');
                clonedEdge.removeAttribute('data-from');
                clonedEdge.removeAttribute('data-to');
                clonedEdge.setAttribute('data-focus-from', fromNodeId);
                clonedEdge.setAttribute('data-focus-to', toNodeId);
                observatorySvg.appendChild(clonedEdge);
            }
        })
    })
    updateFocusEdgePositions();
    console.log("renderCopyMoveToFocus: focusArea after copy:", graphController.focusArea); // ADDED: Log focusArea
}

/**
 * Renders straightening a path in the observatory (focus area).
 * @function renderStraightenPath
 * @param {object} [params] - Optional parameters for straighten path.
 * @param {string[]} [params.nodeIds] - Array of node IDs to straighten (if not provided, uses focusArea).
 */
function renderStraightenPath(params) {
    let nodeIds = params ? params.nodeIds : null;
    if (!nodeIds) {
        nodeIds = graphController.focusArea; // Use focusArea which should be populated by copy_move_to_focus
        if (!nodeIds || nodeIds.length === 0) {
            console.warn("renderStraightenPath: No nodeIds provided and focusArea is empty.");
            return;
        }
    }

    const observatoryRect = observatory.getBoundingClientRect();
    const startX = 20;
    const endX = observatoryRect.width - 20;
    const yPos = observatoryRect.height / 2;

    nodeIds.forEach((nodeId, index) => {
        const nodeElement = observatorySvg.querySelector(`[data-focus-node-id="${nodeId}"]`);
        if (!nodeElement) {
            console.warn("renderStraightenPath: nodeElement not found in observatorySvg for nodeId:", nodeId);
            return;
        }
        const targetX = startX + (endX - startX) * (index / (nodeIds.length - 1 || 1));
        nodeElement.setAttribute('cx', targetX);
        nodeElement.setAttribute('cy', yPos);
    });
    updateFocusEdgePositions();
}

/**
 * Renders compressing a path in the observatory (focus area). Visually removes intermediate nodes.
 * @function renderCompressPath
 * @param {object} [params] - Optional parameters for compress path.
 * @param {string[]} [params.intermediateNodes] - Array of intermediate node IDs (if not provided, uses focusArea).
 * @param {string} [params.startNodeId] - ID of the start node of the path (if not provided, uses focusArea).
 * @param {string} [params.endNodeId] - ID of the end node of the path (if not provided, uses focusArea).
 */
function renderCompressPath(params) {
    let intermediateNodes;
    let startNodeId;
    let endNodeId;

    if (params && params.intermediateNodes && params.startNodeId && params.endNodeId) {
        intermediateNodes = params.intermediateNodes;
        startNodeId = params.startNodeId;
        endNodeId = params.endNodeId;
    } else {
        if (!graphController.focusArea || graphController.focusArea.length < 2) {
            console.warn("renderCompressPath: No params provided and focusArea is not valid for compression.");
            return;
        }
        intermediateNodes = graphController.focusArea.slice(1, -1).map(id => `focus_${id}`); // Add 'focus_' prefix back
        startNodeId = graphController.focusArea[0] ? `focus_${graphController.focusArea[0]}` : null; // Add 'focus_' prefix and handle potential undefined
        endNodeId = graphController.focusArea[graphController.focusArea.length - 1] ? `focus_${graphController.focusArea[graphController.focusArea.length - 1]}` : null; // Add 'focus_' prefix and handle potential undefined


        if (!startNodeId || !endNodeId || intermediateNodes.length === 0) {
            console.warn("renderCompressPath: focusArea does not contain a valid path for compression.");
            return;
        }
    }


    intermediateNodes.forEach(nodeId => {
        const nodeElement = observatorySvg.querySelector(`[data-focus-node-id="${nodeId}"]`);
        if (nodeElement) {
            if (nodeElement.parentNode === observatorySvg) {
                observatorySvg.removeChild(nodeElement);
            } else {
                console.warn("renderCompressPath: nodeElement is not a child of observatorySvg, unexpected state for nodeId:", nodeId);
            }
        } else {
            console.warn("renderCompressPath: nodeElement not found in observatorySvg for nodeId:", nodeId);
        }
    });
    observatorySvg.querySelectorAll('.focus-edge').forEach(edge => {
        if (edge.parentNode === observatorySvg) {
            observatorySvg.removeChild(edge);
        }
    });
    console.log("renderCompressPath: Path compressed in focus area.", startNodeId, endNodeId, intermediateNodes); // Message for compression
}

/**
 * Renders adding a compressed path to the main graph from the observatory (focus area).
 * @function renderAddCompressedPath
 * @param {object} [params] - Optional parameters for adding compressed path.
 * @param {string} [params.startNodeId] - ID of the start node of the compressed path (if not provided, uses focusArea).
 * @param {string} [params.endNodeId] - ID of the end node of the compressed path (if not provided, uses focusArea).
 */
function renderAddCompressedPath(params) {
    const { startNodeId, endNodeId } = params;
    if (!startNodeId || !endNodeId) {
        if (!graphController.focusArea || graphController.focusArea.length < 2) {
            console.warn("renderAddCompressedPath: No params provided and focusArea is not valid.");
            return;
        }
        // Assuming focusArea[0] is start and last is end if params are missing
        params.startNodeId = graphController.focusArea[0].replace(/^focus_/, '');;
        params.endNodeId = graphController.focusArea[graphController.focusArea.length - 1].replace(/^focus_/, '');
        if (!params.startNodeId || !params.endNodeId) {
            console.warn("renderAddCompressedPath: Could not derive startNodeId or endNodeId from focusArea.");
            return;
        }
    }


    const resolvedStartNodeId = params.startNodeId;
    const resolvedEndNodeId = params.endNodeId;


    const startNode = mainSvg.querySelector(`.node[data-node-id="${resolvedStartNodeId}"]`);
    const endNode = mainSvg.querySelector(`.node[data-node-id="${resolvedEndNodeId}"]`);

    if (!startNode) {
        console.warn(`renderAddCompressedPath: startNode not found in mainSvg for startNodeId: ${resolvedStartNodeId}`);
        return;
    }
    if (!endNode) {
        console.warn(`renderAddCompressedPath: endNode not found in mainSvg for endNodeId: ${resolvedEndNodeId}`);
        return;
    }

    const startRect = startNode.getBoundingClientRect();
    const endRect = endNode.getBoundingClientRect();
    const graphRect = graphCanvas.getBoundingClientRect();

    const startX = startRect.left + startRect.width / 2 - graphRect.left;
    const startY = startRect.top + startRect.height / 2 - graphRect.top;
    const endX = endRect.left + endRect.width / 2 - graphRect.left;
    const endY = endRect.top + endRect.height / 2 - graphRect.top;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'edge compressed-edge');
    line.setAttribute('x1', startX);
    line.setAttribute('y1', startY);
    line.setAttribute('x2', endX);
    line.setAttribute('y2', endY);
    line.setAttribute('data-from', resolvedStartNodeId);
    line.setAttribute('data-to', resolvedEndNodeId);
    mainSvg.appendChild(line);
    updateEdgePositions();
    console.log(`renderAddCompressedPath: Added compressed path between ${resolvedStartNodeId} and ${resolvedEndNodeId}`); // Message for adding compressed path
}

/**
 * Renders adding circular rings of nodes to the SVG canvas.
 * @function renderAddCircularRings
 * @param {object} params - Parameters for adding circular rings.
 * @param {number[]} params.ringSizes - Array of node counts for each ring.
 */
function renderAddCircularRings(params) {
    const { ringSizes } = params;
    if (!ringSizes || !Array.isArray(ringSizes)) {
        console.warn("renderAddCircularRings: ringSizes is not a valid array in params:", params);
        return;
    }
    const centerX = graphCanvas.clientWidth / 2;
    const centerY = graphCanvas.clientHeight / 2;
    let currentRadius = 40;
    const minNodeSpacing = 40;
    let previousRingNodes = 0;
    const initialRingRadiusIncrement = Math.min(centerX, centerY) * 0.15;
    let tempNextNodeId = nextNodeId;

    ringSizes.forEach((numNodes, index) => {
        if (!Number.isInteger(numNodes) || numNodes <= 0) {
            console.warn("renderAddCircularRings: Invalid ring size:", numNodes, "in params:", params);
            return;
        }
        let ringRadiusIncrement;
        if (index === 0) {
            ringRadiusIncrement = initialRingRadiusIncrement;
        } else {
            ringRadiusIncrement = Math.max(minNodeSpacing * previousRingNodes / (2 * Math.PI), currentRadius * 0.3);
        }
        currentRadius += ringRadiusIncrement;
        const angleStep = (2 * Math.PI) / numNodes;

        for (let i = 0; i < numNodes; i++) {
            const angle = i * angleStep;
            const x = centerX + currentRadius * Math.cos(angle);
            const y = centerY + currentRadius * Math.sin(angle);
            graphController.addNode(`node-${tempNextNodeId++}`, { x: x, y: y }, "ring");
        }
        previousRingNodes = numNodes;
    });
    nextNodeId = tempNextNodeId;
    updateEdgePositions();
}

/**
 * Renders adding a triangular grid of nodes to the SVG canvas.
 * @function renderAddTriangularGrid
 * @param {object} params - Parameters for adding a triangular grid.
 * @param {number} params.numRings - Number of rings in the triangular grid.
 */
function renderAddTriangularGrid(params) {
    const { numRings } = params;
    if (!Number.isInteger(numRings) || numRings <= 0) {
        console.warn("renderAddTriangularGrid: numRings is not a positive integer in params:", params);
        return;
    }
    const centerX = graphCanvas.clientWidth / 2;
    const centerY = graphCanvas.clientHeight / 2;
    const nodeSpacing = Math.min(centerX, centerY) * 0.2;
    let tempNextNodeId = nextNodeId;

    for (let ring = 0; ring < numRings; ring++) {
        let nodesInRing = ring === 0 ? 1 : 6 * ring;
        for (let i = 0; i < nodesInRing; i++) {
            let angle = (2 * Math.PI / nodesInRing) * i - (ring % 2 === 0 ? 0 : Math.PI / 6);
            let x = centerX + nodeSpacing * ring * Math.cos(angle);
            let y = centerY + nodeSpacing * ring * Math.sin(angle);
            graphController.addNode(`node-${tempNextNodeId++}`, { x: x, y: y }, 'trigrid');
        }
    }
    nextNodeId = tempNextNodeId;
    updateEdgePositions();
}

/**
 * Renders displaying a message in the observatory.
 * @function renderMessageOnly
 * @param {object} params - Parameters for displaying a message.
 * @param {string} params.message - The message to display.
 */
function renderMessageOnly(params) {
    const { message } = params;
    if (message) {
        messageHistoryArray.push(message);
        if (messageHistoryArray.length > 3) messageHistoryArray.shift();
        updateMessageDisplay();
        console.log("renderMessageOnly:", message); // Log message to console as well
    } else {
        console.warn("renderMessageOnly: message is undefined or missing in params:", params);
    }
}

/**
 * Renders creating a subgraph visualization cue.
 * @function renderCreateSubGraph
 * @param {object} params - Parameters for creating a subgraph.
 * @param {string} params.parentNodeId - ID of the parent node.
 * @param {string} params.subGraphId - ID of the subgraph.
 */
function renderCreateSubGraph(params) {
    const { parentNodeId, subGraphId } = params;
    if (!parentNodeId || !subGraphId) {
        console.warn("renderCreateSubGraph: parentNodeId or subGraphId is undefined or missing in params:", params);
        return;
    }
    console.log("renderCreateSubGraph - Visual cue for subgraph:", parentNodeId, subGraphId);
}

/**
 * Renders merging a subgraph visualization cue.
 * @function renderMergeSubGraph
 * @param {object} params - Parameters for merging a subgraph.
 * @param {string} params.parentNodeId - ID of the parent node.
 * @param {string} params.subGraphId - ID of the subgraph.
 * @param {string} [params.mergeStrategy] - Merge strategy (optional).
 */
function renderMergeSubGraph(params) {
    const { parentNodeId, subGraphId, mergeStrategy } = params;
    if (!parentNodeId || !subGraphId) {
        console.warn("renderMergeSubGraph: parentNodeId or subGraphId is undefined or missing in params:", params);
        return;
    }
    console.log("renderMergeSubGraph - Visual cue for subgraph merge:", parentNodeId, subGraphId, mergeStrategy);
}


/**
 * Updates the positions of all edges in the main SVG based on their connected nodes.
 * @function updateEdgePositions
 */
function updateEdgePositions() {
    const edges = mainSvg.querySelectorAll('.edge');
    edges.forEach(edge => {
        const fromNodeId = edge.getAttribute('data-from');
        const toNodeId = edge.getAttribute('data-to');
        const fromNode = mainSvg.querySelector(`[data-node-id="${fromNodeId}"]`);
        const toNode = mainSvg.querySelector(`[data-node-id="${toNodeId}"]`);

        if (!fromNode || !toNode) { // Check if nodes exist
            return; // Skip updating edge if nodes are missing
        }

        edge.setAttribute('x1', fromNode.getAttribute('cx') || 0);
        edge.setAttribute('y1', fromNode.getAttribute('cy') || 0);
        edge.setAttribute('x2', toNode.getAttribute('cx') || 0);
        edge.setAttribute('y2', toNode.getAttribute('cy') || 0);
    });
}

/**
 * Updates the positions of all edges in the observatory SVG based on their connected focus nodes.
 * @function updateFocusEdgePositions
 */
function updateFocusEdgePositions() {
    const edges = observatorySvg.querySelectorAll('.focus-edge');
    edges.forEach(edge => {
        const fromNodeId = edge.getAttribute('data-focus-from');
        const toNodeId = edge.getAttribute('data-focus-to');
        const fromNode = observatorySvg.querySelector(`[data-focus-node-id="${fromNodeId}"]`);
        const toNode = observatorySvg.querySelector(`[data-focus-node-id="${toNodeId}"]`);

        if (!fromNode || !toNode) { // Check if nodes exist
            return; // Skip updating focus edge if nodes are missing
        }

        edge.setAttribute('x1', fromNode.getAttribute('cx') || 0);
        edge.setAttribute('y1', fromNode.getAttribute('cy') || 0);
        edge.setAttribute('x2', toNode.getAttribute('cx') || 0);
        edge.setAttribute('y2', toNode.getAttribute('cy') || 0);
    });
}


/**
 * Handles click events on nodes, for node selection and connection.
 * @function onNodeClick
 * @param {string} nodeId - ID of the clicked node.
 */
function onNodeClick(nodeId) {
    if (isConnectingNodes) {
        if (!selectedNodeIdForConnection) {
            selectedNodeIdForConnection = nodeId;
            const selectedNode = mainSvg.querySelector(`.node[data-node-id="${nodeId}"]`);
            if (selectedNode) selectedNode.classList.add('selected');
        } else if (selectedNodeIdForConnection !== nodeId) {
            graphController.addEdge(selectedNodeIdForConnection, nodeId); // Use graphController
            const previouslySelectedNode = mainSvg.querySelector(`.node[data-node-id="${selectedNodeIdForConnection}"]`);
            if (previouslySelectedNode) previouslySelectedNode.classList.remove('selected');
            selectedNodeIdForConnection = null;
            isConnectingNodes = false;
            connectNodesButton.textContent = 'Connect Nodes';
        } else {
            const selectedNode = mainSvg.querySelector(`.node[data-node-id="${selectedNodeIdForConnection}"]`);
            if (selectedNode) selectedNode.classList.remove('selected');
            selectedNodeIdForConnection = null;
        }
    } else {
        onCanvasClick(nodeId); // Clear node selection if clicking on canvas (or already selected node)
        selectedNodeIdForConnection = null;
    }
}

/**
 * Handles click events on the canvas, for clearing node selections.
 * @function onCanvasClick
 * @param {string} [nodeId] - Optional node ID, if click originated from a node (to prevent clearing selection).
 */
function onCanvasClick(nodeId) {
    if (!isConnectingNodes && !nodeId) { // Only clear selection if not connecting nodes and not clicking a node
        graphController.selectPath([]); // Clear selected path in graphController
        mainSvg.querySelectorAll('.node.selected').forEach(node => {
            node.classList.remove('selected'); // Clear visual selection
        });
    }
}


/**
 * Sets up the observatory SVG, including message display areas.
 * @function setupObservatory
 */
function setupObservatory() {
    observatorySvg.innerHTML = '';
    const observatoryFragment = document.createDocumentFragment();

    const currentStepMessageTextElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    currentStepMessageTextElem.setAttribute('id', 'currentStepMessage');
    currentStepMessageTextElem.setAttribute('class', 'step-message');
    currentStepMessageTextElem.setAttribute('x', '50%');
    currentStepMessageTextElem.setAttribute('y', '10');
    observatoryFragment.appendChild(currentStepMessageTextElem);

    const messageHistoryGroupElem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    messageHistoryGroupElem.setAttribute('id', 'messageHistory');
    observatoryFragment.appendChild(messageHistoryGroupElem);

    observatorySvg.appendChild(observatoryFragment);

    currentStepMessage = currentStepMessageTextElem;
    messageHistory = messageHistoryGroupElem;
}

/**
 * Updates the message display in the observatory, showing current step message and message history.
 * @function updateMessageDisplay
 */
function updateMessageDisplay() {
    if (currentStepMessage) {
        currentStepMessage.textContent = scriptSteps[currentStepIndex]?.[1]?.message || "";
        currentStepMessage.classList.add('visible');
        setTimeout(() => {
            if (currentStepMessage) {
                currentStepMessage.classList.remove('visible');
            }
        }, playSpeed * 3);
    } else {
        console.warn("updateMessageDisplay: currentStepMessage element is not defined.");
    }

    if (messageHistory) {
        messageHistory.innerHTML = '';
        messageHistoryArray.forEach((msg, index) => {
            const textElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElem.setAttribute('class', 'message-history');
            textElem.setAttribute('x', '50%');
            textElem.setAttribute('y', 40 + (index * 15));
            textElem.textContent = msg;
            messageHistory.appendChild(textElem);
        });
    } else {
        console.warn("updateMessageDisplay: messageHistory element is not defined.");
    }
}

/**
 * Updates the script step display in the UI.
 * @function updateStepDisplay
 */
function updateStepDisplay() {
    scriptStepDisplay.textContent = `Step: ${currentStepIndex + 1}/${scriptSteps.length > 0 ? scriptSteps.length : '-'}`;
}

/**
 * Loads an LDR script by name, resets the graph, and prepares for script execution.
 * @function loadScript
 * @param {string} scriptName - Name of the script to load.
 */
function loadScript(scriptName) {
    currentScript = scripts[scriptName];
    if (currentScript) {
        scriptSteps = Object.entries(currentScript).sort((a, b) => parseInt(a[0].substring(1)) - parseInt(b[0].substring(1)));
        currentStepIndex = -1;
        graphController.resetGraph(); // Use graphController
        stopPlaying();
        stepForward();
        updateStepDisplay();
        messageHistoryArray = [];
        updateMessageDisplay();
    } else {
        scriptSteps = [];
        currentStepIndex = -1;
        updateStepDisplay();
    }
}

/**
 * Executes a single LDR script step.
 * @function executeStep
 * @param {object} step - The script step definition to execute.
 */
function executeStep(step) {
    if (!step) {
        console.warn("executeStep: step is undefined or null.");
        return;
    }

    const commandName = Object.keys(step)[0];
    const params = step[commandName];

    if (params && params.message) {
        renderMessageOnly({ message: params.message });
    }

    const renderFunction = commandRenderMap.get(commandName);
    if (renderFunction) {
        renderFunction(params);
    } else {
        console.warn("executeStep: Unknown command:", commandName, step);
    }
}

/**
 * Steps forward in the script execution by one step.
 * @function stepForward
 */
function stepForward() {
    stopPlaying();
    if (currentStepIndex < scriptSteps.length - 1) {
        currentStepIndex++;
        executeStep(scriptSteps[currentStepIndex][1]);
        updateStepDisplay();
    } else {
        stopPlaying();
        isPlaying = false;
        playPauseButton.textContent = 'Play';
    }
}

/**
 * Steps backward in the script execution by one step.
 * @function stepBackward
 */
function stepBackward() {
    stopPlaying();
    if (currentStepIndex > 0) {
        currentStepIndex--;
        executeStep(scriptSteps[currentStepIndex][1]);
        updateStepDisplay();
    } else if (currentStepIndex === 0) {
        currentStepIndex--;
        resetDisplay({});
        updateStepDisplay();
    }
}
/**
 * Starts or resumes script playback.
 * @function playScript
 */
function playScript() {
    if (isPlaying) {
        stopPlaying();
    } else {
        isPlaying = true;
        playPauseButton.textContent = 'Pause';
        if (currentStepIndex >= scriptSteps.length - 1) {
            currentStepIndex = -1;
            graphController.resetGraph(); // Use graphController
            updateStepDisplay();
        }
        playInterval = setInterval(() => {
            stepForward();
            if (currentStepIndex >= scriptSteps.length - 1) stopPlaying();
        }, playSpeed);
    }
}

/**
 * Stops script playback.
 * @function stopPlaying
 */
function stopPlaying() {
    isPlaying = false;
    playPauseButton.textContent = 'Play';
    clearInterval(playInterval);
}

/**
 * Toggles between play and pause states for script execution.
 * @function togglePlayPause
 */
function togglePlayPause() {
    if (isPlaying) {
        stopPlaying();
    } else {
        playScript();
    }
}

/**
 * Toggles between dark mode and light mode for the UI.
 * @function toggleDarkMode
 */
function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('light-mode', !darkMode);
    darkModeToggleContainer.classList.toggle('is-dark-mode', darkMode);
}

/**
 * Sets up all event listeners for UI interactions.
 * @function setupEventListeners
 */
function setupEventListeners() {
    darkModeToggleContainer.addEventListener('click', toggleDarkMode);
    resetButton.addEventListener('click', () => { graphController.resetGraph(); }); // Use graphController
    addNodeButton.addEventListener('click', () => { graphController.addNode(`node-${nextNodeId++}`, { x: 100, y: 100 }); }); // Use graphController
    removeNodeButton.addEventListener('click', () => { graphController.removeNode(); }); // Use graphController
    connectNodesButton.addEventListener('click', () => {
        isConnectingNodes = !isConnectingNodes;
        connectNodesButton.textContent = isConnectingNodes ? 'Connecting...' : 'Connect Nodes';
        if (!isConnectingNodes) {
            selectedNodeIdForConnection = null;
        }
    });
    addRingsButton.addEventListener('click', () => {
        try {
            const ringSizes = JSON.parse(ringNodesInput.value);
            if (Array.isArray(ringSizes) && ringSizes.every(Number.isInteger) && ringSizes.every(size => size > 0)) {
                graphController.addCircularRings(ringSizes); // Use graphController
            } else {
                console.warn("Invalid input for circular rings. Please provide an array of positive integers. Input was:", ringNodesInput.value);
            }
        } catch (e) {
            console.error("Error parsing ring sizes:", e);
        }
    });
    addTriGridButton.addEventListener('click', () => {
        const numRings = parseInt(triGridRingsInput.value, 10);
        if (Number.isInteger(numRings) && numRings > 0) {
            graphController.addTriangularGrid(numRings); // Use graphController
        } else {
            console.warn("Invalid input for triangular grid rings. Please provide a positive integer. Input was:", triGridRingsInput.value);
        }
    });

    scriptSelector.addEventListener('change', (event) => { loadScript(event.target.value); });
    stepForwardButton.addEventListener('click', () => { stepForward(); });
    stepBackwardButton.addEventListener('click', () => { stepBackward(); });
    playPauseButton.addEventListener('click', () => { togglePlayPause(); });
    speedSlider.addEventListener('input', (event) => {
        playSpeed = parseInt(event.target.value, 10);
        if (isPlaying) { stopPlaying(); playScript(); }
        speedLabel.textContent = `Step Speed (${playSpeed}ms)`;
    });
    mainSvg.addEventListener('click', (event) => {
        if (event.target === mainSvg) { // Check if the click is directly on the svg canvas, not on a node
            onCanvasClick(); // Call onCanvasClick with no nodeId to clear selection
        }
    });
}

/**
 * Populates the script selector dropdown with available LDR scripts.
 * @function populateScriptSelector
 */
function populateScriptSelector() {
    scriptSelector.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Script';
    scriptSelector.appendChild(defaultOption);

    for (const scriptName in scripts) {
        if (Object.hasOwnProperty.call(scripts, scriptName)) {
            const option = document.createElement('option');
            option.value = scriptName;
            option.textContent = scriptName;
            scriptSelector.appendChild(option);
        }
    }
}

/**
 * Default Graph Controller using alf.js Graph
 * @constant {object} defaultGraphController
 */
const defaultGraphController = {
    graphInstance: new Graph(renderStep), // Internal Graph instance

    resetGraph: () => defaultGraphController.graphInstance.resetGraph(),
    addNode: (nodeId, data, kind) => defaultGraphController.graphInstance.addNode(nodeId, data, kind),
    addEdge: (fromNodeId, toNodeId, weight, edgeType) => defaultGraphController.graphInstance.addEdge(fromNodeId, toNodeId, weight, edgeType),
    removeNode: () => defaultGraphController.graphInstance.removeNode(),
    selectPath: (nodeIds) => { // Update selectedPath in defaultGraphController
        defaultGraphController.selectedPath = nodeIds;
        defaultGraphController.graphInstance.selectPath(nodeIds); // Also call alf.js selectPath for internal logic
    },
    copyMoveToFocus: () => defaultGraphController.graphInstance.copyMoveToFocus(),
    straightenPath: () => defaultGraphController.graphInstance.straightenPath(),
    compressPath: () => defaultGraphController.graphInstance.compressPath(),
    addCompressedPathToGraph: () => defaultGraphController.graphInstance.addCompressedPathToGraph(),
    addCircularRings: (ringSizes) => defaultGraphController.graphInstance.addCircularRings(ringSizes),
    addTriangularGrid: (numRings) => defaultGraphController.graphInstance.addTriangularGrid(numRings),
    selectedPath: [], // add selectedPath to controller to share state - initialized as empty array
    focusArea: [], // add focusArea to controller to share state
    resetFocusArea: () => { defaultGraphController.focusArea = [] }, // Helper to reset focusArea
};


/**
 * Main function to initialize the application.
 * @function main
 * @param {object} [customGraphController] - Optional custom graph controller. If not provided, defaults to using alf.js Graph.
 */
function main(customGraphController) {
    graphController = customGraphController || defaultGraphController; // Use custom or default controller
    setupObservatory();
    setupEventListeners();
    populateScriptSelector();
    updateStepDisplay();

    scriptSelector.value = "designCujLdr";
    loadScript(scriptSelector.value);
}

// Initialize with the default graph controller (alf.js based)
main();

export { exampleLdrProcessor, scripts, Graph, calculateWeight };