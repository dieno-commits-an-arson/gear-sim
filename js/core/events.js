import { state, generateUUID } from './state.js';
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
        // Stop hotkeys if typing in the sidebar
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // COMMAND: Tool Selection Hotkeys
        if (e.key === '1') {
            window.dispatchEvent(new CustomEvent('changeToolRequest', { detail: 'select' }));
        }
        if (e.key === '2') {
            window.dispatchEvent(new CustomEvent('changeToolRequest', { detail: 'gear' }));
        }

        // COMMAND: Delete
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (state.ui.selectedIds.length > 0) {
                state.components = state.components.filter(c => !state.ui.selectedIds.includes(c.id));
                state.ui.selectedIds = [];
                window.dispatchEvent(new CustomEvent('selectionChanged'));
            }
        }

        // COMMAND: Add Stacked Gear (Shift + A)
        if (e.key.toLowerCase() === 'a' && e.shiftKey) {
            if (state.ui.selectedIds.length > 0) {
                const parentGear = state.components.find(c => c.id === state.ui.selectedIds[0]);
                if (parentGear && parentGear.type === 'gear') {
                    const newGear = new Gear(parentGear.x, parentGear.y);
                    newGear.properties.axleId = parentGear.properties.axleId;
                    newGear.properties.radius = Math.max(10, Math.floor(parentGear.properties.radius * 0.6));
                    newGear.properties.teeth = Math.max(4, Math.floor(parentGear.properties.teeth * 0.6));
                    newGear.properties.color = '#5a6268';
                    
                    state.components.push(newGear);
                    state.ui.selectedIds = [newGear.id]; 
                    window.dispatchEvent(new CustomEvent('selectionChanged'));
                }
            }
        }

        // COMMAND: Copy Array
        if (e.key.toLowerCase() === 'c' && (e.ctrlKey || e.metaKey)) {
            const itemsToCopy = state.components.filter(c => state.ui.selectedIds.includes(c.id));
            if (itemsToCopy.length > 0) {
                state.clipboard = itemsToCopy.map(comp => ({
                    type: comp.type,
                    x: comp.x,
                    y: comp.y,
                    properties: JSON.parse(JSON.stringify(comp.properties))
                }));
            }
        }

        // COMMAND: Paste Array
        if (e.key.toLowerCase() === 'v' && (e.ctrlKey || e.metaKey)) {
            if (state.clipboard.length > 0) {
                const newSelection = [];
                const axleMap = {}; 

                state.clipboard.forEach(data => {
                    const newGear = new Gear(data.x + 30, data.y + 30);
                    newGear.properties = JSON.parse(JSON.stringify(data.properties));

                    const oldAxleId = data.properties.axleId;
                    if (!axleMap[oldAxleId]) {
                        axleMap[oldAxleId] = generateUUID();
                    }
                    newGear.properties.axleId = axleMap[oldAxleId];

                    state.components.push(newGear);
                    newSelection.push(newGear.id);

                    data.x += 30;
                    data.y += 30;
                });

                state.ui.selectedIds = newSelection;
                window.dispatchEvent(new CustomEvent('selectionChanged'));
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
