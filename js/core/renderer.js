import { state } from './state.js';

export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
        this.renderLoop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.canvas.width / 2 - state.viewport.x) / state.viewport.zoom,
            y: (screenY - this.canvas.height / 2 - state.viewport.y) / state.viewport.zoom
        };
    }

    worldToScreen(worldX, worldY) {
        return {
            x: worldX * state.viewport.zoom + state.viewport.x + this.canvas.width / 2,
            y: worldY * state.viewport.zoom + state.viewport.y + this.canvas.height / 2
        };
    }

    renderLoop() {
        this.clear();
        
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2 + state.viewport.x, this.canvas.height / 2 + state.viewport.y);
        this.ctx.scale(state.viewport.zoom, state.viewport.zoom);

        if (state.ui.showGrid) this.drawGrid();
        
        this.drawComponents();

        this.ctx.restore();

        requestAnimationFrame(() => this.renderLoop());
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        const { zoom } = state.viewport;
        const size = state.ui.gridSize;
        
        const left = this.screenToWorld(0, 0).x;
        const right = this.screenToWorld(this.canvas.width, 0).x;
        const top = this.screenToWorld(0, 0).y;
        const bottom = this.screenToWorld(0, this.canvas.height).y;

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1 / zoom; 
        this.ctx.beginPath();

        for (let i = Math.floor(left / size) * size; i <= right; i += size) {
            this.ctx.moveTo(i, top);
            this.ctx.lineTo(i, bottom);
        }
        for (let i = Math.floor(top / size) * size; i <= bottom; i += size) {
            this.ctx.moveTo(left, i);
            this.ctx.lineTo(right, i);
        }
        
        this.ctx.stroke();

        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.lineWidth = 2 / zoom;
        this.ctx.beginPath();
        this.ctx.moveTo(-20, 0); this.ctx.lineTo(20, 0);
        this.ctx.moveTo(0, -20); this.ctx.lineTo(0, 20);
        this.ctx.stroke();
    }

    drawComponents() {
        // CRITICAL UPDATE: Compute selection state here
        state.components.forEach(comp => {
            const isSelected = (state.ui.selectedId === comp.id);
            if (comp.render) comp.render(this.ctx, isSelected);
        });
    }
}
