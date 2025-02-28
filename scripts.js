export const scripts = {
    "design_42": {
        "step1": {
            "reset": null,
            "message": "Initialize graph and prepare for visualization."
        },
        "step2": {
            "add_node": {
                "id": "start",
                "type": "start",
                "data": { "title": "Start Project" }
            },
            "message": "Add start node for the design project."
        },
        "step3": {
            "add_node": {
                "id": "end",
                "type": "end",
                "data": { "title": "End Project" }
            },
            "message": "Add end node for the design project."
        },
        "step4": {
            "add_node": {
                "id": "task_identify_font",
                "type": "task",
                "data": {
                    "title": "Identify Font from Image",
                    "description": "Identify a font in a screenshot.",
                    "potential_solutions": {
                        "manual_human": {},
                        "agent_font_recognition": {}
                    }
                }
            },
            "message": "Add task: Identify Font from Image."
        },
        "step5": {
            "connect_nodes": { "node1": "start", "node2": "task_identify_font" },
            "message": "Connect start node to the font identification task."
        },
        "step6": {
            "add_node": {
                "id": "task_identify_font_manual",
                "type": "solution",
                "data": {
                    "name": "Manual Font Identification",
                    "description": "Compare image to font libraries.",
                    "pain_level": 3, "complexity": 1, "time_estimate": 2,
                    "human_in_loop_feedback_initial": 1, "human_in_loop_feedback_refined": 1
                }
            },
            "message": "Add manual solution node."
        },
        "step7": {
            "connect_nodes": { "node1": "task_identify_font", "node2": "task_identify_font_manual" },
            "message": "Connect task to manual solution."
        },
        "step8": {
            "add_node": {
                "id": "task_identify_font_agent",
                "type": "solution",
                "data": {
                    "name": "AI Font Recognition Agent",
                    "description": "Use image recognition to identify fonts.",
                    "pain_level": 1, "complexity": 1, "time_estimate": 1,
                    "human_in_loop_feedback_initial": 4, "human_in_loop_feedback_refined": 2
                }
            },
            "message": "Add AI agent solution node."
        },
        "step9": {
            "connect_nodes": { "node1": "task_identify_font", "node2": "task_identify_font_agent" },
            "message": "Connect task to AI agent solution."
        },
        "step10": {
            "select_path": ["task_identify_font", "task_identify_font_manual", "task_identify_font_agent"],
            "message": "Highlighting task and solution options."
        },
        "step11": {
            "copy_move_to_focus": null,
            "message": "Copying selected path to focus area."
        },
        "step12": {
            "straighten_path": null,
            "message": "Arranging nodes linearly in focus area."
        },
        "step13": {
            "message": "Adding a second Task"
        },
        "step14": {
            "add_node": {
                "id": "task_svg_convert",
                "type": "task",
                "data": {
                    "title": "Convert SVG to Optimized Raster",
                    "description": "Export SVGs in raster formats.",
                    "potential_solutions": {
                        "manual_human": {},
                        "script_batch_conversion": {},
                        "agent_intelligent_optimization": {}
                    }
                }
            },
            "message": "Add task, convert SVG"
        },
        "step15": {
            "connect_nodes": { "node1": "task_identify_font", "node2": "task_svg_convert" },
            "message": "Connect the first task to the second task"
        },
        "step16": {
            "add_node": {
                "id": "task_svg_convert_manual",
                "type": "solution",
                "data": {
                    "name": "Manual SVG Export & Optimization",
                    "description": "Designer manually exports SVGs from design software and uses separate image optimization tools.",
                    "pain_level": 2,
                    "complexity": 1,
                    "time_estimate": 2,
                    "human_in_loop_feedback_initial": 1,
                    "human_in_loop_feedback_refined": 1
                }
            },
            "message": "Adding the manual svg solution"
        },
        "step17": {
            "connect_nodes": { "node1": "task_svg_convert", "node2": "task_svg_convert_manual" },
            "message": "Connect task to manual solution."
        },
        "step18": {
            "add_node": {
                "id": "task_svg_convert_script", "type": "solution",
                "data": {
                    "name": "Scripted Batch Conversion",
                    "description": "Script automates SVG to raster conversion and basic optimization for multiple files.",
                    "pain_level": 1,
                    "complexity": 2,
                    "time_estimate": 2,
                    "human_in_loop_feedback_initial": 3,
                    "human_in_loop_feedback_refined": 2
                }
            },
            "message": "Adding the script solution"
        },
        "step19": {
            "connect_nodes": { "node1": "task_svg_convert", "node2": "task_svg_convert_script" },
            "message": "Connect task to script solution."
        },
        "step20": {
            "add_node": {
                "id": "task_svg_convert_agent", "type": "solution",
                "data": {
                    "name": "AI-Powered Optimization Agent",
                    "description": "Agent intelligently optimizes raster output based on context and platform requirements.",
                    "pain_level": 1,
                    "complexity": 2,
                    "time_estimate": 1,
                    "human_in_loop_feedback_initial": 4,
                    "human_in_loop_feedback_refined": 2
                }
            },
            "message": "Adding the agent solution"
        },
        "step21": {
            "connect_nodes": { "node1": "task_svg_convert", "node2": "task_svg_convert_agent" },
            "message": "Connect task to agent solution."
        },
        "step22": {
            "connect_nodes": { "node1": "task_svg_convert", "node2": "end" },
            "message": "Connect the svg convert task to end node"
        },
        "step23": {
            "select_path": ["start", "task_identify_font", "task_svg_convert", "end"],
            "message": "Selecting the entire path."
        },
        "step24": {
            "copy_move_to_focus": null,
            "message": "Copy the main path to the focus area."
        },
        "step25": {
            "message": "Demonstrate the scales, by removing the current nodes first"
        },
        "step26": {
            "remove_node": null,
            "message": "removing start node"
        },
        "step27": {
            "remove_node": null,
            "message": "removing end node"
        },
        "step28": {
            "remove_node": null,
            "message": "removing find font node"
        },
        "step29": {
            "remove_node": null,
            "message": "removing font manual solution node"
        },
        "step30": {
            "remove_node": null,
            "message": "removing font ai solution node"
        },
        "step31": {
            "remove_node": null,
            "message": "remove convert node"
        },
        "step32": {
            "remove_node": null,
            "message": "remove convert manual solution"
        },
        "step33": {
            "remove_node": null,
            "message": "remove convert script solution"
        },
        "step34": {
            "remove_node": null,
            "message": "remove convert agent solution"
        },
        "step35": {
            "message": "Recreate scales as per the JSON."
        },

        "step36": { "add_circular_rings": [6, 12, 18], "message": "Creating circular rings to represent scales" },
        "step37": { "select_path": ["node-0", "node-1", "node-2", "node-3", "node-4", "node-5"], "message": "Selecting time estimate nodes" },
        "step38": { "copy_move_to_focus": null, "message": "Moving time estimate to focus area" },
        "step39": { "straighten_path": null, "message": "Straightening for better view of Time Estimates" },
        "step40": {
            "message": "Compressing..."
        },
        "step41": { "compress_path": null, "message": "Compressing scale titles path" },
        "step42": { "add_compressed_path_to_graph": null, "message": "Add compressed path" }
    },

    "genui_component_49": {
        "step1": {
            "reset": null,
            "message": "Initialize graph for dynamic UI component generation."
        },
        "step2": {
            "add_node": {
                "id": "start",
                "type": "start",
                "data": { "title": "Start Component Generation" }
            },
            "message": "Add start node."
        },
        "step3": {
            "add_node": {
                "id": "end",
                "type": "end",
                "data": { "title": "End Component Generation" }
            },
            "message": "Add end node."
        },
        "step4": {
            "add_node": {
                "id": "define_brand",
                "type": "task",
                "data": {
                    "title": "Define Brand Guidelines",
                    "description": "Establish color palette, typography, and overall style.",
                    "potential_solutions": {
                        "manual_human": { "name": "Manual Definition" },
                        "llm_brand_suggestion": { "name": "LLM Brand Suggestion" }
                    }
                }
            },
            "message": "Add task: Define Brand Guidelines."
        },
        "step5": {
            "connect_nodes": { "node1": "start", "node2": "define_brand" },
            "message": "Connect start node to branding task."
        },
        "step6": {
            "add_node": {
                "id": "define_brand_manual",
                "type": "solution",
                "data": { "name": "Manual Definition" }
            },
            "message": "Add manual solution for branding."
        },
        "step7": {
            "connect_nodes": { "node1": "define_brand", "node2": "define_brand_manual" },
            "message": "Connect branding task to manual solution."
        },
        "step8": {
            "add_node": {
                "id": "define_brand_llm",
                "type": "solution",
                "data": { "name": "LLM Brand Suggestion" }
            },
            "message": "Add LLM solution for branding."
        },
        "step9": {
            "connect_nodes": { "node1": "define_brand", "node2": "define_brand_llm" },
            "message": "Connect branding task to LLM solution."
        },
        "step10": {
            "message": "Triggering a delibration to choose best branding."
        },
        "step11": {
            "add_node": {
                "id": "create_button",
                "type": "task",
                "data": {
                    "title": "Create Button Component",
                    "description": "Generate a reusable button component.",
                    "potential_solutions": {
                        "manual_human": { "name": "Manual Coding (React/Flutter)" },
                        "llm_code_generation": { "name": "LLM Code Generation" },
                        "llm_code_generation_flutter": { "name": "LLM Code Generation - Flutter" }
                    }
                }
            },
            "message": "Add task: Create Button Component."
        },
        "step12": {
            "connect_nodes": { "node1": "define_brand", "node2": "create_button" },
            "message": "Connect branding task to button creation."
        },
        "step13": {
            "add_node": {
                "id": "create_button_manual", "type": "solution",
                "data": { "name": "Manual Coding (React/Flutter)" }
            },
            "message": "Adding manual coding solution"
        },
        "step14": {
            "connect_nodes": { "node1": "create_button", "node2": "create_button_manual" },
            "message": "connect button task to manual solution"
        },
        "step15": {
            "add_node": {
                "id": "create_button_llm", "type": "solution",
                "data": { "name": "LLM Code Generation" }
            },
            "message": "Adding LLM solution"
        },
        "step16": {
            "connect_nodes": { "node1": "create_button", "node2": "create_button_llm" },
            "message": "connect button task to llm solution"
        },
        "step17": {
            "add_node": {
                "id": "create_button_llm_flutter", "type": "solution",
                "data": { "name": "LLM Code Generation - Flutter" }
            },
            "message": "Adding LLM Flutter solution"
        },
        "step18": {
            "connect_nodes": { "node1": "create_button", "node2": "create_button_llm_flutter" },
            "message": "connect button task to llm flutter solution"
        },
        "step19": {
            "message": "Trigger a sub-graph to explore button variations."
        },
        "step20": {
            "create_subgraph": { "parentNodeId": "create_button", "subGraphId": "Explore Button Variations" },
            "message": "Creating a sub-graph for exploring button variations"
        },

        "step21": {
            "add_node": {
                "id": "create_slider",
                "type": "task",
                "data": {
                    "title": "Create Slider Component",
                    "description": "Generate a reusable slider component.",
                    "potential_solutions": {
                        "manual_human": { "name": "Manual Coding (React/Flutter)" },
                        "llm_code_generation": { "name": "LLM Code Generation" },
                        "llm_code_generation_flutter": { "name": "LLM Code Generation - Flutter" }
                    }
                }
            },
            "message": "Add task: Create Slider Component."
        },

        "step22": {
            "connect_nodes": { "node1": "create_button", "node2": "create_slider" },
            "message": "connect button to slider task"
        },
        "step23": {
            "add_node": {
                "id": "create_slider_manual", "type": "solution",
                "data": { "name": "Manual Coding (React/Flutter)" }
            },
            "message": "Adding manual coding solution"
        },
        "step24": {
            "connect_nodes": { "node1": "create_slider", "node2": "create_slider_manual" },
            "message": "connect slider task to manual solution"
        },
        "step25": {
            "add_node": {
                "id": "create_slider_llm", "type": "solution",
                "data": { "name": "LLM Code Generation" }
            },
            "message": "Adding LLM solution"
        },
        "step26": {
            "connect_nodes": { "node1": "create_slider", "node2": "create_slider_llm" },
            "message": "connect slider task to LLM solution"
        },
        "step27": {
            "add_node": {
                "id": "create_slider_llm_flutter", "type": "solution",
                "data": { "name": "LLM Code Generation - Flutter" }
            },
            "message": "Adding LLM flutter solution"
        },
        "step28": {
            "connect_nodes": { "node1": "create_slider", "node2": "create_slider_llm_flutter" },
            "message": "connect slider task to LLM flutter solution"
        },
        "step29": {
            "add_node": {
                "id": "create_input",
                "type": "task",
                "data": {
                    "title": "Create Input Field Component",
                    "description": "Generate a reusable input field component.",
                    "potential_solutions": {
                        "manual_human": { "name": "Manual Coding" },
                        "llm_code_generation": { "name": "LLM Code Generation" }
                    }
                }
            },
            "message": "Add task: Create Input Field Component."
        },
        "step30": {
            "connect_nodes": { "node1": "create_slider", "node2": "create_input" },
            "message": "Connect create slider to input"
        },
        "step31": {
            "connect_nodes": { "node1": "create_input", "node2": "end" },
            "message": "Connecting the input to the end."
        },
        "step32": {
            "add_node": {
                "id": "create_input_manual", "type": "solution",
                "data": { "name": "Manual Coding (React/Flutter)" }
            },
            "message": "Adding manual coding solution"
        },
        "step33": {
            "connect_nodes": { "node1": "create_input", "node2": "create_input_manual" },
            "message": "Connect input task to manual solution"
        },
        "step34": {
            "add_node": {
                "id": "create_input_llm", "type": "solution",
                "data": { "name": "LLM Code Generation" }
            },
            "message": "Adding LLM solution"
        },
        "step35": {
            "connect_nodes": { "node1": "create_input", "node2": "create_input_llm" },
            "message": "Connect input task to LLM solution"
        },
        "step36": {
            "add_node": {
                "id": "create_input_llm_flutter", "type": "solution",
                "data": { "name": "LLM Code Generation - Flutter" }
            },
            "message": "Adding LLM flutter solution"
        },
        "step37": {
            "connect_nodes": { "node1": "create_input", "node2": "create_input_llm_flutter" },
            "message": "connect input task to LLM flutter solution"
        },

        "step38": {
            "select_path": ["start", "define_brand", "create_button", "create_slider", "create_input", "end"],
            "message": "Selecting the main path."
        },
        "step39": {
            "copy_move_to_focus": null,
            "message": "Copying the main path to the focus area."
        },
        "step40": {
            "straighten_path": null,
            "message": "Straighten the path"
        },
        "step41": {
            "message": "Demonstrate adding more nodes to graph, will be removed."
        },
        "step42": {
            "add_node": null,
            "message": "Add a temporary node"
        },
        "step43": {
            "add_node": null,
            "message": "and another node"
        },

        "step44": {
            "remove_node": null,
            "message": "Remove the nodes."
        },

        "step45": {
            "remove_node": null,
            "message": "removing other extra node"
        },
        "step46": {
            "message": "Now back to the graph at hand."
        },

        "step47": {
            "compress_path": null,
            "message": "Compressing path in focus area."
        },
        "step48": {
            "add_compressed_path_to_graph": null,
            "message": "Adding compressed path back to the main graph."
        },
        "step49": { "message": "Script complete. Components generated (conceptually)." }
    }
};
