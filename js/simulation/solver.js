import { state } from '../core/state.js';

export class Solver {
    static update(deltaTime) {
        if (!state.sim.isPlaying) return;

        const gears = state.components.filter(c => c.type === 'gear');

        // 1. Reset all speeds to 0 before calculating
        gears.forEach(g => {
            g.currentRpm = g.properties.isDriver ? g.properties.driverSpeed : 0;
        });

        // 2. Build connection graph and propagate RPM
        // Breadth-First Search starting from all Driver gears
        let queue = gears.filter(g => g.properties.isDriver);
        let visited = new Set(queue.map(g => g.id));

        while (queue.length > 0) {
            let current = queue.shift();

            gears.forEach(other => {
                if (!visited.has(other.id)) {
                    // Check if gears are meshed (touching)
                    const dx = other.x - current.x;
                    const dy = other.y - current.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const targetDist = current.properties.radius + other.properties.radius;

                    // Allow a 1px tolerance for floating point math
                    if (Math.abs(dist - targetDist) <= 1.0) {
                        // Apply Mechanical Gear Ratio Formula
                        const ratio = current.properties.radius / other.properties.radius;
                        other.currentRpm = current.currentRpm * -ratio;

                        visited.add(other.id);
                        queue.push(other);
                    }
                }
            });
        }

        // 3. Apply angular rotation to all gears based on deltaTime
        const secondsPassed = deltaTime / 1000;
        gears.forEach(g => {
            if (g.currentRpm !== 0) {
                // Convert RPM to Radians per second: RPM * (2PI / 60)
                const radiansPerSec = g.currentRpm * (Math.PI / 30);
                g.rotation += radiansPerSec * secondsPassed;
            }
        });
    }
}
