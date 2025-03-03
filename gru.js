
/**
 * @file gru.js
 * GRU ((Graph Render Ui)) which can be used to step through, play, or record
 * LDR scripts. Can also just be a playground.
 */

import * as L from './ldr.js';
import * as A from './alf.js';

// --- DOM Element References ---
const graphCanvas = document.getElementById('graphCanvas');
// TODO(clocksmith): This should not be unused.
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
let selectedNodeIdForConnection = null;
let nextNodeId = 0;

const graph = new A.Graph(renderStep);

// --- Rendering Functions ---

function renderStep(stepDefinition) {
    const stepNumber = currentStepIndex + 1;
    const ldrsScript = { [stepNumber]: stepDefinition };
    // L.exampleLdrProcessor(ldrsScript);
    // TODO: Create a mapping ofr commands to functions for a GRU processor and user here.
}


function renderAddNode(params) {
    const { nodeId, data, kind } = params;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', `node ${kind}-node`);
    circle.setAttribute('data-node-id', nodeId);
    circle.setAttribute('r', 6);
    circle.setAttribute('cx', graphCanvas.clientWidth / 2);
    circle.setAttribute('cy', graphCanvas.clientHeight / 2);

    circle.addEventListener('click', () => onNodeClick(nodeId));
    mainSvg.appendChild(circle);
    updateEdgePositions();
}


function renderConnectNodes(params) {
    const { node1, node2, weight, edgeType } = params;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', `edge ${edgeType}-edge`);
    // Use data- attributes for IDs
    line.setAttribute('data-from', node1);
    line.setAttribute('data-to', node2);
    // TODO(clocksmith): Weight can be used for styling/display if needed later.
    mainSvg.appendChild(line);
    updateEdgePositions();
}

function resetDisplay(params) {
    mainSvg.innerHTML = '';
    observatorySvg.innerHTML = '';
    setupObservatory();
}

function renderRemoveNode(params) {
    const { nodeId } = params;
    const nodeElement = mainSvg.querySelector(`[data-node-id="${nodeId}"]`);
    if (nodeElement) {
        mainSvg.removeChild(nodeElement);
    }

    // Remove any connected edges
    const edges = mainSvg.querySelectorAll(`[data-from="${nodeId}"], [data-to="${nodeId}"]`);
    edges.forEach(edge => mainSvg.removeChild(edge));
}

function renderSelectPath(params) {
    const { nodeIds } = params;
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

function renderCopyMoveToFocus(params) {
    const { nodeIds } = params;
    const observatoryRect = observatory.getBoundingClientRect();
    const observatorySvgRect = observatorySvg.getBoundingClientRect();

    nodeIds.forEach((nodeId, index) => {
        const originalNode = mainSvg.querySelector(`.node[data-node-id="${nodeId}"]`);
        if (!originalNode) {
            console.warn(`Node not found for rendering: ${nodeId}`);
            return;
        }
        // Clone the node for the observatory.
        const clonedNode = originalNode.cloneNode(true);
        clonedNode.classList.add('focus-node');
        clonedNode.removeAttribute('data-node-id');
        clonedNode.setAttribute('data-focus-node-id', nodeId);

        // Calculate target position within the observatory.
        const targetX = 20 + (observatoryRect.width - 40) * (index / (nodeIds.length - 1 || 1));
        const targetY = observatoryRect.height / 2;

        // TODO(clocksmith): Animate this?
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
    updateFocusEdgePositions();
}


function renderStraightenPath(params) {
    const { nodeIds } = params;
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

function renderCompressPath(params) {
    const { startNodeId, endNodeId, intermediateNodes } = params;
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


function renderAddCompressedPath(params) {
    const { startNodeId, endNodeId, compressedNodeId, compressedWeight } = params;
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
    updateEdgePositions();
}

function renderAddCircularRings(params) {
    const { ringSizes } = params;
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
    updateEdgePositions();
}


function renderAddTriangularGrid(params) {
    const { numRings } = params;
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
    updateEdgePositions();
}

function renderMessageOnly(params) {
    const { message } = params;
    messageHistoryArray.push(message);
    if (messageHistoryArray.length > 3) messageHistoryArray.shift();
    updateMessageDisplay();
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

    // TODO(clocksmith): Name mismatch?
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
        }, playSpeed * 3);
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
    currentScript = L.scripts[scriptName];
    if (currentScript) {
        scriptSteps = Object.entries(currentScript).sort((a, b) => parseInt(a[0].substring(1)) - parseInt(b[0].substring(1)));
        currentStepIndex = -1;
        graph.resetGraph();
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

function executeStep(step) {
    if (!step) return;
    console.log("executing step...", step);

    const commandName = Object.keys(step)[0];
    const params = step[commandName];

    if (params && params.message) {
        renderMessageOnly({ message: params.message })
    }

    // Call graph methods, not direct rendering
    if (commandName === "reset") {
        graph.resetGraph();
    } else if (commandName === "add_circular_rings") {
        graph.addCircularRings(params.ringSizes);
    } else if (commandName === "add_triangular_grid") {
        graph.addTriangularGrid(params.numRings);
    } else if (commandName === "add_node") {
        graph.addNode(params.nodeId, params.data, params.kind);
    } else if (commandName === "remove_node") {
        graph.removeNode(params.nodeId);
    } else if (commandName === "connect_nodes") {
        graph.addEdge(params.node1, params.node2, params.weight, params.edgeType);
    } else if (commandName === "select_path") {
        graph.selectPath(params.nodeIds);
    } else if (commandName === "copy_move_to_focus") {
        graph.copyMoveToFocus(params.nodeIds);
    } else if (commandName === "straighten_path") {
        graph.straightenPath(params.nodeIds);
    } else if (commandName === "compress_path") {
        graph.compressPath(params);
    } else if (commandName === "add_compressed_path_to_graph") {
        graph.addCompressedPathToGraph(params);
    } else if (commandName === "message_only") {
        renderMessageOnly(params);
    }
}


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
            if (currentStepIndex >= scriptSteps.length - 1) stopPlaying();
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
    // TODO(clocksmith): Needs nodeId.
    removeNodeButton.addEventListener('click', () => { graph.removeNode(); });
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
        if (isPlaying) { stopPlaying(); playScript(); }
        speedLabel.textContent = `Step Speed (${playSpeed}ms)`;
    });
}

function populateScriptSelector() {
    scriptSelector.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Script';
    scriptSelector.appendChild(defaultOption);

    for (const scriptName in []) {
        if (L.scripts.hasOwnProperty(scriptName)) {
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
    populateScriptSelector();
    updateStepDisplay();

    // For testing, auto-load a script if needed:
    scriptSelector.value = "designCujLdr";
    loadScript(scriptSelector.value);
}

main();