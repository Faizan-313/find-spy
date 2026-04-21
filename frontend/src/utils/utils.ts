export const getAvatarColor = (index: number) => {
    const palette = [
        { from: "#00ff64", to: "#00cc50" },
        { from: "#ff4444", to: "#cc2222" },
        { from: "#ffaa00", to: "#cc8800" },
        { from: "#00aaff", to: "#0077cc" },
        { from: "#aa44ff", to: "#7722cc" },
        { from: "#ff6600", to: "#cc4400" },
        { from: "#00ffcc", to: "#00ccaa" },
        { from: "#ff0088", to: "#cc0066" },
    ];
    return palette[index % palette.length];
};

export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const nowTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

import confetti from "canvas-confetti";

export const fireConfetti = () => {
    const duration = 2500;
    const end = Date.now() + duration;
    const colors = ["#00ff64", "#ffffff", "#1ec6af", "#ffaa00"];
    (function frame() {
        confetti({
            particleCount: 4,
            angle: 60,
            spread: 70,
            origin: { x: 0, y: 0.7 },
            colors,
        });
        confetti({
            particleCount: 4,
            angle: 120,
            spread: 70,
            origin: { x: 1, y: 0.7 },
            colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
    })();
};