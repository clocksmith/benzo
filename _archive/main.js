import * as S from './scripts.js';

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

let nodes = [];
let edges = [];
let nextNodeId = 0;
let nextEdgeId = 0;
let selectedNodeIds = [];
let focusNodes = [];
let focusEdges = [];
let nextFocusNodeId = 0;
let nextFocusEdgeId = 0;
let isConnectingNodes = false;
let darkMode = true;
let currentScript = null;
let scriptSteps = [];
let currentStepIndex = -1;
let isPlaying = false;
let playSpeed = 500;
let playInterval;
let stepDelay = 500;
let messageHistoryArray = [];
let selectedNodeIdForConnection = null;
let currentStepMessage;
let messageHistory;

console.log('loading graph scripts...');

const demoScripts = {
    "ring_demo": {
        "step1": { "reset": null, "message": "Reset graph for path script" },
        "step2": { "add_circular_rings": [8], "message": "Adding initial ring" },
        "step3": { "connect_nodes": { "node1": "node-0", "node2": "node-1" }, "message": "Connect 0 and 1" },
        "step4": { "connect_nodes": { "node1": "node-1", "node2": "node-2" }, "message": "Connect 1 and 2" },
        "step5": { "connect_nodes": { "node1": "node-2", "node2": "node-3" }, "message": "Connect 2 and 3" },
        "step6": { "connect_nodes": { "node1": "node-3", "node2": "node-4" }, "message": "Connect 3 and 4" },
        "step7": { "connect_nodes": { "node1": "node-4", "node2": "node-5" }, "message": "Connect 4 and 5" },
        "step8": { "connect_nodes": { "node1": "node-5", "node2": "node-6" }, "message": "Connect 5 and 6" },
        "step9": { "connect_nodes": { "node1": "node-6", "node2": "node-7" }, "message": "Connect 6 and 7" },
        "step10": { "connect_nodes": { "node1": "node-7", "node2": "node-0" }, "message": "Connect 7 and 0 to close ring" },
        "step11": { "connect_nodes": { "node1": "node-0", "node2": "node-2" }, "message": "Adding diagonals" },
        "step12": { "connect_nodes": { "node1": "node-2", "node2": "node-4" }, "message": " " },
        "step13": { "connect_nodes": { "node1": "node-4", "node2": "node-6" }, "message": " " },
        "step14": { "connect_nodes": { "node1": "node-6", "node2": "node-0" }, "message": " " },
        "step15": { "select_path": ["node-0", "node-1", "node-2", "node-3", "node-4", "node-5", "node-6", "node-7"], "message": "Selecting the ring path" },
        "step16": { "copy_move_to_focus": null, "message": "Copying ring path to observatory" },
        "step17": { "straighten_path": null, "message": "Straightening the ring path in observatory" },
        "step18": { "compress_path": null, "message": "Compressing the straightened path in observatory" },
        "step19": { "add_compressed_path_to_graph": null, "message": "Adding compressed path back to main graph" },
        "step20": { "select_path": ["node-0", "node-2", "node-4", "node-6"], "message": "Selecting diagonal path" },
        "step21": { "copy_move_to_focus": null, "message": "Copying diagonal path to observatory" },
        "step22": { "straighten_path": null, "message": "Straightening diagonal path in observatory" },
        "step23": { "compress_path": null, "message": "Compressing diagonal path in observatory" },
        "step24": { "add_compressed_path_to_graph": null, "message": "Adding diagonal compressed path to graph" },
        "step25": { "select_path": ["node-1", "node-3", "node-5", "node-7"], "message": "Selecting other diagonal path" },
        "step26": { "copy_move_to_focus": null, "message": "Copying other diagonal path to observatory" },
        "step27": { "straighten_path": null, "message": "Straightening other diagonal path in observatory" },
        "step28": { "compress_path": null, "message": "Compressing other diagonal path in observatory" },
        "step29": { "add_compressed_path_to_graph": null, "message": "Adding compressed other diagonal path to graph" },
        "step30": { "message": "Path script complete!" }
    },
    "grid_demo": {
        "step1": { "reset": null, "message": "Reset graph for path2 script" },
        "step2": { "add_triangular_grid": 3, "message": "Adding initial triangular grid" },
        "step3": { "connect_nodes": { "node1": "node-0", "node2": "node-1" }, "message": "Connect 0 and 1" },
        "step4": { "connect_nodes": { "node1": "node-1", "node2": "node-2" }, "message": "Connect 1 and 2" },
        "step5": { "connect_nodes": { "node1": "node-2", "node2": "node-3" }, "message": "Connect 2 and 3" },
        "step6": { "connect_nodes": { "node1": "node-3", "node2": "node-4" }, "message": "Connect 3 and 4" },
        "step7": { "connect_nodes": { "node1": "node-4", "node2": "node-5" }, "message": "Connect 4 and 5" },
        "step8": { "connect_nodes": { "node1": "node-5", "node2": "node-0" }, "message": "Connect 5 and 0" },
        "step9": { "select_path": ["node-0", "node-1", "node-2", "node-3", "node-4", "node-5"], "message": "Selecting the outer ring" },
        "step10": { "copy_move_to_focus": null, "message": "Copying ring to observatory" },
        "step11": { "straighten_path": null, "message": "Straightening the ring in observatory" },
        "step12": { "add_compressed_path_to_graph": null, "message": "Adding straightened path back to main graph" },
        "step13": { "connect_nodes": { "node1": "node-6", "node2": "node-7" }, "message": "Connect 6 and 7" },
        "step14": { "connect_nodes": { "node1": "node-7", "node2": "node-8" }, "message": "Connect 7 and 8" },
        "step15": { "connect_nodes": { "node1": "node-8", "node2": "node-9" }, "message": "Connect 8 and 9" },
        "step16": { "connect_nodes": { "node1": "node-9", "node2": "node-10" }, "message": "Connect 9 and 10" },
        "step17": { "connect_nodes": { "node1": "node-10", "node2": "node-11" }, "message": "Connect 10 and 11" },
        "step18": { "connect_nodes": { "node1": "node-11", "node2": "node-6" }, "message": "Connect 11 and 6" },
        "step19": { "message": "Path2 script complete!" }
    },
}

const scripts = { ...demoScripts, ...S.scripts };

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

function renderGraph() {
    mainSvg.innerHTML = '';
    const mainFragment = document.createDocumentFragment();

    edges.forEach(edge => {
        const node1 = nodes.find(node => node.id === edge.node1Id);
        const node2 = nodes.find(node => node.id === edge.node2Id);
        if (node1 && node2) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'edge');
            line.setAttribute('x1', node1.x);
            line.setAttribute('y1', node1.y);
            line.setAttribute('x2', node2.x);
            line.setAttribute('y2', node2.y);
            line.setAttribute('data-edge-id', edge.id);
            mainFragment.appendChild(line);
        }
    });

    focusEdges.forEach(edge => {
        const node1 = focusNodes.find(node => node.id === edge.node1Id);
        const node2 = focusNodes.find(node => node.id === edge.node2Id);
        if (node1 && node2) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'edge focus-edge');
            line.setAttribute('x1', node1.x);
            line.setAttribute('y1', node1.y);
            line.setAttribute('x2', node2.x);
            line.setAttribute('y2', node2.y);
            line.setAttribute('data-edge-id', edge.id);
            mainFragment.appendChild(line);
        }
    });

    focusNodes.forEach(node => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'node focus-node');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', 8);
        circle.setAttribute('data-focus-node-id', node.id);
        mainFragment.appendChild(circle);
    });

    nodes.forEach(node => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'node');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', 10);
        circle.setAttribute('data-node-id', node.id);
        circle.classList.toggle('selected', selectedNodeIds.includes(node.id));
        circle.addEventListener('click', () => onNodeClick(node.id));
        mainFragment.appendChild(circle);
    });

    mainSvg.appendChild(mainFragment);
}

function createNode(config) {
    const canvasRect = graphCanvas.getBoundingClientRect();
    let calculatedX = config.x || Math.random() * graphCanvas.clientWidth;
    let calculatedY = config.y || Math.random() * (graphCanvas.clientHeight);

    if (typeof calculatedX === 'string' && calculatedX.startsWith('center')) {
        calculatedX = graphCanvas.clientWidth / 2 + parseInt(calculatedX.split('-')[1] || 0, 10);
    } else if (typeof calculatedX === 'string' && calculatedX === 'center') {
        calculatedX = graphCanvas.clientWidth / 2;
    } else {
        calculatedX = parseFloat(calculatedX);
    }

    if (typeof calculatedY === 'string' && calculatedY.startsWith('center')) {
        calculatedY = (graphCanvas.clientHeight) / 2 + parseInt(calculatedY.split('-')[1] || 0, 10);
    } else if (typeof calculatedY === 'string' && calculatedY === 'center') {
        calculatedY = (graphCanvas.clientHeight) / 2;
    } else {
        calculatedY = parseFloat(calculatedY);
    }

    const nodeId = config.id || `node-${nextNodeId++}`;
    const node = { id: nodeId, x: calculatedX, y: calculatedY, label: config.label, type: config.type };
    nodes.push(node);
    renderGraph();
    return nodeId;
}

function removeNode(nodeId) {
    nodes = nodes.filter(node => node.id !== nodeId);
    edges = edges.filter(edge => edge.node1Id !== nodeId && edge.node2Id !== nodeId);
    renderGraph();
}

function createEdge(node1Id, node2Id) {
    if (!node1Id || !node2Id) {
        return;
    }
    if (nodes.findIndex(n => n.id === node1Id) === -1 || nodes.findIndex(n => n.id === node2Id) === -1) {
        return;
    }

    const edge = { id: `edge-${nextEdgeId++}`, node1Id: node1Id, node2Id: node2Id };
    edges.push(edge);
    renderGraph();
}

function removeEdge(edgeId) {
    edges = edges.filter(edge => edge.id !== edgeId);
    renderGraph();
}

function onNodeClick(nodeId) {
    if (isConnectingNodes) {
        if (!selectedNodeIdForConnection) {
            selectedNodeIdForConnection = nodeId;
            highlightNode(nodeId);
        } else if (selectedNodeIdForConnection !== nodeId) {
            createEdge(selectedNodeIdForConnection, nodeId);
            clearNodeHighlight(selectedNodeIdForConnection);
            selectedNodeIdForConnection = null;
            isConnectingNodes = false;
            connectNodesButton.textContent = 'Connect Nodes';
        } else {
            clearNodeHighlight(selectedNodeIdForConnection);
            selectedNodeIdForConnection = null;
        }
    } else {
        if (selectedNodeIds.includes(nodeId)) {
            selectedNodeIds = selectedNodeIds.filter(id => id !== nodeId);
        } else {
            selectedNodeIds.push(nodeId);
        }
        renderGraph();
    }
}

function highlightNode(nodeId) {
    const nodeIndex = nodes.findIndex(node => node.id === nodeId);
    if (nodeIndex !== -1) {
        selectedNodeIds.push(nodeId);
        renderGraph();
    }
}

function clearNodeHighlight(nodeId) {
    selectedNodeIds = selectedNodeIds.filter(id => id !== nodeId);
    renderGraph();
}

function applyRingLayout(ringSizes) {
    nodes = [];
    edges = [];
    nextNodeId = 0;
    nextEdgeId = 0;
    selectedNodeIds = [];
    resetFocusArea();
    const centerX = graphCanvas.clientWidth / 2;
    const centerY = (graphCanvas.clientHeight) / 2;
    let currentRadius = 40;
    const minNodeSpacing = 40;
    let previousRingNodes = 0;
    const initialRingRadiusIncrement = Math.min(centerX, centerY) * 0.15;
    let createdNodeIds = [];

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
            createdNodeIds.push(createNode({ x: x, y: y }));
        }
        previousRingNodes = numNodes;
    });
    renderGraph();
    return createdNodeIds;
}

function applyTriangularGridLayout(numRings) {
    nodes = [];
    edges = [];
    nextNodeId = 0;
    nextEdgeId = 0;
    selectedNodeIds = [];
    resetFocusArea();
    const centerX = graphCanvas.clientWidth / 2;
    const centerY = (graphCanvas.clientHeight) / 2;
    const nodeSpacing = Math.min(centerX, centerY) * 0.2;
    let createdNodeIds = [];

    for (let ring = 0; ring < numRings; ring++) {
        let nodesInRing = ring === 0 ? 1 : 6 * ring;
        for (let i = 0; i < nodesInRing; i++) {
            let angle = (2 * Math.PI / nodesInRing) * i - (ring % 2 === 0 ? 0 : Math.PI / 6);
            let x = centerX + nodeSpacing * ring * Math.cos(angle);
            let y = centerY + nodeSpacing * ring * Math.sin(angle);
            createdNodeIds.push(createNode({ x: x, y: y }));
        }
    }
    renderGraph();
    return createdNodeIds;
}

function resetGraph() {
    nodes = [];
    edges = [];
    nextNodeId = 0;
    nextEdgeId = 0;
    selectedNodeIds = [];
    resetFocusArea();
    renderGraph();
}

function resetFocusArea() {
    focusNodes = [];
    focusEdges = [];
    nextFocusNodeId = 0;
    nextFocusEdgeId = 0;
}

function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('light-mode', !darkMode);
    darkModeToggleContainer.classList.toggle('is-dark-mode', darkMode);
}

function loadScript(scriptName) {
    currentScript = scripts[scriptName];
    if (currentScript) {
        scriptSteps = Object.entries(currentScript).sort((a, b) => parseInt(a[0].substring(4)) - parseInt(b[0].substring(4)));
        currentStepIndex = -1;
        resetGraph();
        stopPlaying();
        stepForward();
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

    if (step.reset !== undefined && step.reset === null) {
        resetGraph();
    }
    if (step.add_circular_rings) {
        applyRingLayout(step.add_circular_rings);
    }
    if (step.add_triangular_grid) {
        applyTriangularGridLayout(step.add_triangular_grid);
    }
    if (step.add_node) {
        createNode(step.add_node);
    }
    if (step.remove_node !== undefined && step.remove_node === null) {
        if (nodes.length > 0) {
            removeNode(nodes[nodes.length - 1].id);
        }
    }
    if (step.connect_nodes) {
        const node1Id = step.connect_nodes.node1;
        const node2Id = step.connect_nodes.node2;
        createEdge(node1Id, node2Id);
    }
    if (step.select_path) {
        selectPath(step.select_path);
    }
    if (step.copy_move_to_focus) {
        moveCopiedPathToObs();
    }
    if (step.straighten_path) {
        alignObservatoryPaths();
    }
    if (step.compress_path) {
        compressPathInFocus();
    }
    if (step.add_compressed_path_to_graph) {
        addCompressedPathToGraph();
    }

    renderGraph();
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
        resetGraph();
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
            resetGraph();
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

function updateStepDisplay() {
    scriptStepDisplay.textContent = `Step: ${currentStepIndex + 1}/${scriptSteps.length > 0 ? scriptSteps.length : '-'}`;
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

function selectPath(pathIds) {
    console.log("selectPath called with:", pathIds);
    selectedNodeIds = [];
    pathIds.forEach(id => {
        const node = nodes.find(n => n.id === `node-${id}`);
        if (node) {
            selectedNodeIds.push(node.id);
        }
    });
    console.log("selectedNodeIds:", selectedNodeIds);
    renderGraph();
}

function moveCopiedPathToObs() {
    console.log("moveCopiedPathToObs called");
    resetFocusArea();

    const graphCanvasRect = graphCanvas.getBoundingClientRect();
    const observatoryRect = observatory.getBoundingClientRect();
    console.log("graphCanvasRect:", graphCanvasRect);
    console.log("observatoryRect:", observatoryRect);

    // Deep copy nodes
    focusNodes = selectedNodeIds.map((nodeId, index) => {
        const originalNode = nodes.find(n => n.id === nodeId);
        if (originalNode) {
            return {
                ...originalNode,
                id: `focus-${index}`,
                x: originalNode.x,
                y: originalNode.y
            };
        }
        console.warn(`(nodeId, index): ${[nodeId, index]} not found in ${nodes}`);
        return null; // Handle missing nodes
    }).filter(node => node); // Remove nulls

    console.log("focusNodes after copying:", focusNodes);

    // 2. Copy Edges: Create focusEdges based on focusNodes.  *Only* copy edges that
    //    connect nodes that are *both* within the selected set.
    focusEdges = []; // Reset focusEdges
    edges.forEach(edge => {
        //check that both nodes for the edge have been copied to focusNodes
        if (selectedNodeIds.includes(edge.node1Id) && selectedNodeIds.includes(edge.node2Id)) {
            // Find the *new* IDs of the focus nodes corresponding to the original nodes
            const focusNode1 = focusNodes.find(n => n.id.startsWith('focus-') && nodes.find(o => o.id === edge.node1Id).id.split('-')[1] === n.id.split('-')[1]);
            const focusNode2 = focusNodes.find(n => n.id.startsWith('focus-') && nodes.find(o => o.id === edge.node2Id).id.split('-')[1] === n.id.split('-')[1]);

            if (focusNode1 && focusNode2) { //both ends of edge in focusNodes
                focusEdges.push({
                    id: `focus-edge-${nextFocusEdgeId++}`,
                    node1Id: focusNode1.id,
                    node2Id: focusNode2.id
                });
            }
        }
    });
    console.log("focusEdges after copying:", focusEdges);

    // 3. Animate the transition of each focusNode.
    focusNodes.forEach((node, index) => {
        // Calculate *target* position within the observatory.
        const targetX = observatoryRect.left + 20 - graphCanvasRect.left + (observatoryRect.width - 40) * (index / (focusNodes.length - 1 || 1));
        const targetY = observatoryRect.top + observatoryRect.height / 2 - graphCanvasRect.top;
        console.log(`targetX: ${targetX}, targetY: ${targetY}`);


        let startX = node.x;  // Starting X
        let startY = node.y;  // Starting Y
        let animationStartTime = null; // Use a separate start time for each.

        function animate(currentTime) {
            if (!animationStartTime) animationStartTime = currentTime;
            const elapsedTime = currentTime - animationStartTime;
            const progress = Math.min(1, elapsedTime / 500); // 500ms animation

            // Interpolate x and y positions
            node.x = startX + (targetX - startX) * progress;
            node.y = startY + (targetY - startY) * progress;

            // console.log(`Animating node ${node.id}, x: ${node.x}, y: ${node.y}, progress: ${progress}`);
            renderGraph(); // Re-render on *every* frame.

            if (progress < 1) {
                requestAnimationFrame(animate);  // Continue animation.
            } else {
                // Ensure it ends exactly at the target position.
                node.x = targetX;
                node.y = targetY;
                renderGraph();
                console.log(`Animation complete for node ${node.id}`);
            }
        }

        requestAnimationFrame(animate); // Kick off the animation.
    });
}


function alignObservatoryPaths() {
    console.log("alignObservatoryPaths called");
    if (focusNodes.length === 0) {
        console.log("No focus nodes to align.");
        return;
    }

    const graphCanvasRect = graphCanvas.getBoundingClientRect();
    const observatoryRect = observatory.getBoundingClientRect();

    const startX = observatoryRect.left + 20 - graphCanvasRect.left;
    const endX = observatoryRect.right - 20 - graphCanvasRect.left;
    const yPos = observatoryRect.top + observatoryRect.height / 2 - graphCanvasRect.top;
    console.log(`startX: ${startX}, endX: ${endX}, yPos: ${yPos}`);

    focusNodes.forEach((node, index) => {
        console.log(`Aligning focus node ${node.id}, index: ${index}`);
        // Animate the transition
        let startX = node.x;
        let startY = node.y;
        let targetX = startX + (endX - startX) * (index / (focusNodes.length - 1 || 1));
        let targetY = yPos;

        let animationStartTime = null;

        function animate(currentTime) {
            if (!animationStartTime) animationStartTime = currentTime;
            const elapsedTime = currentTime - animationStartTime;
            const progress = Math.min(1, elapsedTime / 500); // 500ms animation

            node.x = startX + (targetX - startX) * progress;
            node.y = startY + (targetY - startY) * progress;
            console.log(`Animating node ${node.id}, x: ${node.x}, y:${node.y}`);

            renderGraph();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Ensure final position.
                node.x = targetX;
                node.y = targetY;
                renderGraph();
                console.log(`Alignment complete for ${node.id}`);
            }
        }
        requestAnimationFrame(animate);
    });
}


function straightenPathInFocus() {
    alignObservatoryPaths(); // Renamed function call
}

function compressPathInFocus() {
    if (focusNodes.length > 2) {
        const firstNode = focusNodes[0];
        const lastNode = focusNodes[focusNodes.length - 1];
        resetFocusArea();
        focusNodes = [firstNode, lastNode];
        focusEdges = [{ id: `${nextFocusEdgeId++}`, node1Id: focusNodes[0].id, node2Id: focusNodes[1].id }];
        alignObservatoryPaths();
        renderGraph();
    }
}

function addCompressedPathToGraph() {
    if (focusNodes.length === 2) {
        const startFocusNode = focusNodes[0];
        const endFocusNode = focusNodes[1];

        const startGraphNode = createNode({ x: startFocusNode.x + controls.getBoundingClientRect().width, y: startFocusNode.y + observatory.getBoundingClientRect().height, label: startFocusNode.label + " Start", type: startFocusNode.type + "Start" });
        const endGraphNode = createNode({ x: endFocusNode.x + controls.getBoundingClientRect().width, y: endFocusNode.y + observatory.getBoundingClientRect().height, label: endFocusNode.label + " End", type: endFocusNode.type + "End" });
        createEdge(startGraphNode, endGraphNode);
        resetFocusArea();
        renderGraph();
    }
}

function populateScriptSelector() {
    scriptSelector.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Script';
    scriptSelector.appendChild(defaultOption);

    for (const scriptName in scripts) {
        if (scripts.hasOwnProperty(scriptName)) {
            const option = document.createElement('option');
            option.value = scriptName;
            option.textContent = scriptName;
            scriptSelector.appendChild(option);
        }
    }
}

darkModeToggleContainer.addEventListener('click', toggleDarkMode);
resetButton.addEventListener('click', () => { resetGraph(); });
addNodeButton.addEventListener('click', () => { createNode({}); });
removeNodeButton.addEventListener('click', () => { if (nodes.length > 0) removeNode(nodes[nodes.length - 1].id); });
connectNodesButton.addEventListener('click', () => {
    isConnectingNodes = !isConnectingNodes;
    connectNodesButton.textContent = isConnectingNodes ? 'Connecting...' : 'Connect Nodes';
    if (!isConnectingNodes) {
        selectedNodeIdForConnection = null;
        clearNodeHighlight(selectedNodeIdForConnection);
    }
});
addRingsButton.addEventListener('click', () => {
    try {
        const ringSizes = JSON.parse(ringNodesInput.value);
        if (Array.isArray(ringSizes) && ringSizes.every(Number.isInteger) && ringSizes.every(size => size > 0)) {
            applyRingLayout(ringSizes);
        }
    } catch (e) {
        console.error("Error adding ring", e);
    }
});
addTriGridButton.addEventListener('click', () => {
    const numRings = parseInt(triGridRingsInput.value, 10);
    if (Number.isInteger(numRings) && numRings > 0) {
        applyTriangularGridLayout(numRings);
    }
});
scriptSelector.addEventListener('change', (event) => { loadScript(event.target.value); });
stepForwardButton.addEventListener('click', () => { stepForward(); });
stepBackwardButton.addEventListener('click', () => { stepBackward(); });
playPauseButton.addEventListener('click', () => { togglePlayPause(); });
speedSlider.addEventListener('input', (event) => {
    playSpeed = parseInt(event.target.value, 10);
    stepDelay = playSpeed;
    if (isPlaying) { stopPlaying(); playScript(); }
    speedLabel.textContent = `Step Speed (${playSpeed}ms)`;
});

//\\//\\// main //\\//\\//

function main() {
    populateScriptSelector();
    setupObservatory();
    renderGraph();
    darkMode = true;
    updateStepDisplay();
    scriptSelector.value = "ring_demo";
    loadScript(scriptSelector.value);
}

main();
