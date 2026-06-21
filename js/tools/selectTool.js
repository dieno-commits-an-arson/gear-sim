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
            const newX = worldPos.x + this.dragOffset.x;
            const newY = worldPos.y + this.dragOffset.y;
            const axleId = this.draggingComponent.properties.axleId;

            // Move ALL components sharing this axle
            state.components.forEach(comp => {
                if (comp.properties.axleId === axleId) {
                    comp.x = newX;
                    comp.y = newY;
                }
            });
            
            window.dispatchEvent(new CustomEvent('componentMoved'));
        }
    }

    pointerUp(e, worldPos) {
        if (this.draggingComponent && this.draggingComponent.type === 'gear') {
            this.snapToNearestGear();
        }
        this.draggingComponent = null;
    }

    snapToNearestGear() {
        const current = this.draggingComponent;
        const snapThreshold = 15; 
        const axleId = current.properties.axleId;

        for (const other of state.components) {
            // Do not snap to itself, and do not snap to a gear on its own axle!
            if (other.id === current.id || other.type !== 'gear' || other.properties.axleId === axleId) continue;

            const dx = current.x - other.x;
            const dy = current.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const targetDistance = current.properties.radius + other.properties.radius;

            if (Math.abs(distance - targetDistance) < snapThreshold) {
                const angle = Math.atan2(dy, dx);
                const snapX = other.x + Math.cos(angle) * targetDistance;
                const snapY = other.y + Math.sin(angle) * targetDistance;
                
                // Snap ALL components sharing this axle
                state.components.forEach(comp => {
                    if (comp.properties.axleId === axleId) {
                        comp.x = snapX;
                        comp.y = snapY;
                    }
                });
                
                window.dispatchEvent(new CustomEvent('componentMoved'));
                break; 
            }
        }
    }
}
