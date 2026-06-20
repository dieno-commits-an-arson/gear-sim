import { state } from './state.js';

export class EventManager {
    constructor(canvas, renderer) {
        this.canvas = canvas;
        this.renderer = renderer;
        
        // Interaction state
        this.isPanning = false;
        this.lastMouse = { x: 0, y: 0 };
        this.activeToolInstance = null; // Will hold instances of selectTool, gearTool, etc.

        this.bindEvents();
    }

    setTool(toolInstance) {
        this.activeToolInstance = toolInstance;
    }

    bindEvents() {
        // Using PointerEvents for cross-device touch/mouse compatibility
        this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        this.canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
        window.addEventListener('pointerup', (e) => this.onPointerUp(e)); // Window catches outside releases
        
        // Zooming
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    onPointerDown(e) {
        // Middle click (button 1) or Ctrl+Left click triggers Panning
        if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
            this.isPanning = true;
            this.lastMouse = { x: e.clientX, y: e.clientY };
            this.canvas.style.cursor = 'grabbing';
            return;
        }

        // Delegate to active tool if left-clicking
        if (e.button === 0 && this.activeToolInstance) {
            const worldPos = this.renderer.screenToWorld(e.clientX, e.clientY);
            this.activeToolInstance.pointerDown(e, worldPos);
        }
    }

    onPointerMove(e) {
        if (this.isPanning) {
            const dx = e.clientX - this.lastMouse.x;
            const dy = e.clientY - this.lastMouse.y;
            
            state.viewport.x += dx;
            state.viewport.y += dy;
            
            this.lastMouse = { x: e.clientX, y: e.clientY };
            return;
        }

        if (this.activeToolInstance) {
            const worldPos = this.renderer.screenToWorld(e.clientX, e.clientY);
            this.activeToolInstance.pointerMove(e, worldPos);
        }
    }

    onPointerUp(e) {
        if (this.isPanning) {
            this.isPanning = false;
            this.canvas.style.cursor = 'default';
            return;
        }

        if (this.activeToolInstance) {
            const worldPos = this.renderer.screenToWorld(e.clientX, e.clientY);
            this.activeToolInstance.pointerUp(e, worldPos);
        }
    }

    onWheel(e) {
        e.preventDefault(); // Stop page scrolling
        
        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity;
        let newZoom = state.viewport.zoom * Math.exp(delta);
        
        // Clamp zoom
        newZoom = Math.max(0.1, Math.min(newZoom, 10));

        // Math to zoom IN toward the mouse cursor, not just the center of the screen
        const mouseWorldBeforeZoom = this.renderer.screenToWorld(e.clientX, e.clientY);
        
        state.viewport.zoom = newZoom;
        
        const mouseWorldAfterZoom = this.renderer.screenToWorld(e.clientX, e.clientY);
        
        // Adjust viewport offset to keep the mouse over the same world coordinate
        state.viewport.x += (mouseWorldAfterZoom.x - mouseWorldBeforeZoom.x) * state.viewport.zoom;
        state.viewport.y += (mouseWorldAfterZoom.y - mouseWorldBeforeZoom.y) * state.viewport.zoom;
    }
}
