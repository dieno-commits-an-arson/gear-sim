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
        this.setTool('select'); 
    }

    bindEvents() {
        for (const [toolName, btn] of Object.entries(this.buttons)) {
            btn.addEventListener('click', () => this.setTool(toolName));
        }

        // Catch the global hotkeys fired by events.js
        window.addEventListener('changeToolRequest', (e) => {
            const requestedTool = e.detail;
            if (this.tools[requestedTool]) {
                this.setTool(requestedTool);
            }
        });

        if (this.simPlayBtn) {
            this.simPlayBtn.addEventListener('click', () => {
                state.sim.isPlaying = !state.sim.isPlaying;
                
                if (state.sim.isPlaying) {
                    this.simPlayBtn.innerHTML = '⏸ Pause';
                    this.simPlayBtn.style.background = '#dc3545';
                    this.simPlayBtn.style.borderColor = '#c82333';
                } else {
                    this.simPlayBtn.innerHTML = '▶ Play';
                    this.simPlayBtn.style.background = '#28a745';
                    this.simPlayBtn.style.borderColor = '#218838';
                }
            });
        }
    }

    setTool(toolName) {
        state.ui.activeTool = toolName;
        this.eventManager.setTool(this.tools[toolName]);

        Object.values(this.buttons).forEach(btn => btn.classList.remove('active'));
        if (this.buttons[toolName]) {
            this.buttons[toolName].classList.add('active');
        }

        if (toolName === 'gear') {
            this.canvas.style.cursor = 'crosshair';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }
}
