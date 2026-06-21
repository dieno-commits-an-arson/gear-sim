import { state } from './state.js';
import { Gear } from '../models/Gear.js';

export class EventManager {
    constructor(canvas, renderer) {
        this.canvas = canvas;
        this.renderer = renderer;
        
        this.isPanning = false;
        this.lastMouse = { x: 0, y: 0 };
        this.activeToolInstance = null; 

        this.bindEvents();
    }

    setTool(toolInstance) {
        this.activeToolInstance = toolInstance;
    }

    bindEvents() {
        this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        this.canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
        window.addEventListener('pointerup', (e) => this.onPointerUp(e)); 
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    onKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // COMMAND: Delete
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (state.ui.selectedId) {
                state.components = state.components.filter(c => c.id !== state.ui.selectedId);
                state.ui.selectedId = null;
                window.dispatchEvent(new CustomEvent('selectionChanged'));
            }
        }

        // COMMAND: Add Stacked Gear (Shift + A)
        if (e.key.toLowerCase() === 'a' && e.shiftKey) {
            const parentGear = state.components.find(c => c.id === state.ui.selectedId);
            if (parentGear && parentGear.type === 'gear') {
                const newGear = new Gear(parentGear.x, parentGear.y);
                
                // Inherit the exact axle ID so they move and spin together
                newGear.properties.axleId = parentGear.properties.axleId;
                
                // Make the stacked gear visibly smaller (60% size)
                newGear.properties.radius = Math.max(10, Math.floor(parentGear.properties.radius * 0.6));
                newGear.properties.teeth = Math.max(4, Math.floor(parentGear.properties.teeth * 0.6));
                
                // Color it slightly darker to separate it visually
                newGear.properties.color = '#5a6268';
                
                state.components.push(newGear);
                
                // Select the new gear immediately
                state.ui.selectedId = newGear.id;
                window.dispatchEvent(new CustomEvent('selectionChanged'));
            }
        }

        // COMMAND: Copy
        if (e.key.toLowerCase() === 'c' && (e.ctrlKey || e.metaKey)) {
            const comp = state.components.find(c => c.id === state.ui.selectedId);
            if (comp) {
                state.clipboard = {
                    type: comp.type,
                    data: JSON.parse(JSON.stringify({ x: comp.x, y: comp.y, properties: comp.properties }))
                };
            }
        }

        // COMMAND: Paste
        if (e.key.toLowerCase() === 'v' && (e.ctrlKey || e.metaKey)) {
            if (state.clipboard && state.clipboard.type === 'gear') {
                const data = state.clipboard.data;
                const newGear = new Gear(data.x + 30, data.y + 30);
                newGear.properties = JSON.parse(JSON.stringify(data.properties));
                
                // CRITICAL: A pasted gear must get a brand new axleId, otherwise it teleports!
                newGear.properties.axleId = generateUUID();

                state.components.push(newGear);
                state.ui.selectedId = newGear.id;
                window.dispatchEvent(new CustomEvent('selectionChanged'));
                
                state.clipboard.data.x += 30;
                state.clipboard.data.y += 30;
            }
        }
    }

    onPointerDown(e) {
        if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
            this.isPanning = true;
            this.lastMouse = { x: e.clientX, y: e.clientY };
            this.canvas.style.cursor = 'grabbing';
            return;
        }
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
        e.preventDefault(); 
        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity;
        let newZoom = state.viewport.zoom * Math.exp(delta);
        newZoom = Math.max(0.1, Math.min(newZoom, 10));
        const mouseWorldBeforeZoom = this.renderer.screenToWorld(e.clientX, e.clientY);
        state.viewport.zoom = newZoom;
        const mouseWorldAfterZoom = this.renderer.screenToWorld(e.clientX, e.clientY);
        state.viewport.x += (mouseWorldAfterZoom.x - mouseWorldBeforeZoom.x) * state.viewport.zoom;
        state.viewport.y += (mouseWorldAfterZoom.y - mouseWorldBeforeZoom.y) * state.viewport.zoom;
    }
}
