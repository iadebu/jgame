function calculateAngleAndSpeed(targetY, startY, targetX, startX, speed) {
    const angle = Math.atan2(targetY - startY, targetX - startX);
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    return { velocityX, velocityY, angle };
}



function getRamdomPosition() {
    const offsetX = Math.floor(Math.random() * 20) - 10; // Random value between -10 and 10
    const offsetY = Math.floor(Math.random() * 20) - 10; // Random value between -10 and 10
    return { offsetX, offsetY };
}
