import * as L from './ldr.js';
import * as A from './alf.js';

const graphCanvas = document.getElementById('graphCanvas');
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
let currentStepMessage;
let messageHistory;

// Graph Controller - Interface for graph operations
let graphController;

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

function resetDisplay(params) {
    mainSvg.innerHTML = '';
    observatorySvg.innerHTML = '';
    setupObservatory();
}

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

function renderCreateSubGraph(params) {
    const { parentNodeId, subGraphId } = params;
    if (!parentNodeId || !subGraphId) {
        console.warn("renderCreateSubGraph: parentNodeId or subGraphId is undefined or missing in params:", params);
        return;
    }
    console.log("renderCreateSubGraph - Visual cue for subgraph:", parentNodeId, subGraphId);
}

function renderMergeSubGraph(params) {
    const { parentNodeId, subGraphId, mergeStrategy } = params;
    if (!parentNodeId || !subGraphId) {
        console.warn("renderMergeSubGraph: parentNodeId or subGraphId is undefined or missing in params:", params);
        return;
    }
    console.log("renderMergeSubGraph - Visual cue for subgraph merge:", parentNodeId, subGraphId, mergeStrategy);
}


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

function onCanvasClick(nodeId) {
    if (!isConnectingNodes && !nodeId) { // Only clear selection if not connecting nodes and not clicking a node
        graphController.selectPath([]); // Clear selected path in graphController
        mainSvg.querySelectorAll('.node.selected').forEach(node => {
            node.classList.remove('selected'); // Clear visual selection
        });
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

    currentStepMessage = currentStepMessageTextElem;
    messageHistory = messageHistoryGroupElem;
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

function updateStepDisplay() {
    scriptStepDisplay.textContent = `Step: ${currentStepIndex + 1}/${scriptSteps.length > 0 ? scriptSteps.length : '-'}`;
}

function loadScript(scriptName) {
    currentScript = L.scripts[scriptName];
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
            graphController.resetGraph(); // Use graphController
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

function populateScriptSelector() {
    scriptSelector.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Script';
    scriptSelector.appendChild(defaultOption);

    for (const scriptName in L.scripts) {
        if (Object.hasOwnProperty.call(L.scripts, scriptName)) {
            const option = document.createElement('option');
            option.value = scriptName;
            option.textContent = scriptName;
            scriptSelector.appendChild(option);
        }
    }
}

// Default Graph Controller using alf.js Graph
const defaultGraphController = {
    graphInstance: new A.Graph(renderStep), // Internal Graph instance

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
 * @param {object} customGraphController - Optional custom graph controller. If not provided, defaults to using alf.js Graph.
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