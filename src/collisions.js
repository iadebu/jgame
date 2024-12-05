function isColliding(element1, element2) {
    const rect1 = element1[0].getBoundingClientRect();
    const rect2 = element2[0].getBoundingClientRect();

    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}


//HERO & VILLIAN COLLITION HANDLING

function handleVillainFlameCollision(flameContainer) {
    let hitVillain = false; // Flag to check if any villain is hit
    $(".skeleton, .vampire").each(function() {
        const villain = $(this);
        if (isColliding(flameContainer, villain)) {
            let hits = villain.data("hits") || 0; 
            hits += 1; 
            villain.data("hits", hits); 

            if (hits >= 3) {
                villain.remove(); // Remove villain if hit count is 3 or more
                GameManager.updateScores(3);
            }
            hitVillain = true; // Mark that we hit a villain
            
            // Trigger the villain to defend itself (shoot at the hero)
            const heroPosition = $(".priest1").position();
            villainShoot(villain, heroPosition); // Villain shoots at hero
        }
    });
    return hitVillain; // Return whether a villain was hit
}

function handleWallCollision(flameContainer) {
    let hitWall = false; // Flag to check if flame hits a wall
    $(".tile-parent.wall").each(function() {
        const wall = $(this);
        if (isColliding(flameContainer, wall)) {
            hitWall = true; // Mark that we hit a wall
        }
    });
    return hitWall; // Return whether a wall was hit
}

let portalCooldown = false;  // Flag to manage portal cooldown
const portalCooldownTime = 2150;  // Cooldown time in milliseconds (300ms = 0.3 seconds)

function handlePortalCollision(hero) {
    // Check if the portal cooldown is active
    if (portalCooldown) {
        return false; // Don't process portal collisions if cooldown is active
    }

    const portalOut = $(".ground_portal_out"); // Check for portal out
    const portalIn = $(".ground_portal_in"); // Check for portal in
    let reverse = false; // Default is false (moving out)

    const heroPosition = hero.position();
    const portalBuffer = 50;  // Distance threshold for portal activation

    // Check for portal out collision
    if (portalOut.length && isColliding(hero, portalOut)) {
        // Check if the hero is within the portal buffer zone
        if (Math.abs(heroPosition.left - portalOut.position().left) < portalBuffer) {
            const currentGameAreaId = parseInt($(".gameArea").attr('id').replace('tilemap-', ''));
            reverse = false;
            changeTileMap(currentGameAreaId + 1, reverse); // Move to the next tilemap

            // Activate cooldown after portal usage
            portalCooldown = true;
            setTimeout(() => {
                portalCooldown = false;  // Reset cooldown after specified time
            }, portalCooldownTime);

            return true; // Transition occurred, prevent further checks
        }
    }

    // Check for portal in collision
    if (portalIn.length && isColliding(hero, portalIn)) {
        // Check if the hero is within the portal buffer zone
        if (Math.abs(heroPosition.left - portalIn.position().left) < portalBuffer) {
            const currentGameAreaId = parseInt($(".gameArea").attr('id').replace('tilemap-', ''));
            reverse = true;
            changeTileMap(currentGameAreaId - 1, reverse); // Move to the previous tilemap

            // Activate cooldown after portal usage
            portalCooldown = true;
            setTimeout(() => {
                portalCooldown = false;  // Reset cooldown after specified time
            }, portalCooldownTime);

            return true; // Transition occurred, prevent further checks
        }
    }

    return false; // No portal collision, proceed normally
}


// Function to check if there is a wall in front of the hero
function checkWallInFront(left, top, distance) {
    const walls = $(".wall"); // Select all wall elements

    // Calculate the position in front of the hero
    const frontX = left + distance; // Calculate the position in front of the hero
    const heroRight = left + distance + 10; // Hero's right side (for a small buffer)

    // Loop through all wall elements to check if any are in the way
    let isWallInFront = false;
    walls.each(function() {
        const wall = $(this);
        const wallPos = wall.position();
        const wallWidth = wall.width();

        // Check if the hero's forward position intersects with any wall
        if (frontX < wallPos.left + wallWidth && frontX + 10 > wallPos.left) { // small buffer to check for overlap
            isWallInFront = true;
            return false; // Break loop if a wall is found
        }
    });

    return isWallInFront;
}

