export async function benchmark(fn, log = false) {
    const t0 = performance.now();
    try {
        const result = await fn();
        const t1 = performance.now();
        const duration = (t1 - t0).toFixed(3) + " ms";
        if (log) {
            console.log(`Function executed in ${duration}`);
        }
        return {
            duration,
            result
        };
    } catch (error) {
        const t1 = performance.now();
        const duration = (t1 - t0).toFixed(3) + " ms";
        if (log) {
            console.error(`Function failed after ${duration}`, error);
        }
        return {
            duration,
            error
        };
    }
}
