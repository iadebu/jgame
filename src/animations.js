
function handleChestOpen(chest) {
    const isOpen = chest.hasClass("chest open");
    if (!isOpen) {
        GameManager.generateScores(false); // false for not random 
        GameManager.updateScoreboard();

        // Create a new GameObject for the open chest using characterData.items.chests[1]
        const openChestData = new GameObject('chest', characterData.items.chests[1]); // Create GameObject for the open chest

        // Change the chest image to the open chest and update the class
        chest.attr("src", openChestData.image);  // Use the image from the open chest GameObject
        chest.removeClass("chest closed").addClass(openChestData.className);  // Update class to open chest
        
        // Animate the coin when the chest is opened
        animateCoin(chest);
    }
}


function animateCoin(chest, numCoins = 1) {
    const coinData = gameObjects.coin; // Use the GameObject for the coin

    // Function to create and animate a coin
    function createCoin() {
        const coin = coinData.createElement(); // Use the createElement method from GameObject

        const chestPosition = chest.position();
        
        // Set the initial position of the coin to be on top of the chest
        coin.css({
            position: "absolute",
            left: chestPosition.left + (chest.width() / 2) - 10, // Center the coin above the chest
            top: chestPosition.top + (chest.height() / 2) - 15, // Center the coin above the chest
        });

        $(".gameArea").append(coin); // Add the coin to the game area

        // Animate the coin
        coin.animate({ top: "-=50", left: "+=" + Math.random() * 20 - 10 }, 800, function() {
            coin.fadeOut(300, function() {
                coin.remove(); // Remove the coin after the animation
            });
        });
    }

    // Animate the specified number of coins
    for (let i = 0; i < numCoins; i++) {
        // Create a new coin with a slight delay to stagger the animations
        setTimeout(createCoin, i * 300); // Add a small delay between each coin's animation
    }
}
