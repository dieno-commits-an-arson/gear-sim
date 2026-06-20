// Central Application State
export const state = {
    components: [],   
    connections: [],  
    
    viewport: {
        x: 0,         
        y: 0,         
        zoom: 1       
    },
    
    ui: {
        activeTool: 'select',
        selectedId: null,
        showGrid: true,
        gridSize: 50
    },

    sim: {
        isPlaying: false
    },

    // NEW: Global clipboard for copy/paste
    clipboard: null
};

export function generateUUID() {
    return crypto.randomUUID ? crypto.randomUUID() : 
           'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, c => {
               const r = Math.random() * 16 | 0;
               return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
           });
}
