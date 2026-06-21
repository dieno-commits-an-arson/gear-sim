import { state } from '../core/state.js';

export class Solver {
    static update(deltaTime) {
        if (!state.sim.isPlaying) return;

        const gears = state.components.filter(c => c.type === 'gear');

        gears.forEach(g => {
            g.currentRpm = g.properties.isDriver ? g.properties.driverSpeed : 0;
        });

        let queue = gears.filter(g => g.properties.isDriver);
        let visited = new Set(queue.map(g => g.id));

        while (queue.length > 0) {
            let current = queue.shift();

            gears.forEach(other => {
                if (!visited.has(other.id)) {
                    
                    if (current.properties.axleId === other.properties.axleId) {
                        other.currentRpm = current.currentRpm;
                        other.rotation = current.rotation; 
                        
                        visited.add(other.id);
                        queue.push(other);
                        return;
                    }

                    const dx = other.x - current.x;
                    const dy = other.y - current.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const targetDist = current.properties.radius + other.properties.radius;

                    if (Math.abs(dist - targetDist) <= 1.0) {
                        
                        // MECHANICAL UPDATE: Gear ratio based strictly on teeth
                        const ratio = current.properties.teeth / other.properties.teeth;
                        
                        // Propagate speed in reverse direction
                        other.currentRpm = current.currentRpm * -ratio;

                        visited.add(other.id);
                        queue.push(other);
                    }
                }
            });
        }

        const secondsPassed = deltaTime / 1000;
        gears.forEach(g => {
            if (g.currentRpm !== 0) {
                const radiansPerSec = g.currentRpm * (Math.PI / 30);
                g.rotation += radiansPerSec * secondsPassed;
            }
        });
    }
}
