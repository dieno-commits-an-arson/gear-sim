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

        this.simPlayBtn = document.getElementById('sim-play');

        this.bindEvents();
        this.setTool('select'); // Default active tool
    }

    bindEvents() {
        for (const [toolName, btn] of Object.entries(this.buttons)) {
            btn.addEventListener('click', () => this.setTool(toolName));
        }

        // SIMULATION PLAY/PAUSE LOGIC
        this.simPlayBtn.addEventListener('click', () => {
            state.sim.isPlaying = !state.sim.isPlaying;
            
            if (state.sim.isPlaying) {
                this.simPlayBtn.innerHTML = '⏸ Pause';
                this.simPlayBtn.style.background = '#dc3545'; // Red
                this.simPlayBtn.style.borderColor = '#c82333';
            } else {
                this.simPlayBtn.innerHTML = '▶ Play';
                this.simPlayBtn.style.background = '#28a745'; // Green
                this.simPlayBtn.style.borderColor = '#218838';
            }
        });
    }

    setTool(toolName) {
        state.ui.activeTool = toolName;
        this.eventManager.setTool(this.tools[toolName]);

        // Toggle CSS highlights
        Object.values(this.buttons).forEach(btn => btn.classList.remove('active'));
        if (this.buttons[toolName]) {
            this.buttons[toolName].classList.add('active');
        }

        // UX Fix
        if (toolName === 'gear') {
            this.canvas.style.cursor = 'crosshair';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }
}
