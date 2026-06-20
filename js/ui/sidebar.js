import { state } from '../core/state.js';

export class Sidebar {
    constructor() {
        this.content = document.getElementById('properties-content');
        
        // Listen to changes dispatched by the Selection Tool
        window.addEventListener('selectionChanged', () => this.render());
        
        // Update values in real-time while dragging, without losing input focus
        window.addEventListener('componentMoved', () => this.updateLiveValues());
    }

    render() {
        if (!state.ui.selectedId) {
            this.content.innerHTML = '<p style="color: #888;">No selection</p>';
            return;
        }

        const comp = state.components.find(c => c.id === state.ui.selectedId);
        if (!comp) return;

        // Render input templates dynamically
        this.content.innerHTML = `
            <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
                <div style="color:#00a8ff; text-transform:uppercase; font-size: 11px; letter-spacing: 1px;">
                    ${comp.type} Settings
                </div>
                
                <label style="font-size:12px; color:#aaa;">X Coordinate</label>
                <input type="number" id="prop-x" value="${Math.round(comp.x)}" style="background:#1e1e1e; border:1px solid #444; color:#fff; padding:6px; border-radius: 4px;">
                
                <label style="font-size:12px; color:#aaa;">Y Coordinate</label>
                <input type="number" id="prop-y" value="${Math.round(comp.y)}" style="background:#1e1e1e; border:1px solid #444; color:#fff; padding:6px; border-radius: 4px;">
                
                <label style="font-size:12px; color:#aaa;">Radius</label>
                <input type="number" id="prop-radius" value="${comp.properties.radius}" style="background:#1e1e1e; border:1px solid #444; color:#fff; padding:6px; border-radius: 4px;">
                
                <label style="font-size:12px; color:#aaa;">Teeth</label>
                <input type="number" id="prop-teeth" value="${comp.properties.teeth}" style="background:#1e1e1e; border:1px solid #444; color:#fff; padding:6px; border-radius: 4px;">
            </div>
        `;

        // Two-way data binding manually tied to state
        document.getElementById('prop-x').addEventListener('input', (e) => comp.x = parseFloat(e.target.value) || 0);
        document.getElementById('prop-y').addEventListener('input', (e) => comp.y = parseFloat(e.target.value) || 0);
        document.getElementById('prop-radius').addEventListener('input', (e) => comp.properties.radius = parseFloat(e.target.value) || 10);
        document.getElementById('prop-teeth').addEventListener('input', (e) => comp.properties.teeth = parseFloat(e.target.value) || 4);
    }

    updateLiveValues() {
        if (!state.ui.selectedId) return;
        const comp = state.components.find(c => c.id === state.ui.selectedId);
        
        const inputX = document.getElementById('prop-x');
        const inputY = document.getElementById('prop-y');
        
        if (inputX && inputY && comp) {
            inputX.value = Math.round(comp.x);
            inputY.value = Math.round(comp.y);
        }
    }
}
