
const GameManager = (() => {
  let bounty = 0;  // Cumulative bounty across games
  let wonBounty = 0;  // Bounty won in the current game
  let cumulativeScore = 0;  // Overall score across games
  let scorePoints = 0;  // Points scored in the current game
  let gameActive = false;
  let gameLoopId;
  let timeoutId;
  let timeLimit;
  let timeLeft;
  let heroHealth;
  let heroArmor;
  
  // Config object to hold settings loaded from JSON
  const Config = {};

  // Initialize the game with settings passed from the external function
  function initializeGameSettings(settings) {
    if (settings) {
      timeLimit = settings.timeLimit;
      timeLeft = timeLimit;

      heroHealth = settings.heroHealth;
      heroArmor = settings.heroArmor;

      Config.SCORE_INCREMENT = settings.SCORE_INCREMENT;
      Config.WON_BOUNTY_INCREMENT = settings.WON_BOUNTY_INCREMENT;
    } else {
      console.error("Game settings are not available.");
    }
  }

  // Start the game with settings from the JSON
  function startGame(settings) {
    loadCharacterData()
      .then(() => {
        initializeGameSettings(settings);

        if (!gameActive) {
          wonBounty = 0;
          scorePoints = 0;
          timeLeft = timeLimit;
          gameActive = true;

          updateScoreboard();
          $("#modal").hide();
          $(".gameArea").show();

          ItemPositioningManager.setTileMapItems(0);
          moveVillains();
          gameLoop();

          updateHeroStats();
          timeoutId = setInterval(() => {
            if (timeLeft > 0) {
              timeLeft -= 1;
              updateScoreboard();
            } else {
              endGame(false);  // Game over when time runs out
            }
          }, 1000);
        }
      });
  }

 
  function resetGame() {
    $(".gameArea").empty();
    gameActive = false;
    bounty = 0;
    scorePoints = 0;
    heroHealth = 100;  
    heroArmor = 50;   
    updateScoreboard();

    getTileMap(0, function (error, result) {
        if (error) {
            console.error("Error loading tile map:", error);
        } else {
            const { tileMap, index } = result;
            renderTileMap(tileMap, index);
            startGame();
        }
    });
    clearInterval(timeoutId);
}


  function endGame(win = false) {
    gameActive = false;
    clearInterval(timeoutId);

    if (win) {
      scorePoints += Config.SCORE_INCREMENT;
      cumulativeScore += scorePoints;
      bounty += wonBounty;
    }

    cumulativeScore += scorePoints;
    bounty += wonBounty;

    const gameData = {
      win,
      wonBounty,
      scorePoints,
      cumulativeScore,
      bounty,
    };

    $(document).trigger("gameEnded", gameData);
    cancelAnimationFrame(gameLoopId);
  }

  // Update scoreboard with the current score and bounty
  function updateScoreboard() {
    console.log("updating scores:", bounty);
    $("#currentScore").text(scorePoints);
    $("#remainingTime").text(timeLeft);
    $("#currentBounty").text(bounty);
    $("#currentArmor").text(heroArmor);
    $("#currentHealth").text(heroHealth);
  }

  // Generate random or fixed scores based on the 'random' flag
  function generateScores(random = false) {
    const score = random ? Math.floor(Math.random() * 3) + 1 : Config.SCORE_INCREMENT;
    const currentBounty = random ? Math.floor(Math.random() * 100) + 50 : Config.WON_BOUNTY_INCREMENT;
  
    scorePoints += score;
    wonBounty += currentBounty;
    bounty += currentBounty;  // Update cumulative bounty correctly
  
    updateScoreboard();
  }

  function updateScores(additionalPoints) {
    scorePoints += additionalPoints;  // Add the given points to the current score
    updateScoreboard();  // Update the scoreboard to reflect the change
  }

  // Update hero stats (health and armor)
  function updateHeroStats() {
    $("#currentHealth").text(heroHealth);
    $("#currentArmor").text(heroArmor);
  }

  // Damage the hero (reduces health or armor)
  function damageHero() {
    if (heroArmor > 0) {
      heroArmor -= 1;
      if (heroArmor < 0) {
        heroArmor = 0;
      }
    } else {
      heroHealth -= 1;
      if (heroHealth < 0) {
        heroHealth = 0;
        endGame(false);  // End game if health reaches zero
      }
    }
    updateHeroStats();
  }

  // Game loop to move the hero
  function gameLoop() {
    moveHero();
    gameLoopId = requestAnimationFrame(gameLoop);  // Continue the game loop
  }

  // Expose public methods
  return {
    startGame,
    resetGame,
    endGame,
    updateScoreboard,
    generateScores,
    updateHeroStats,
    damageHero,
    updateScores,  // Expose the new method to update score
    getGameActive: () => gameActive,
    getBounty: () => bounty,
    getScore: () => cumulativeScore,
    getHeroHealth: () => heroHealth,
    getHeroArmor: () => heroArmor,
  };
})();



