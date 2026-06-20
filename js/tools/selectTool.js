import { state } from '../core/state.js';

export class SelectTool {
    constructor() {
        this.draggingComponent = null;
        this.dragOffset = { x: 0, y: 0 };
    }

    pointerDown(e, worldPos) {
        state.ui.selectedId = null; 
        this.draggingComponent = null;

        // Iterate backwards to interact with the top-most visual component
        for (let i = state.components.length - 1; i >= 0; i--) {
            const comp = state.components[i];
            
            if (comp.isPointInside && comp.isPointInside(worldPos.x, worldPos.y)) {
                state.ui.selectedId = comp.id;
                this.draggingComponent = comp;
                
                // Calculate grab offset so the gear doesn't snap its center to the cursor
                this.dragOffset.x = comp.x - worldPos.x;
                this.dragOffset.y = comp.y - worldPos.y;
                break;
            }
        }
        
        // Ping the UI layer to update the sidebar
        window.dispatchEvent(new CustomEvent('selectionChanged'));
    }

    pointerMove(e, worldPos) {
        if (this.draggingComponent) {
            this.draggingComponent.x = worldPos.x + this.dragOffset.x;
            this.draggingComponent.y = worldPos.y + this.dragOffset.y;
            
            // Ping the UI to update the live coordinate numbers in the sidebar
            window.dispatchEvent(new CustomEvent('componentMoved'));
        }
    }

    pointerUp(e, worldPos) {
        // Release the gear
        this.draggingComponent = null;
    }
}
