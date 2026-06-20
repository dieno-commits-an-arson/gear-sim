import { state } from '../core/state.js';
import { Gear } from '../models/Gear.js';

export class GearTool {
    pointerDown(e, worldPos) {
        // Instantiate a new gear exactly at the mouse's world coordinates
        const newGear = new Gear(worldPos.x, worldPos.y);
        state.components.push(newGear);
        
        // Auto-select the newly created gear
        state.ui.selectedId = newGear.id;
        window.dispatchEvent(new CustomEvent('selectionChanged'));
    }

    // Required by interface but unused for basic instantiation
    pointerMove(e, worldPos) {}
    pointerUp(e, worldPos) {}
}
