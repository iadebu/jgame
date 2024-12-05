

$(document).ready(function() {
    getTileMap(0, function(error, result) {
        if (error) {
            console.error("Error loading tile map:", error);
        } else {
            const { tileMap, index } = result;
            renderTileMap(tileMap, index); // Render the map with the tileMap and index
            $('.gameArea').show(); // Show the game area
        }
    });
});



$(document).ready(function () {
  fetchGameData("data/game-settings.json")
    .then((data) => {
      $("title").text(data.titles.gameTitle);
      $("#modalTitle").text(data.titles.modalTitle);

      buildWelcomeContent(data);

      if (data.ui.enableSound) {
        console.log("Sound is enabled");
      }

      if (data.ui.dark) {
        $(".modal-content").addClass("dark");
        console.log("Dark mode enabled");
      }

      return initializeScoreboard(data.scoreBoardItems);
    })
    .then(() => {
      showStartModal();
      registerButtonListeners()
    })
    .catch((error) => {
      console.error("Error loading game settings:", error);
    });

    $(document).on("gameEnded", function (event, gameData) {
      showEndModal(gameData);
    });
  
});


$(document).on("keydown", handleKeydown);   



function fetchGameData(url) {
  return new Promise((resolve, reject) => {
    $.getJSON(url, function (data) {
      if (data) {
        resolve(data);
      } else {
        reject("No data received");
      }
    }).fail(function (error) {
      reject("Error fetching JSON data: " + error);
    });
  });
}

function showStartModal() {
  $(".modal-content").append(`
      <button id="startBtn">Start Game</button>
    `);

  $("#modal").addClass("active").css("display", "flex");
}

function buildWelcomeContent(data) {
  const welcomeContent = data.titles.content || "Welcome to the game!";

  let controlsDescription = "";

  Object.keys(data.controls).forEach((key) => {
    const controlValue = data.controls[key];
    const controlLabel = key.charAt(0).toUpperCase() + key.slice(1);

    controlsDescription += `
        <p><strong>${controlLabel}:</strong> <span class="control-value">${controlValue}</span></p>
      `;
  });

  $(".modal-content").append(`
      <hr />
      <div class="descriptions">      
      <p>${welcomeContent}</p>

      <div class="controls-description">
        <h3>Game Controls</h3>
        ${controlsDescription}
      </div>
      </div>

    `);
}


function cleanModal() {
  setTimeout(() => {
      // Empty descriptions
      $(".descriptions").empty();

      // Remove any button elements inside the modal
      $(".modal button").remove(); // This will remove all <button> elements inside the modal
  }, 1000); // Delay of 1 second before cleaning
}


function initializeScoreboard(scoreBoardItems) {
  const scoreboardHtml = scoreBoardItems.map(createScoreItemHtml).join("");
  $("#scoreboard").html(scoreboardHtml);
}

function createScoreItemHtml(item) {
  const imageHtml = item.imageUrl
    ? `<img src="${item.imageUrl}" class="score-icon">`
    : "";

  return `
          <div class="score-item">
              ${imageHtml}
              <h2>${item.label}: <span id="${item.id}">${
    item.defaultValue
  }</span>${item.suffix ? ` ${item.suffix}` : ""}</h2>
          </div>
      `;
}



function showEndModal({ win, wonBounty, scorePoints }) {
  const message = win ? "Journey End!" : "Time Over!";
  $("#modalTitle").text(message);

  $(".descriptions").html(`
          <p>Bounty Collected: <span id="bounty">${wonBounty}</span></p>
          <p>Score Points: <span id="score">${scorePoints}</span></p>
          ${
            win
              ? `
              <button id="retryBtn">Play Again!</button>
          `
              : `
              <button id="retryBtn">Continue</button>
          `
          }
      `);

  $("#modal").addClass("active").css("display", "flex");
}



function handleKeydown(event) {
    event.preventDefault();

    if ($("#modal").is(":visible")) {
        if (event.which === 32 || event.target.tagName === "BUTTON") {
            handleContinueGame();
        }
    }

    if (event.which === 32) { // Spacebar pressed
        const hero = $(".priest1"); // Get the hero element
        jumpOver(hero); // Trigger the jump function
    }
}
