// render.js (Rendering and UI Logic)

import { Graph, calculateWeight } from './alf.js';
import * as S from './scripts.js'; // Assuming scripts.js is accessible

// --- DOM Element References ---
const graphCanvas = document.getElementById('graphCanvas');
const controls = document.getElementById('controls');
const darkModeToggleContainer = document.getElementById('darkModeToggleContainer');
const resetButton = document.getElementById('resetButton');
const addNodeButton = document.getElementById('addNodeButton');
const removeNodeButton = document.getElementById('removeNodeButton');
const connectNodesButton = document.getElementById('connectNodesButton');
const ringNodesInput = document.getElementById('ringNodesInput');
const addRingsButton = document.getElementById('addRingsButton');
const triGridRingsInput = document.getElementById('triGridRingsInput');
const addTriGridButton = document.getElementById('addTriGridButton');
const observatory = document.getElementById('observatory');
const scriptSelector = document.getElementById('scriptSelector');
const stepBackwardButton = document.getElementById('stepBackwardButton');
const playPauseButton = document.getElementById('playPauseButton');
const stepForwardButton = document.getElementById('stepForwardButton');
const speedSlider = document.getElementById('speedSlider');
const speedLabel = document.getElementById('speedLabel');
const scriptStepDisplay = document.getElementById('scriptStepDisplay');
const observatorySvg = document.getElementById('observatorySvg');
const mainSvg = document.getElementById('mainSvg');

// --- State Variables ---
let isConnectingNodes = false;
let darkMode = true;
let currentScript = null;
let scriptSteps = [];
let currentStepIndex = -1;
let isPlaying = false;
let playSpeed = 500;
let playInterval;
let messageHistoryArray = [];
let selectedNodeIdForConnection = null; //for connecting nodes, remember first

// --- Graph Instance ---
const graph = new Graph(renderCommand); // Create graph, pass render callback

// --- Rendering Functions ---

function renderCommand(command) {
    console.log("RENDER:", command); // Keep this for debugging

    switch (command.action) {
        case "add_node":
            renderAddNode(command.nodeId, command.data, command.type);
            break;
        case "connect_nodes":
            renderConnectNodes(command.node1, command.node2, command.weight, command.edgeType);
            break;
        case "reset":
            resetDisplay();
            break;
        case "remove_node":
            renderRemoveNode(command.nodeId);
            break;
        case "select_path":
            renderSelectPath(command.nodeIds);
            break;
        case "copy_move_to_focus":
            renderCopyMoveToFocus(command.nodeIds);
            break;
        case "straighten_path":
            renderStraightenPath(command.nodeIds);
            break;
        case "compress_path":
            renderCompressPath(command.startNodeId, command.endNodeId, command.intermediateNodes);
            break;
        case "add_compressed_path_to_graph":
            renderAddCompressedPath(command.startNodeId, command.endNodeId, command.compressedNodeId, command.compressedWeight);
            break;
        case "add_circular_rings":
            renderAddCircularRings(command.ringSizes);
            break;
        case "add_triangular_grid":
            renderAddTriangularGrid(command.numRings)
            break;
        case "create_subgraph":
            console.log("create subgraph")
            //renderCreateSubGraph(command.parentNodeId, command.subGraphId); //TODO: For advanced vis
            break;
        case "merge_subgraph":
            console.log("merge sub graph")
            //renderMergeSubGraph(command.parentNodeId, command.subGraphId, command.mergeStrategy); //TODO: For advanced vis
            break;
        default:
            console.warn("Unknown render action:", command.action);
    }
}

function renderAddNode(nodeId, data, type) {
    // Create a new SVG circle element for the node.
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', `node ${type}-node`); // Use type for class
    circle.setAttribute('data-node-id', nodeId);
    circle.setAttribute('r', 10); // Default radius

    // Set initial position (can be improved)
    circle.setAttribute('cx', graphCanvas.clientWidth / 2);
    circle.setAttribute('cy', graphCanvas.clientHeight / 2);

    circle.addEventListener('click', () => onNodeClick(nodeId));
    mainSvg.appendChild(circle);
}


function renderConnectNodes(node1Id, node2Id, weight, edgeType) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', `edge ${edgeType}-edge`);
    line.setAttribute('data-from', node1Id); // Use data- attributes for IDs
    line.setAttribute('data-to', node2Id);
    // Weight can be used for styling/display if needed later.
    mainSvg.appendChild(line);
    updateEdgePositions(); // Call this to position based on current nodes
}

function resetDisplay() {
    mainSvg.innerHTML = ''; // Clear SVG
    observatorySvg.innerHTML = '';
    setupObservatory(); // Re-add message elements
}

function renderRemoveNode(nodeId) {
    const nodeElement = mainSvg.querySelector(`[data-node-id="${nodeId}"]`);
    if (nodeElement) {
        mainSvg.removeChild(nodeElement);
    }

    // Remove any connected edges
    const edges = mainSvg.querySelectorAll(`[data-from="${nodeId}"], [data-to="${nodeId}"]`);
    edges.forEach(edge => mainSvg.removeChild(edge));
}

function renderSelectPath(nodeIds) {
    // First, clear any existing selection by removing the "selected" class
    mainSvg.querySelectorAll('.node.selected').forEach(node => {
        node.classList.remove('selected');
    });

    // Then, add the "selected" class to the newly selected nodes.
    nodeIds.forEach(nodeId => {
        const nodeElement = mainSvg.querySelector(`.node[data-node-id="${nodeId}"]`);
        if (nodeElement) {
            nodeElement.classList.add('selected');
        }
    });
}

function renderCopyMoveToFocus(nodeIds) {
    const graphCanvasRect = graphCanvas.getBoundingClientRect();
    const observatoryRect = observatory.getBoundingClientRect();

    nodeIds.forEach((nodeId, index) => {
        const originalNode = mainSvg.querySelector(`.node[data-node-id="${nodeId}"]`);
        if (!originalNode) {
            console.warn(`Node not found for rendering: ${nodeId}`);
            return;
        }
        // Clone the node for the observatory
        const clonedNode = originalNode.cloneNode(true);
        clonedNode.classList.add('focus-node'); // Mark as in focus area
        clonedNode.removeAttribute('data-node-id');  // Remove original ID
        clonedNode.setAttribute('data-focus-node-id', nodeId); // Use original ID.

        // Calculate target position within the observatory
        const targetX = 20 + (observatoryRect.width - 40) * (index / (nodeIds.length - 1 || 1));
        const targetY = observatoryRect.height / 2;

        //Set position of cloned node, no animation needed.
        clonedNode.setAttribute('cx', targetX);
        clonedNode.setAttribute('cy', targetY);

        observatorySvg.appendChild(clonedNode);
    });

    // Now, copy the edges that connect these focus nodes
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
}


function renderStraightenPath(nodeIds) {
    const observatoryRect = observatory.getBoundingClientRect();
    const startX = 20;
    const endX = observatoryRect.width - 20;
    const yPos = observatoryRect.height / 2;

    nodeIds.forEach((nodeId, index) => {
        const nodeElement = observatorySvg.querySelector(`[data-focus-node-id="${nodeId}"]`);
        if (nodeElement) {
            // Calculate the target X position for each node.
            const targetX = startX + (endX - startX) * (index / (nodeIds.length - 1 || 1));
            nodeElement.setAttribute('cx', targetX);
            nodeElement.setAttribute('cy', yPos);
        }
    });
    updateFocusEdgePositions();
}

function renderCompressPath(startNodeId, endNodeId, intermediateNodes) {
    // Remove intermediate nodes
    intermediateNodes.forEach(nodeId => {
        const nodeElement = observatorySvg.querySelector(`[data-focus-node-id="${nodeId}"]`);
        if (nodeElement) {
            observatorySvg.removeChild(nodeElement);
        }
    });
    // Remove all focus-edges
    observatorySvg.querySelectorAll('.focus-edge').forEach(edge => observatorySvg.removeChild(edge));

}


function renderAddCompressedPath(startNodeId, endNodeId, compressedNodeId, compressedWeight) {
    // This function adds the compressed path (a single edge) back to the main graph.
    // We get the positions from the *original* nodes in the main graph.

    const startNode = mainSvg.querySelector(`.node[data-node-id="${startNodeId}"]`);
    const endNode = mainSvg.querySelector(`.node[data-node-id="${endNodeId}"]`);

    if (!startNode || !endNode) {
        console.warn(`Could not find start/end nodes in main graph: ${startNodeId}, ${endNodeId}`);
        return;
    }

    // Use getBoundingClientRect to get *current* positions, even after animation.
    const startRect = startNode.getBoundingClientRect();
    const endRect = endNode.getBoundingClientRect();
    const graphRect = graphCanvas.getBoundingClientRect();

    const startX = startRect.left + startRect.width / 2 - graphRect.left;
    const startY = startRect.top + startRect.height / 2 - graphRect.top;
    const endX = endRect.left + endRect.width / 2 - graphRect.left;
    const endY = endRect.top + endRect.height / 2 - graphRect.top;

    // Create the new compressed edge
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'edge compressed-edge'); // Add a class
    line.setAttribute('x1', startX);
    line.setAttribute('y1', startY);
    line.setAttribute('x2', endX);
    line.setAttribute('y2', endY);
    line.setAttribute('data-from', startNodeId); // Still use original IDs
    line.setAttribute('data-to', endNodeId);   // Still use original IDs
    mainSvg.appendChild(line);
}

function renderAddCircularRings(ringSizes) {
    const centerX = graphCanvas.clientWidth / 2;
    const centerY = graphCanvas.clientHeight / 2;
    let currentRadius = 40;
    const minNodeSpacing = 40;
    let previousRingNodes = 0;
    const initialRingRadiusIncrement = Math.min(centerX, centerY) * 0.15;

    ringSizes.forEach((numNodes, index) => {
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
            // Create nodes using graph, so unique IDs are created and tracked
            graph.addNode(`node-${nextNodeId++}`, { x: x, y: y }, "ring");
        }
        previousRingNodes = numNodes;
    });
}


function renderAddTriangularGrid(numRings) {
    const centerX = graphCanvas.clientWidth / 2;
    const centerY = graphCanvas.clientHeight / 2;
    const nodeSpacing = Math.min(centerX, centerY) * 0.2;

    for (let ring = 0; ring < numRings; ring++) {
        let nodesInRing = ring === 0 ? 1 : 6 * ring;
        for (let i = 0; i < nodesInRing; i++) {
            let angle = (2 * Math.PI / nodesInRing) * i - (ring % 2 === 0 ? 0 : Math.PI / 6);
            let x = centerX + nodeSpacing * ring * Math.cos(angle);
            let y = centerY + nodeSpacing * ring * Math.sin(angle);
            graph.addNode(`node-${nextNodeId++}`, { x: x, y: y }, 'trigrid');
        }
    }
}

// --- Helper functions to update positions ---

function updateEdgePositions() {
    const edges = mainSvg.querySelectorAll('.edge');
    edges.forEach(edge => {
        const fromNodeId = edge.getAttribute('data-from');
        const toNodeId = edge.getAttribute('data-to');
        const fromNode = mainSvg.querySelector(`[data-node-id="${fromNodeId}"]`);
        const toNode = mainSvg.querySelector(`[data-node-id="${toNodeId}"]`);

        if (fromNode && toNode) {
            edge.setAttribute('x1', fromNode.getAttribute('cx'));
            edge.setAttribute('y1', fromNode.getAttribute('cy'));
            edge.setAttribute('x2', toNode.getAttribute('cx'));
            edge.setAttribute('y2', toNode.getAttribute('cy'));
        }
    });
}
//For edges in the focus area/observatory
function updateFocusEdgePositions() {
    const edges = observatorySvg.querySelectorAll('.focus-edge');
    edges.forEach(edge => {
        const fromNodeId = edge.getAttribute('data-focus-from');
        const toNodeId = edge.getAttribute('data-focus-to');
        const fromNode = observatorySvg.querySelector(`[data-focus-node-id="${fromNodeId}"]`);
        const toNode = observatorySvg.querySelector(`[data-focus-node-id="${toNodeId}"]`);

        if (fromNode && toNode) {
            edge.setAttribute('x1', fromNode.getAttribute('cx'));
            edge.setAttribute('y1', fromNode.getAttribute('cy'));
            edge.setAttribute('x2', toNode.getAttribute('cx'));
            edge.setAttribute('y2', toNode.getAttribute('cy'));
        }
    });
}

// --- Event Handlers ---

function onNodeClick(nodeId) {
    if (isConnectingNodes) {
        if (!selectedNodeIdForConnection) {
            selectedNodeIdForConnection = nodeId;
            //highlightNode(nodeId); // Alf.js doesn't have direct access
            // Instead of calling a highlightNode, we add .selected
            mainSvg.querySelector(`.node[data-node-id="${nodeId}"]`).classList.add('selected');
        } else if (selectedNodeIdForConnection !== nodeId) {
            // Call graph.addEdge, *not* createEdge directly
            graph.addEdge(selectedNodeIdForConnection, nodeId);
            //clearNodeHighlight(selectedNodeIdForConnection);
            mainSvg.querySelector(`.node[data-node-id="${selectedNodeIdForConnection}"]`).classList.remove('selected');
            selectedNodeIdForConnection = null;
            isConnectingNodes = false;
            connectNodesButton.textContent = 'Connect Nodes';
        } else {
            //clearNodeHighlight(selectedNodeIdForConnection);
            mainSvg.querySelector(`.node[data-node-id="${selectedNodeIdForConnection}"]`).classList.remove('selected');
            selectedNodeIdForConnection = null;
        }
    } else {
        // Toggle selection (handled in renderSelectPath)
        graph.selectPath(
            [...document.querySelectorAll('.node.selected')].map(n => n.dataset.nodeId) // Get current
                .filter(id => id !== nodeId) // Remove if already there
                .concat(selectedNodeIdForConnection === nodeId ? [] : [nodeId]) // Add if not
        );
        selectedNodeIdForConnection = null; // Always reset
    }
}


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

    currentStepMessage = document.getElementById('currentStepMessage');
    messageHistory = document.getElementById('messageHistory');
}

function updateMessageDisplay() {
    if (currentStepMessage) {
        currentStepMessage.textContent = scriptSteps[currentStepIndex]?.[1]?.message || "";
        currentStepMessage.classList.add('visible');
        setTimeout(() => {
            if (currentStepMessage) {
                currentStepMessage.classList.remove('visible');
            }
        }, stepDelay * 3);
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
    }
}

function updateStepDisplay() {
    scriptStepDisplay.textContent = `Step: ${currentStepIndex + 1}/${scriptSteps.length > 0 ? scriptSteps.length : '-'}`;
}

function loadScript(scriptName) {
    currentScript = S.scripts[scriptName];
    if (currentScript) {
        scriptSteps = Object.entries(currentScript).sort((a, b) => parseInt(a[0].substring(4)) - parseInt(b[0].substring(4)));
        currentStepIndex = -1;
        graph.resetGraph(); // Reset graph
        stopPlaying();
        stepForward(); // Show first step immediately
        updateStepDisplay();
    } else {
        scriptSteps = [];
        currentStepIndex = -1;
        updateStepDisplay();
    }
}

function executeStep(step) {
    if (!step) return;
    console.log("executing step...", step);

    if (step.message) {
        messageHistoryArray.push(step.message);
        if (messageHistoryArray.length > 3) messageHistoryArray.shift();
        updateMessageDisplay();
    }

    // Call graph methods, not direct rendering
    if (step.reset !== undefined && step.reset === null) {
        graph.resetGraph();
    }
    if (step.add_circular_rings) {
        graph.addCircularRings(step.add_circular_rings)
    }
    if (step.add_triangular_grid) {
        graph.addTriangularGrid(step.add_triangular_grid);
    }
    if (step.add_node) {
        // Pass the node config to addNode
        graph.addNode(step.add_node.id, step.add_node);
    }
    if (step.remove_node !== undefined && step.remove_node === null) {
        graph.removeNode();
    }
    if (step.connect_nodes) {
        graph.addEdge(step.connect_nodes.node1, step.connect_nodes.node2);
    }

    if (step.select_path) {
        graph.selectPath(step.select_path);
    }
    if (step.copy_move_to_focus !== undefined && step.copy_move_to_focus === null) {
        graph.copyMoveToFocus();
    }
    if (step.straighten_path !== undefined && step.straighten_path === null) {
        graph.straightenPath();
    }
    if (step.compress_path !== undefined && step.compress_path === null) {
        graph.compressPath();
    }
    if (step.add_compressed_path_to_graph !== undefined && step.add_compressed_path_to_graph === null) {
        graph.addCompressedPathToGraph();
    }

}

function stepForward() {
    stopPlaying(); // Stop any current playback
    if (currentStepIndex < scriptSteps.length - 1) {
        currentStepIndex++;
        executeStep(scriptSteps[currentStepIndex][1]); // Execute the step
        updateStepDisplay(); // Update display
    } else {
        stopPlaying();
        isPlaying = false;
        playPauseButton.textContent = 'Play';
    }
}

function stepBackward() {
    stopPlaying();
    if (currentStepIndex > 0) {
        currentStepIndex--;
        executeStep(scriptSteps[currentStepIndex][1]);
        updateStepDisplay();
    } else if (currentStepIndex === 0) { //Special case for first step
        currentStepIndex--;
        resetDisplay(); // Clear and redraw the observatory
        updateStepDisplay();
    }
}
function playScript() {
    if (isPlaying) {
        stopPlaying();
    } else {
        isPlaying = true;
        playPauseButton.textContent = 'Pause';
        if (currentStepIndex >= scriptSteps.length - 1) {
            currentStepIndex = -1;
            graph.resetGraph();
            updateStepDisplay();
        }
        playInterval = setInterval(() => {
            stepForward();
            if (currentStepIndex >= scriptSteps.length - 1) stopPlaying(); // Stop at the end
        }, playSpeed);
    }
}

function stopPlaying() {
    isPlaying = false;
    playPauseButton.textContent = 'Play';
    clearInterval(playInterval);
}

function togglePlayPause() {
    if (isPlaying) {
        stopPlaying();
    } else {
        playScript();
    }
}

function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('light-mode', !darkMode);
    darkModeToggleContainer.classList.toggle('is-dark-mode', darkMode);
}


// Event Listeners
function setupEventListeners() {
    darkModeToggleContainer.addEventListener('click', toggleDarkMode);
    resetButton.addEventListener('click', () => { graph.resetGraph(); });
    addNodeButton.addEventListener('click', () => { graph.addNode(`node-${nextNodeId++}`, { x: 100, y: 100 }); }); // Basic add
    removeNodeButton.addEventListener('click', () => { graph.removeNode(); }); //Needs node id
    connectNodesButton.addEventListener('click', () => {
        isConnectingNodes = !isConnectingNodes; // Toggle state
        connectNodesButton.textContent = isConnectingNodes ? 'Connecting...' : 'Connect Nodes';
        if (!isConnectingNodes) {
            selectedNodeIdForConnection = null;
        }
    });
    addRingsButton.addEventListener('click', () => {
        try {
            const ringSizes = JSON.parse(ringNodesInput.value);
            if (Array.isArray(ringSizes) && ringSizes.every(Number.isInteger) && ringSizes.every(size => size > 0)) {
                graph.addCircularRings(ringSizes);
            }
        } catch (e) {
            console.error("Error adding ring", e);
        }
    });
    addTriGridButton.addEventListener('click', () => {
        const numRings = parseInt(triGridRingsInput.value, 10);
        if (Number.isInteger(numRings) && numRings > 0) {
            graph.addTriangularGrid(numRings);
        }
    });

    scriptSelector.addEventListener('change', (event) => { loadScript(event.target.value); });
    stepForwardButton.addEventListener('click', () => { stepForward(); });
    stepBackwardButton.addEventListener('click', () => { stepBackward(); });
    playPauseButton.addEventListener('click', () => { togglePlayPause(); });
    speedSlider.addEventListener('input', (event) => {
        playSpeed = parseInt(event.target.value, 10);
        stepDelay = playSpeed; // Update message delay too
        if (isPlaying) { stopPlaying(); playScript(); } // Restart if playing
        speedLabel.textContent = `Step Speed (${playSpeed}ms)`;
    });

    // --- Observatory Resizing (Advanced - Optional) ---
    // This is complex to implement correctly, and you'd likely want to use a library like
    // interact.js for robust drag-resizing. This is a *very* basic placeholder.
    // const resizeHandle = document.createElement('div');
    // resizeHandle.id = 'resizeHandle';
    // observatory.appendChild(resizeHandle);

    // let isResizing = false;
    // resizeHandle.addEventListener('mousedown', (e) => {
    //     isResizing = true;
    //     e.preventDefault(); // Prevent text selection
    // });
    // document.addEventListener('mousemove', (e) => { // Use document, not observatory
    //   if (!isResizing) return;
    //   const newHeight = e.clientY - observatory.offsetTop;
    //   observatory.style.height = `${newHeight}px`;
    //   renderGraph();
    // });

    // document.addEventListener('mouseup', () => {
    //     isResizing = false;
    // });
    // --- End Optional Resizing ---
}

// --- Initialization ---

function populateScriptSelector() {
    scriptSelector.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Script';
    scriptSelector.appendChild(defaultOption);

    for (const scriptName in S.scripts) {
        if (S.scripts.hasOwnProperty(scriptName)) {
            const option = document.createElement('option');
            option.value = scriptName;
            option.textContent = scriptName;
            scriptSelector.appendChild(option);
        }
    }
}


function main() {
    setupObservatory();
    setupEventListeners();
    populateScriptSelector(); // Populate scripts from imported scripts.js
    updateStepDisplay();
    //For testing, auto choose demo_design_tasks_script_0
    // scriptSelector.value = "ring_demo";
    // loadScript(scriptSelector.value);

    renderGraph(); // Initial render
}


main();