import { state } from '../core/state.js';

export class Sidebar {
    constructor() {
        this.content = document.getElementById('properties-content');
        
        window.addEventListener('selectionChanged', () => this.render());
        window.addEventListener('componentMoved', () => this.updateLiveValues());
    }

    render() {
        if (!state.ui.selectedId) {
            this.content.innerHTML = '<p style="color: #888;">No selection</p>';
            return;
        }

        const comp = state.components.find(c => c.id === state.ui.selectedId);
        if (!comp) return;

        this.content.innerHTML = `
            <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
                <div style="color:#00a8ff; text-transform:uppercase; font-size: 11px; letter-spacing: 1px;">
                    ${comp.type} Geometry
                </div>
                
                <label style="font-size:12px; color:#aaa;">X Coordinate</label>
                <input type="number" id="prop-x" value="${Math.round(comp.x)}" style="background:#1e1e1e; border:1px solid #444; color:#fff; padding:6px; border-radius: 4px;">
                
                <label style="font-size:12px; color:#aaa;">Y Coordinate</label>
                <input type="number" id="prop-y" value="${Math.round(comp.y)}" style="background:#1e1e1e; border:1px solid #444; color:#fff; padding:6px; border-radius: 4px;">
                
                <label style="font-size:12px; color:#aaa;">Radius</label>
                <input type="number" id="prop-radius" value="${comp.properties.radius}" style="background:#1e1e1e; border:1px solid #444; color:#fff; padding:6px; border-radius: 4px;">
                
                <label style="font-size:12px; color:#aaa;">Teeth</label>
                <input type="number" id="prop-teeth" value="${comp.properties.teeth}" style="background:#1e1e1e; border:1px solid #444; color:#fff; padding:6px; border-radius: 4px;">
                
                <div style="color:#d4a373; text-transform:uppercase; font-size: 11px; letter-spacing: 1px; margin-top: 10px;">
                    Simulation Profile
                </div>

                <label style="font-size:12px; color:#aaa; display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="prop-is-driver" ${comp.properties.isDriver ? 'checked' : ''}>
                    Set as Motor (Driver)
                </label>

                <div id="driver-speed-container" style="display: ${comp.properties.isDriver ? 'flex' : 'none'}; flex-direction: column; gap: 8px;">
                    <label style="font-size:12px; color:#aaa;">Motor Speed (RPM)</label>
                    <input type="number" id="prop-speed" value="${comp.properties.driverSpeed}" style="background:#1e1e1e; border:1px solid #444; color:#fff; padding:6px; border-radius: 4px;">
                </div>
            </div>
        `;

        // Coordinate listeners
        document.getElementById('prop-x').addEventListener('input', (e) => { comp.x = parseFloat(e.target.value) || 0; window.dispatchEvent(new CustomEvent('componentMoved')); });
        document.getElementById('prop-y').addEventListener('input', (e) => { comp.y = parseFloat(e.target.value) || 0; window.dispatchEvent(new CustomEvent('componentMoved')); });
        
        // Geometry listeners
        document.getElementById('prop-radius').addEventListener('input', (e) => comp.properties.radius = parseFloat(e.target.value) || 10);
        document.getElementById('prop-teeth').addEventListener('input', (e) => comp.properties.teeth = parseFloat(e.target.value) || 4); // Restored
        
        // Simulation listeners
        const speedContainer = document.getElementById('driver-speed-container');
        document.getElementById('prop-is-driver').addEventListener('change', (e) => {
            comp.properties.isDriver = e.target.checked;
            speedContainer.style.display = e.target.checked ? 'flex' : 'none';
        });

        document.getElementById('prop-speed').addEventListener('input', (e) => comp.properties.driverSpeed = parseFloat(e.target.value) || 0);
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
