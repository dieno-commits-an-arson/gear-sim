import { Renderer } from './core/renderer.js';
import { EventManager } from './core/events.js';
import { SelectTool } from './tools/selectTool.js';
import { GearTool } from './tools/gearTool.js';
import { Toolbar } from './ui/toolbar.js';
import { Sidebar } from './ui/sidebar.js';

class App {
    constructor() {
        // 1. Core Systems
        this.canvas = document.getElementById('app-canvas');
        this.renderer = new Renderer('app-canvas');
        this.events = new EventManager(this.canvas, this.renderer);

        // 2. Tool Registration
        const tools = {
            'select': new SelectTool(),
            'gear': new GearTool()
        };

        // 3. UI Systems
        this.toolbar = new Toolbar(this.events, tools);
        this.sidebar = new Sidebar();

        console.log("Mechanical Gizmo Planner: Engine and Tools Initialized.");
    }
}

// Boot
window.onload = () => {
    window.app = new App();
};
