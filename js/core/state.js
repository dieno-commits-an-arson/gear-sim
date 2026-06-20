// Central Application State
export const state = {
    components: [],   // Gears, Motors, Shafts
    connections: [],  // Gear meshes, belts
    
    viewport: {
        x: 0,         // Pan X
        y: 0,         // Pan Y
        zoom: 1       // Zoom level
    },
    
    ui: {
        activeTool: 'select',
        selectedId: null,
        showGrid: true,
        gridSize: 50
    }
};

// Pure utility for components
export function generateUUID() {
    return crypto.randomUUID ? crypto.randomUUID() : 
           'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, c => {
               const r = Math.random() * 16 | 0;
               return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
           });
}
