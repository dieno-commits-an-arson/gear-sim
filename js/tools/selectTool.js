import { state } from '../core/state.js';

export class SelectTool {
    constructor() {
        this.draggingItems = false;
        this.boxSelecting = false;
        this.startPos = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
        this.dragStartPositions = new Map(); // Maps ID to starting X/Y
    }

    pointerDown(e, worldPos) {
        this.startPos = { x: worldPos.x, y: worldPos.y };
        this.currentPos = { x: worldPos.x, y: worldPos.y };
        
        let clickedComp = null;
        for (let i = state.components.length - 1; i >= 0; i--) {
            const comp = state.components[i];
            if (comp.isPointInside && comp.isPointInside(worldPos.x, worldPos.y)) {
                clickedComp = comp;
                break;
            }
        }

        if (clickedComp) {
            this.draggingItems = true;
            
            // Shift + Click logic
            if (e.shiftKey) {
                if (state.ui.selectedIds.includes(clickedComp.id)) {
                    state.ui.selectedIds = state.ui.selectedIds.filter(id => id !== clickedComp.id);
                    this.draggingItems = false; 
                } else {
                    state.ui.selectedIds.push(clickedComp.id);
                }
            } else {
                if (!state.ui.selectedIds.includes(clickedComp.id)) {
                    state.ui.selectedIds = [clickedComp.id];
                }
            }

            // Record initial positions for everything selected (and their axles)
            if (this.draggingItems) {
                this.dragStartPositions.clear();
                const itemsToMove = new Set();
                
                state.components.forEach(c => {
                    if (state.ui.selectedIds.includes(c.id)) {
                        itemsToMove.add(c);
                        state.components.forEach(sibling => {
                            if (sibling.properties.axleId === c.properties.axleId) itemsToMove.add(sibling);
                        });
                    }
                });

                itemsToMove.forEach(c => this.dragStartPositions.set(c.id, { x: c.x, y: c.y }));
            }
        } else {
            // Clicked empty space: Begin box selection
            this.boxSelecting = true;
            if (!e.shiftKey) state.ui.selectedIds = [];
        }
        
        window.dispatchEvent(new CustomEvent('selectionChanged'));
    }

    pointerMove(e, worldPos) {
        this.currentPos = { x: worldPos.x, y: worldPos.y };

        if (this.draggingItems) {
            const dx = worldPos.x - this.startPos.x;
            const dy = worldPos.y - this.startPos.y;

            this.dragStartPositions.forEach((startPos, id) => {
                const comp = state.components.find(c => c.id === id);
                if (comp) {
                    comp.x = startPos.x + dx;
                    comp.y = startPos.y + dy;
                }
            });
            window.dispatchEvent(new CustomEvent('componentMoved'));
        }

        if (this.boxSelecting) {
            state.ui.selectionBox = {
                x: Math.min(this.startPos.x, this.currentPos.x),
                y: Math.min(this.startPos.y, this.currentPos.y),
                width: Math.abs(this.currentPos.x - this.startPos.x),
                height: Math.abs(this.currentPos.y - this.startPos.y)
            };
        }
    }

    pointerUp(e, worldPos) {
        // Snap logic is disabled when moving multiple components to avoid physics chaos
        if (this.draggingItems && state.ui.selectedIds.length === 1) {
            this.snapPrimaryGear();
        }

        if (this.boxSelecting) {
            const box = state.ui.selectionBox;
            if (box && box.width > 5 && box.height > 5) {
                const newSelections = [];
                state.components.forEach(comp => {
                    if (comp.x >= box.x && comp.x <= box.x + box.width &&
                        comp.y >= box.y && comp.y <= box.y + box.height) {
                        newSelections.push(comp.id);
                    }
                });

                if (e.shiftKey) {
                    newSelections.forEach(id => {
                        if (!state.ui.selectedIds.includes(id)) state.ui.selectedIds.push(id);
                    });
                } else {
                    state.ui.selectedIds = newSelections;
                }
            }
            state.ui.selectionBox = null;
            window.dispatchEvent(new CustomEvent('selectionChanged'));
        }

        this.draggingItems = false;
        this.boxSelecting = false;
    }

    snapPrimaryGear() {
        const primaryId = state.ui.selectedIds[0];
        const current = state.components.find(c => c.id === primaryId);
        if (!current || current.type !== 'gear') return;

        const snapThreshold = 15; 
        const axleId = current.properties.axleId;

        for (const other of state.components) {
            if (other.id === current.id || other.type !== 'gear' || other.properties.axleId === axleId) continue;

            const dx = current.x - other.x;
            const dy = current.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const targetDistance = current.properties.radius + other.properties.radius;

            if (Math.abs(distance - targetDistance) < snapThreshold) {
                const angle = Math.atan2(dy, dx);
                const snapX = other.x + Math.cos(angle) * targetDistance;
                const snapY = other.y + Math.sin(angle) * targetDistance;
                
                const offsetX = snapX - current.x;
                const offsetY = snapY - current.y;

                this.dragStartPositions.forEach((_, id) => {
                    const comp = state.components.find(c => c.id === id);
                    if (comp) {
                        comp.x += offsetX;
                        comp.y += offsetY;
                    }
                });
                
                window.dispatchEvent(new CustomEvent('componentMoved'));
                break; 
            }
        }
    }
}
