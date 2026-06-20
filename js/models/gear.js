import { generateUUID } from '../core/state.js';

export class Gear {
    constructor(x, y, radius = 40, teeth = 12) {
        // Core Data Model
        this.id = generateUUID();
        this.type = 'gear';
        this.x = x;
        this.y = y;
        this.rotation = 0;
        
        // Stored properties
        this.properties = {
            radius: radius,
            teeth: teeth,
            color: '#6c757d'
        };
        
        // Relational map (for future constraints/simulation)
        this.connections = [];
    }

    // Mathematical hit detection for Select Tool
    isPointInside(px, py) {
        const dx = px - this.x;
        const dy = py - this.y;
        // Include the gear teeth depth in the clickable radius
        return (dx * dx + dy * dy) <= Math.pow(this.properties.radius + 8, 2);
    }

    // Geometry pipeline
    render(ctx, isSelected = false) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const { radius, teeth, color } = this.properties;
        const toothDepth = 8;
        const outerRadius = radius + toothDepth;
        const innerRadius = radius;

        // Draw gear shape
        ctx.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
            // Alternate between inner and outer radius to form teeth
            const angle = (i * Math.PI) / teeth;
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();

        // Fill and stroke
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = isSelected ? '#00a8ff' : '#495057'; // Highlight if selected
        ctx.stroke();

        // Draw center shaft hole
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#2a2a2a';
        ctx.fill();
        ctx.stroke();

        // Draw selection bounding box (UI hint)
        if (isSelected) {
            ctx.beginPath();
            ctx.arc(0, 0, outerRadius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 168, 255, 0.4)';
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
    }
}
