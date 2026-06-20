import { state } from '../core/state.js';

export class SelectTool {
    constructor() {
        this.draggingComponent = null;
        this.dragOffset = { x: 0, y: 0 };
    }

    pointerDown(e, worldPos) {
        state.ui.selectedId = null; 
        this.draggingComponent = null;

        for (let i = state.components.length - 1; i >= 0; i--) {
            const comp = state.components[i];
            
            if (comp.isPointInside && comp.isPointInside(worldPos.x, worldPos.y)) {
                state.ui.selectedId = comp.id;
                this.draggingComponent = comp;
                
                this.dragOffset.x = comp.x - worldPos.x;
                this.dragOffset.y = comp.y - worldPos.y;
                break;
            }
        }
        window.dispatchEvent(new CustomEvent('selectionChanged'));
    }

    pointerMove(e, worldPos) {
        if (this.draggingComponent) {
            this.draggingComponent.x = worldPos.x + this.dragOffset.x;
            this.draggingComponent.y = worldPos.y + this.dragOffset.y;
            window.dispatchEvent(new CustomEvent('componentMoved'));
        }
    }

    pointerUp(e, worldPos) {
        if (this.draggingComponent && this.draggingComponent.type === 'gear') {
            this.snapToNearestGear();
        }
        this.draggingComponent = null;
    }

    // MAGNETIC SNAPPING LOGIC
    snapToNearestGear() {
        const current = this.draggingComponent;
        const snapThreshold = 15; // Pixels of magnetic pull

        for (const other of state.components) {
            if (other.id === current.id || other.type !== 'gear') continue;

            const dx = current.x - other.x;
            const dy = current.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Perfect meshing distance is the sum of their radiuses
            const targetDistance = current.properties.radius + other.properties.radius;

            if (Math.abs(distance - targetDistance) < snapThreshold) {
                // Calculate the angle between the two gears
                const angle = Math.atan2(dy, dx);
                
                // Snap X and Y precisely to the target distance along that vector
                current.x = other.x + Math.cos(angle) * targetDistance;
                current.y = other.y + Math.sin(angle) * targetDistance;
                
                window.dispatchEvent(new CustomEvent('componentMoved'));
                break; // Only snap to one gear at a time
            }
        }
    }
}
