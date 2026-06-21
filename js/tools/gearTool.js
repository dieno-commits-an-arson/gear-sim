import { state } from '../core/state.js';
import { Gear } from '../models/Gear.js';

export class GearTool {
    pointerDown(e, worldPos) {
        const newGear = new Gear(worldPos.x, worldPos.y);
        state.components.push(newGear);
        
        // Push ID to selection array
        state.ui.selectedIds = [newGear.id];
        window.dispatchEvent(new CustomEvent('selectionChanged'));
    }

    pointerMove(e, worldPos) {}
    pointerUp(e, worldPos) {}
}
