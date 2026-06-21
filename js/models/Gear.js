import { generateUUID } from '../core/state.js';

export class Gear {
    constructor(x, y, radius = 40, teeth = 12) {
        this.id = generateUUID();
        this.type = 'gear';
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.currentRpm = 0; 
        
        this.properties = {
            radius: radius,
            teeth: teeth,
            color: '#6c757d',
            isDriver: false,
            driverSpeed: 60,
            
            // NEW: Physics binding ID for stacked gears
            axleId: generateUUID() 
        };
        
        this.connections = [];
    }

    isPointInside(px, py) {
        const dx = px - this.x;
        const dy = py - this.y;
        return (dx * dx + dy * dy) <= Math.pow(this.properties.radius + 8, 2);
    }

    render(ctx, isSelected = false) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const { radius, teeth, color, isDriver } = this.properties;
        const toothDepth = 8;
        const outerRadius = radius + toothDepth;
        const innerRadius = radius;

        ctx.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
            const angle = (i * Math.PI) / teeth;
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();

        ctx.fillStyle = isDriver ? '#d4a373' : color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = isSelected ? '#00a8ff' : '#495057';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#2a2a2a';
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(radius * 0.8, 0);
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 3;
        ctx.stroke();

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
