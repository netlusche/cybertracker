import confetti from 'canvas-confetti';

export const triggerNeonConfetti = (theme = 'cyberpunk') => {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
    };

    const colors = theme === 'lcars'
        ? ['#33cc99', '#ffcc33', '#dd4444', '#ff7700']
        : theme === 'matrix'
            ? ['#00ff41', '#008f11', '#003b00', '#ffffff']
            : theme === 'weyland'
                ? ['#ffb000', '#cc8400', '#885500', '#ffcc00']
                : ['#00ffff', '#ff00ff', '#39ff14'];

    function fire(particleRatio, opts) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
            colors: colors,
        });
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
};
