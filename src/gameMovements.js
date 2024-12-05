
// Hero Controls
let canMove = true; // Flag to control movement
const moveDistance = 12;
let keysPressed = {};

$(document).on("keydown", function(event) {
    // Capture W, A, S, D keys
    if ([87, 65, 83, 68].includes(event.which)) { // W, A, S, D
        keysPressed[event.which] = true;
    }
});

$(document).on("keyup", function(event) {
    // Release keys when lifted
    if ([87, 65, 83, 68].includes(event.which)) { // W, A, S, D
        keysPressed[event.which] = false;
    }
});

function heroContorls(newPosition, heroPosition, hero) {
    if (keysPressed[65]) { // A (Left)
        newPosition.left = Math.max(0, heroPosition.left - moveDistance);
        hero.addClass("flipped");
    }
    if (keysPressed[87]) { // W (Up)
        newPosition.top = Math.max(0, heroPosition.top - moveDistance);
    }
    if (keysPressed[68]) { // D (Right)
        newPosition.left = Math.min($(".gameArea").width() - hero.width(), heroPosition.left + moveDistance);
    }
    if (keysPressed[83]) { // S (Down)
        newPosition.top = Math.min($(".gameArea").height() - hero.height(), heroPosition.top + moveDistance);
    }
}


// HERO & VILLIAN MOVEMENT
// Function to handle hero movement
function moveHero() {
    if (!GameManager.getGameActive() || !canMove) {
        return;
    }



    const hero = $(".priest1");
    const chests = $(".chest ");
    const otherItems = $(".skeleton, .vampire ");
    const walls = $(".wall"); // Select all wall elements
    const groundEnds = $(".ground_end");
    let heroPosition = hero.position();

    hero.removeClass("flipped");

    // Calculate potential new position
    let newPosition = { left: heroPosition.left, top: heroPosition.top };

    // Hero movement controls using WASD
    heroContorls(newPosition, heroPosition, hero);


    // Check if the new position is walkable (validation mode)
    if (!Positioning.getWalkablePosition(newPosition.left, newPosition.top, hero.width(), hero.height(), 15, true)) {
        return; // Prevent movement if not on a walkable tile
    }

    // Check for collisions with chests
    chests.each(function () {
        const chest = $(this);
        if (isColliding(hero, chest)) {
            handleChestOpen(chest);
            preventOverlap(hero, chest, newPosition);
        }
    });

    // Check for collisions with other items (skeletons and vampires)
    otherItems.each(function () {
        const item = $(this);
        if (isColliding(hero, item)) {
            preventOverlap(hero, item, newPosition, 5); 
            GameManager.damageHero(); // Apply damage when colliding with a villain
        }
    });

    groundEnds.each(function () {
        const groundEnd = $(this);
        if (isColliding(hero, groundEnd)) {
            handleGameEnd(); // Trigger game end logic
            return false; // Stop the loop, game is over
        }
    });


    if (handlePortalCollision(hero)) {
        return; // If a portal was used, prevent further processing in this frame
    }
    // Move the hero to the adjusted position
    hero.css({ left: newPosition.left, top: newPosition.top });
}

// Function to handle villians movement
function moveVillains() {
    const villains = $(".skeleton, .vampire"); // Get all villains (skeletons and vampires)
    const hero = $(".priest1"); // Select the hero
    const heroPosition = hero.position(); // Get the hero's position

    villains.each(function() {
        const villain = $(this);
        const originalPosition = villain.position();

        // Randomly generate new positions within a small range (simulating movement)
        const { offsetX, offsetY } = getRamdomPosition(); // Random value between -10 and 10

        // Calculate new position
        const newPosition = {
            left: Math.max(0, Math.min($(".gameArea").width() - villain.width(), originalPosition.left + offsetX)),
            top: Math.max(0, Math.min($(".gameArea").height() - villain.height(), originalPosition.top + offsetY))
        };

        // Animate to the new position
        villain.animate(newPosition, 800, function() {
            // After the animation completes, try to shoot
            tryVillainShoot(villain, heroPosition);
            // Call moveVillains again to create an ongoing loop
            setTimeout(moveVillains, 100); // Adjust the delay as needed
        });
    });
}


// HERO & VILLIAN SHOOTING
// Function to handle flame shooting (Hero shooting flames)
function heroShoot(startX, startY, targetX, targetY) {
    // const flameData = characterData.items.flame; // Get flame data from characterData
    const flameData = gameObjects.flame; // Get the pre-created flame GameObject

    // Call the generalized shootItem function with flame-specific data and collision callback
    shootItem(
        startX, startY, targetX, targetY, 
        flameData, 5, // speed: 5 for flame
        (flameContainer) => {
            return handleVillainFlameCollision(flameContainer) || handleWallCollision(flameContainer);
        },
        3000,  // Max lifetime: 3 seconds
        1000   // Max distance: 1000 pixels
    );
}

// Function to handle arrow shooting (Villain shooting arrows)
function villainShoot(villain, heroPosition) {
    const villainPosition = villain.position();
    // const arrowData = characterData.items.arrow; // Get arrow data from characterData
    const arrowData = gameObjects.arrow; // Get the pre-created arrow GameObject

    // Call the generalized shootItem function with arrow-specific data and collision callback
    shootItem(
        villainPosition.left + villain.width() / 2, // Start position of the arrow
        villainPosition.top + villain.height() / 2, 
        heroPosition.left, heroPosition.top, 
        arrowData, 6, // speed: 6 for arrow
        (arrowContainer) => {
            // Check for collision with walls or the hero
            const hitWall = handleWallCollision(arrowContainer);
            if (hitWall) return true; // Arrow hit a wall

            const hero = $(".priest1"); // Get the hero element
            if (isColliding(arrowContainer, hero)) {
                GameManager.damageHero();  // Apply damage to the hero
                return true;  // Arrow hit the hero
            }

            return false; // No collision
        },
        5000,  // Max lifetime: 5 seconds for arrows
        1500   // Max distance: 1500 pixels for arrows
    );
}

let villainCooldowns = {}; // Store cooldowns for each villain to avoid multiple active intervals
let villainCooldownTimers = {}; // Store timers to clear intervals if needed

// Function to manage villains shooting at the hero consider proximity
function tryVillainShoot(villain, heroPosition) {
    const villainId = villain.attr('id'); // Get the villain ID
    const villainPosition = villain.position();

    // Calculate the distance between the villain and the hero
    const distanceToHero = Math.sqrt(
        Math.pow(villainPosition.left - heroPosition.left, 2) + Math.pow(villainPosition.top - heroPosition.top, 2)
    );

    // If the villain is within shooting range (e.g., 200px), attempt to shoot
    if (distanceToHero < 200) {
        // Check cooldown for the villain
        if (!villainCooldowns[villainId] || villainCooldowns[villainId] <= 0) {
            villainShoot(villain, heroPosition); // Shoot at the hero
            
            // Set a cooldown for the villain after shooting
            const randomCooldown = Math.floor(Math.random() * (5000 - 3000 + 1)) + 1000; // Between 1-3 seconds
            villainCooldowns[villainId] = randomCooldown;

            // Reduce the cooldown over time
            setTimeout(() => {
                villainCooldowns[villainId] = 0; // Reset the cooldown to allow the villain to shoot again
            }, randomCooldown);
        }
    }
}

function shootItem(startX, startY, targetX, targetY, itemObject, speed, collisionCallback, maxLifetime = 3000, maxDistance = 1000) {
    let canMove = true;

    // Create container for the projectile
    const container = $("<div></div>").css({
        position: "absolute",
        left: startX,
        top: startY,
        transformOrigin: "center"
    });

    // Use the GameObject's createElement method to get the item element (flame or arrow)
    const itemElement = itemObject.createElement();

    // Append the item to its container and the container to the game area
    container.append(itemElement);
    $(".gameArea").append(container);

    // Calculate the angle and speed
    const { velocityX, velocityY, angle } = calculateAngleAndSpeed(targetY, startY, targetX, startX, speed);

    // Track time and distance traveled
    let startTime = Date.now();
    let totalDistanceTraveled = 0;

    // Function to move the projectile
    function moveItem() {
        const currentPosition = container.position();
        const newX = currentPosition.left + velocityX;
        const newY = currentPosition.top + velocityY;

        // Calculate distance traveled so far
        totalDistanceTraveled += Math.sqrt(velocityX * velocityX + velocityY * velocityY);

        container.css({
            left: newX,
            top: newY
        });

        // Rotate the item (e.g., flame or arrow) based on the movement angle
        itemElement.css({
            transform: `rotate(${angle * (180 / Math.PI)}deg)`,
            transformOrigin: "center"
        });

        // Check for collision using the provided callback (e.g., handleVillainFlameCollision)
        if (collisionCallback(container)) {
            container.remove(); // Remove the item on collision
            canMove = true;  // Allow further movement actions (if needed)
            return; // Stop moving
        }

        // Check if the projectile has exceeded its max lifetime or distance
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime > maxLifetime || totalDistanceTraveled > maxDistance) {
            container.remove(); // Remove the item after max lifetime or max distance
            return; // Stop moving
        }

        // Continue moving the projectile if it's within bounds
        if (canMove) {
            requestAnimationFrame(moveItem);
        }
    }

    // Start moving the projectile
    moveItem();
}

// Refactored preventOverlap function
function preventOverlap(hero, object, newPosition, buffer = 0) {
    const objectPosition = object.position();
    const objectWidth = object.width();
    const objectHeight = object.height();

    // Check if there is a collision between the hero and the object
    if (isColliding(hero, object)) {
        // Adjust hero's new position to prevent overlap
        if (newPosition.left + hero.width() > objectPosition.left && newPosition.left < objectPosition.left + objectWidth) {
            if (newPosition.top < objectPosition.top) { // Hero is above the object
                newPosition.top = objectPosition.top - hero.height() - buffer;
            } else { // Hero is below the object
                newPosition.top = objectPosition.top + objectHeight + buffer;
            }
        } else if (newPosition.top + hero.height() > objectPosition.top && newPosition.top < objectPosition.top + objectHeight) {
            if (newPosition.left < objectPosition.left) { // Hero is to the left of the object
                newPosition.left = objectPosition.left - hero.width() - buffer;
            } else { // Hero is to the right of the object
                newPosition.left = objectPosition.left + objectWidth + buffer;
            }
        }
    }

    // Ensure the hero's new position is on a walkable tile
    const walkablePosition = Positioning.getWalkablePosition(newPosition.left, newPosition.top, hero.width(), hero.height());

    // If the position is not walkable, adjust to the nearest walkable position
    if (walkablePosition !== true) {
        newPosition = walkablePosition;
    }

    return newPosition;
}

function jumpOver(hero) {
    const jumpHeight = 100; // How high the hero jumps (adjust as needed)
    const jumpDistance = 100; // How far the hero moves horizontally during the jump (adjust as needed)
    const heroPosition = hero.position(); // Get the current position of the hero

    // Check if there is a wall in front of the hero in the direction of the jump
    const isWallInFront = checkWallInFront(heroPosition.left, heroPosition.top, jumpDistance);

    // Define the animation properties
    let jumpProperties = {
        top: `-=${jumpHeight}px`, // Move hero up by jumpHeight
    };

    // If there's no wall in front, also move the hero horizontally
    if (!isWallInFront) {
        jumpProperties.left = `+=${jumpDistance / 2}px`; // Move hero forward during the jump up
    }

    // Start the jump animation
    hero.animate(
        jumpProperties,  // Apply either vertical-only or vertical + horizontal jump
        300, // Time for the jump motion
        "swing", // Animation easing function
        function() {
            // After the jump (downward motion), check if we need to update the position
            if (!isWallInFront) {
                // If no wall in front, update to the nearest walkable position
                let newPosition = Positioning.getWalkablePosition(hero.position().left, hero.position().top, hero.width(), hero.height(), 0, false);
                hero.css({ left: newPosition.left, top: newPosition.top });
            } else {
                // If there is a wall, reset to the original position (no horizontal movement)
                hero.css({ left: heroPosition.left, top: heroPosition.top });
            }
        }
    );
}


// Function to handle the game end
function handleGameEnd() {
    // End the game logic here
    // alert("Game Over! You've reached the end.");
    GameManager.endGame(true); // Trigger the end game with a loss (false)
}