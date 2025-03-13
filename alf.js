/**
 * @file alf.js
 * ALF (Algorithmic Logic File) which is used to create a unique graph algorithim
 * that combines deliberation, dynamic programming, shortest paths, human in the loop,
 * and more.
 */

import { exampleLdrProcessor } from './ldr.js';

const WEIGHTS = {
    TIME: 0.4,
    PAIN: 0.3,
    COMPLEXITY: 0.2,
    HUMAN_IN_LOOP: 0.1,
    SUCCESS_PROBABILITY: 0.5,
};

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

class Graph {
    constructor(renderCallback) {
        this.nodes = {};
        this.memo = {};
        this.stepCounter = 1;
        this.renderCallback = renderCallback || this.defaultRenderCallback;
        this.selectedPath = []; // Initialize selectedPath in Graph class
        this.focusArea = []; // Initialize focusArea in Graph class
    }

    defaultRenderCallback = (stepDefinition) => {
        const ldrsScript = { [this.stepCounter++]: stepDefinition };
        exampleLdrProcessor(ldrsScript);
    }

    // --- Functions that use render. --- //

    resetGraph() {
        this.nodes = {};
        this.memo = {};
        this.selectedPath = [];
        this.focusArea = [];
        this.stepCounter = 1;
        this.renderCallback({ "reset": {} });
    }

    addNode(nodeId, data, kind = "task") {
        this.nodes[nodeId] = { data, edges: {}, kind };
        this.renderCallback({ "add_node": { nodeId, data, kind } });
    }

    addEdge(fromNodeId, toNodeId, weight = null, edgeType = "sequence") {
        if (!this.nodes[fromNodeId] || !this.nodes[toNodeId]) return;

        if (weight === null) {
            weight = calculateWeight(this.nodes[toNodeId].data);
        }
        this.nodes[fromNodeId].edges[toNodeId] = { weight, edgeType };
        this.renderCallback({ "connect_nodes": { node1: fromNodeId, node2: toNodeId, weight, edgeType } });
    }

    removeNode() {
        const lastNodeId = Object.keys(this.nodes).pop();
        if (lastNodeId) {
            delete this.nodes[lastNodeId];
            this.renderCallback({ "remove_node": { nodeId: lastNodeId } });
            this.selectedPath = this.selectedPath.filter(id => id !== lastNodeId);
            this.focusArea = this.focusArea.filter(id => id !== lastNodeId);
        }
    }

    selectPath(nodeIds) {
        this.selectedPath = nodeIds.filter(id => this.nodes[id]);
        // this.renderCallback({ "select_path": { nodeIds: this.selectedPath } }); // <-- REMOVED: Prevent recursive render call
    }

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

    straightenPath() {
        if (this.focusArea.length === 0) return;
        this.renderCallback({ "straighten_path": { nodeIds: this.focusArea } });
    }

    compressPath() {
        if (this.focusArea.length < 2) return;
        const startNodeId = this.focusArea[0];
        const endNodeId = this.focusArea[this.focusArea.length - 1];
        this.renderCallback({ "compress_path": { startNodeId, endNodeId, intermediateNodes: this.focusArea.slice(1, -1) } });
    }

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

    addCircularRings(ringSizes) {
        this.renderCallback({ "add_circular_rings": { ringSizes } })
    }

    addTriangularGrid(numRings) {
        this.renderCallback({ "add_triangular_grid": { numRings } })
    }

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

    // --- Functions that don't currently use render. --- //

    getNode(nodeId) {
        return this.nodes[nodeId];
    }

    heuristic(currentNodeId, endNodeId) {
        // TODO:(clocksmith): Simplify, basic distance estimate.
        const currentNodeNumber = parseInt(currentNodeId.match(/\d+/)[0], 10)
        const endNodeNumber = parseInt(endNodeId.match(/\d+/)[0], 10)
        return Math.abs(endNodeNumber - currentNodeNumber);
    }

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

    reconstructPath(cameFrom, current) {
        const totalPath = [current];
        while (current in cameFrom) {
            current = cameFrom[current];
            totalPath.unshift(current);
        }
        return totalPath;
    }

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

    synthesizeDeliberation(personaResponses) {
        console.log("Synthesizing deliberation:", personaResponses);
        // Placeholder: return the first response. Replace with a real synthesis.
        const firstResponse = personaResponses[0]?.response;
        if (!firstResponse || !firstResponse.action) {
            return { action: "proceed" };
        }
        return firstResponse;
    }


    async selectAction(currentNodeId) {
        const currentNode = this.getNode(currentNodeId);
        if (!currentNode) { console.error(`Node not found: ${currentNodeId}`); return null; }

        const shouldDeliberate = this.shouldTriggerDeliberation(node);

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

    shouldTriggerDeliberation(node) {
        if (node.kind === "decision") return true;
        if (node.data.complexity >= 6) return true;
        return false;
    }

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

    addTask(taskData) {
        const taskId = this.generateUniqueTaskId(taskData.title);
        this.addNode(taskId, taskData);
        const solutionId = `${taskId}_manual_human`;
        this.addNode(solutionId, taskData.potential_solutions.manual_human, "solution");
        this.addEdge(taskId, solutionId);
        return taskId;
    }

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

export { Graph, calculateWeight };