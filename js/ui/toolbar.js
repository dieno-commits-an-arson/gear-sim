import { state } from '../core/state.js';

export class Toolbar {
    constructor(eventManager, tools) {
        this.eventManager = eventManager;
        this.tools = tools;
        this.canvas = document.getElementById('app-canvas');
        
        this.buttons = {
            'select': document.getElementById('tool-select'),
            'gear': document.getElementById('tool-gear')
        };

        this.bindEvents();
        this.setTool('select'); // Default active tool
    }

    bindEvents() {
        for (const [toolName, btn] of Object.entries(this.buttons)) {
            btn.addEventListener('click', () => this.setTool(toolName));
        }
        document.getElementById('sim-play').addEventListener('click', () => { state.sim.isPlaying = !state.sim.isPlaying; document.getElementById('sim-play').innerText = state.sim.isPlaying ? '⏸ Pause' : '▶ Play'; });)
    }

    setTool(toolName) {
        state.ui.activeTool = toolName;
        this.eventManager.setTool(this.tools[toolName]);

        // Toggle CSS highlights
        Object.values(this.buttons).forEach(btn => btn.classList.remove('active'));
        if (this.buttons[toolName]) {
            this.buttons[toolName].classList.add('active');
        }

        // UX FIX: Change the mouse cursor so the user knows they need to click the canvas
        if (toolName === 'gear') {
            this.canvas.style.cursor = 'crosshair';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }
}
