// $(document).on("gameEnded", function (event, gameData) {
//     showEndModal(gameData);
// });


function registerButtonListeners() {
  $(document).on("click", "#startBtn", () => {
    handleStartGame();
    cleanModal(); 
  });

  $(document).on("click", "#continueBtn", () => {
    // cleanModal()
    handleContinueGame();
  });

  $(document).on("click", "#resetBtn", () => {
    // cleanModal();
    handleResetGame();
  });

  $(document).on("click", "#retryBtn", () => {
    // cleanModal();
    handleRetryGame();
  });
}


  function handleStartGame() {
    if (!GameManager.getGameActive()) {
      // Load the game settings before starting the game
      loadGameSettings().then(settings => {
        if (settings) {
          // Start the game with the loaded settings
          GameManager.startGame(settings);
          $("#modal").removeClass("active");
          $(".gameArea").show();
        } else {
          console.error("Failed to load game settings.");
        }
      });
    } else {
      console.log("Game is already active.");
    }
  }

  function handleResetGame() {
    GameManager.resetGame();
    showStartModal();
  }
  
  function handleRetryGame() {
    GameManager.resetGame();
    // showStartModal();
  }
  

  function handleContinueGame() {
    $(".chest").remove();
    $(".vampire").remove();
    $(".skeleton").remove();
    GameManager.startGame();
    $("#modal").removeClass("active");
    GameManager.updateScoreboard();
  }







  // GameSettings.js (external function)

function loadGameSettings() {
  return $.getJSON('data/game-settings.json')
    .then(data => {
      // Return the settings object to be passed to the GameManager
      return {
        timeLimit: data.ui.timeLimit,
        heroHealth: data.player.startingHealth,
        heroArmor: data.player.startingArmor,
        SCORE_INCREMENT: data.ui.scoreIncrement,
        WON_BOUNTY_INCREMENT: data.ui.wonBountyIncrement
      };
    })
    .catch(error => {
      console.error("Error loading game settings:", error);
      return null;  // Return null if there is an error
    });
}



$(document).on("click", function (event) {
  event.preventDefault()
  if (canMove) {
    const hero = $(".priest1");
    const heroPosition = hero.position();

    const mouseX = event.pageX - $(".gameArea").offset().left;
    const mouseY = event.pageY - $(".gameArea").offset().top;

    heroShoot(
      heroPosition.left + hero.width() / 2,
      heroPosition.top + hero.height() / 2,
      mouseX,
      mouseY
    );
  }
});


