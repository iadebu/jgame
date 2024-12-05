class GameObject {
    constructor(type, properties) {
      this.type = type; // Type of object (e.g., 'chest', 'vampire', etc.)
      this.className = properties.className;
      this.image = properties.image; // Image URL
      this.health = properties.health || null;
      this.damage = properties.damage || null;
      this.speed = properties.speed || null;
      this.abilities = properties.abilities || [];
    }
  
    // Method to create the DOM element for this object (using img instead of div)
    createElement() {
      const element = $('<img>', { 
        class: this.className,  // Set the class for the image
        src: this.image,        // Set the image URL
        alt: this.type,         // Set an alt description for accessibility
      });
      element.css({
        'position': 'absolute', // Position it absolutely in the game area
      });
      return element;
    }
  }
  
  let characterData = null;  // Placeholder for the character data
  let gameObjects = {};  // Declare globally
  // Load the character data from a JSON file and populate characterData
  function loadCharacterData() {
    return $.getJSON('data/characters.json')  // Change this path to match your actual JSON file location
      .then(data => {
        
        characterData = data;  // Store the loaded data
        gameObjects.flame = new GameObject('flame', characterData.items.flame);
        gameObjects.arrow = new GameObject('arrow', characterData.items.arrow);
        gameObjects.coin = new GameObject('coin', characterData.items.coin);
      })
      .catch(error => {
        console.error("Error loading character data:", error);
      });
  }
  
  const ItemPositioningManager = (() => {
    // Function to set the tile map and position items based on the map data
    function setTileMapItems(mapNumber) {
      const map = mapData[mapNumber];
  
      // Iterate over all available methods (e.g., setPositionMultipleItems, setPositionRandomly)
      for (const method in map) {
        if (map.hasOwnProperty(method)) {
          const items = map[method]; // Array of item data (index, count, etc.)
  
          // Call the appropriate positioning method dynamically
          items.forEach(item => {
            // Retrieve the item data from characterData based on the index
            let itemData = null;
  
            // Checking for different item types in the data
            if (item.index !== undefined) {
              if (item.index === 0) {  // Hero
                itemData = characterData.hero;
              } else if (item.index === 1) {  // Chest
                itemData = characterData.items.chests[0];  // Assuming chest closed
              } else if (item.index === 2) {  // Skeleton
                itemData = characterData.enemies.skeletons[0];  // Assuming Skeleton basic
              } else if (item.index === 3) {  // Vampire
                itemData = characterData.enemies.vampires[0];  // Assuming Vampire basic
              }
            }
  
            if (!itemData) {
              console.warn("No character data for index:", item.index);
              return;
            }
  
            // Create a new GameObject from the character data
            const gameObject = new GameObject(itemData.type, itemData);
  
            // Use the correct positioning method
            if (method === 'setPositionMultipleItems') {
              Positioning.setPositionMultipleItems(gameObject, item.count);
            } else if (method === 'setPositionRandomly') {
              Positioning.setPositionRandomly(gameObject);
            } else if (method === 'setPosition') {
              Positioning.setPosition(gameObject);
            } else if (method === 'placeHeroAtEntry') {
                console.log(item.index)
              Positioning.placeHeroAtEntry(gameObject, item.index);
            }
          });
        }
      }
    }
  
    return {
      setTileMapItems: setTileMapItems
    };
  })();
  
  // Initial positions for items and the hero
  const initialPositions = {
    6: { left: 100, top: 400 }, 
    0: { left: 1750, top: 400 }, 
  };
  
  // Hero-specific positions for entry and exit
  const heroPositions = {
    entry: { 
      0: { left: 68.51, top: 411.06 }, 
      1: { left: 100, top: 400 }, 
      2: { left: 100, top: 400 }, 
      3: { left: 100, top: 400 }, 
      4: { left: 100, top: 400 }, 
    },
    exit: { 
      0: { left: 1750, top: 400 }, 
      1: { left: 1750, top: 400 },
      2: { left: 1750, top: 400 },
      3: { left: 1750, top: 400 },
      4: { left: 1750, top: 400 },
    },
  };
  
    const mapData = {
      0: {
        placeHeroAtEntry:[
          { index: 0},  // Hero
        ],
        setPositionMultipleItems: [      
          { index: 1 },  // chest closed
          { index: 2, count: 4 },  // Skeletons
          { index: 3, count: 3 }   // Vampires
        ],
      },
      1: {
        setPositionMultipleItems: [
          { index: 1, count: 2 },  // chests closed
          { index: 2, count: 2 },  // Skeletons
          { index: 3, count: 6 }   // Vampires
        ],
      },
      2: {
        setPositionMultipleItems: [
          { index: 1,  count: 8},  // chests closed
          { index: 2, count: 5 },  // Skeletons
          { index: 3, count: 5 }   // Vampires
        ],
      },
      3: {
        setPositionMultipleItems: [
          { index: 1,count: 2 },  // chests closed
          { index: 2,count: 3},  // Skeletons
          { index: 3,count: 4}   // Vampires
        ],
      },

      4: {
        setPositionMultipleItems: [
          { index: 1,count: 1 },  // chests closed
          { index: 2,count: 10},  // Skeletons
          { index: 3,count: 9}   // Vampires
        ],
      }
  
    };
  

  const Positioning = (() => {
    const tileSize = 50;

    // Refactored getWalkablePosition (used for both validation and nearest position calculation)
    function getWalkablePosition(left, top, width, height, padding = 0, validateOnly = false) {
        const walkableTiles = $(".tile-parent.walk"); // Query the walkable tiles once
        let nearestPosition = { left, top }; // Default to the current position
        let isWalkable = false;
        let minDistance = Infinity;

        walkableTiles.each(function () {
            const tile = $(this);
            const tilePosition = tile.position();
            const tileWidth = tile.width();
            const tileHeight = tile.height();

            // Check for overlap with the walkable tile, including padding
            const isOverlap = left + padding < tilePosition.left + tileWidth && // Left side with padding
                left + width - padding > tilePosition.left && // Right side with padding
                top + padding < tilePosition.top + tileHeight && // Top side with padding
                top + height - padding > tilePosition.top; // Bottom side with padding

            if (isOverlap) {
                isWalkable = true;
                if (validateOnly) {
                    return false; // Stop searching if it's just for validation
                }
            }

            // If not walkable, calculate the nearest walkable position
            const distX = left - tilePosition.left;
            const distY = top - tilePosition.top;
            const distance = Math.sqrt(distX * distX + distY * distY);

            // Track the closest tile (smallest distance)
            if (distance < minDistance) {
                minDistance = distance;
                nearestPosition = { left: tilePosition.left, top: tilePosition.top };
            }
        });

        // Return either validation result (true/false) or nearest position if needed
        return validateOnly ? isWalkable : nearestPosition;
    }

    // General function to set the position of an element
    function setElementPosition(element, position) {
        element.css({
            left: position.left,
            top: position.top,
            position: 'absolute'
        }).show();
    }

    // Function to set predefined position for any item (now passed as an existing element)
    function setPosition(gameObject) {
        const predefinedPosition = initialPositions[gameObject.type];
        if (!predefinedPosition) {
            console.warn("No predefined position for item type:", gameObject.type);
            return;
        }

      
        if (getWalkablePosition(predefinedPosition.left, predefinedPosition.top, tileSize, tileSize, 0, true)) {
            setElementPosition(gameObject.createElement(), predefinedPosition);
        } else {
            console.warn(`Position for item type ${gameObject.type} is not valid!`);
        }
    }

    // Function to set position for multiple items at random positions
    function setPositionMultipleItems(gameObject, itemCount) {
        const numberOfItems = itemCount > 0 ? itemCount : Math.floor(Math.random() * 9) + 2; // Random between 2 and 10
        const gameArea = $('.gameArea');

        for (let i = 0; i < numberOfItems; i++) {
            let position;
            let validPosition; // Variable to track position validity

            // Create the item element once before positioning
            const element = gameObject.createElement();

            // Add the item to the game area
            $('.gameArea').append(element);

            // Find a valid position for the item
            do {
                const x = Math.random() * (gameArea.width() - tileSize);
                const y = Math.random() * (gameArea.height() - tileSize);
                position = { left: x, top: y };

                validPosition = getWalkablePosition(x, y, tileSize, tileSize, 0, true);
            } while (!validPosition); // Repeat until a valid position is found

            // Position the item element
            setElementPosition(element, position);
        }
    }

    // Function to place any item at a random position
    function setPositionRandomly(gameObject) {
        const gameArea = $('.gameArea');
        const element = gameObject.createElement();

        let position;
        let validPosition;

        // Add the item to the game area
        $('.gameArea').append(element);

        // Find a valid position for the item
        do {
            const x = Math.random() * (gameArea.width() - tileSize);
            const y = Math.random() * (gameArea.height() - tileSize);
            position = { left: x, top: y };

            validPosition = getWalkablePosition(x, y, tileSize, tileSize, 0, true);
        } while (!validPosition); // Repeat until a valid position is found

        // Position the item element
        setElementPosition(element, position);
    }

    function placeHero(gameObject, mapIndex, positionType) {
        const position = heroPositions[positionType][mapIndex];

        // Ensure hero data is correctly passed as a GameObject
        if (!(gameObject instanceof GameObject)) {
            console.error("The provided gameObject is not an instance of GameObject");
            return;
        }

        const heroElement = gameObject.createElement();

        if (getWalkablePosition(position.left, position.top, tileSize, tileSize, 0, true)) {
            // Append the hero element to the game area
            $('.gameArea').append(heroElement);

            // Position it correctly
            setElementPosition(heroElement, position);
            console.log(`Placing hero at ${positionType}: ${position.left}, ${position.top}`);
        } else {
            console.warn(`Invalid ${positionType} position for hero at map index ${mapIndex}`);
        }
    }

    return {
        setPosition,
        setPositionRandomly,
        setPositionMultipleItems,
        getWalkablePosition,
        placeHeroAtEntry: (gameObject, mapIndex) => placeHero(gameObject, mapIndex, 'entry'),
        placeHeroAtExit: (gameObject, mapIndex) => placeHero(gameObject, mapIndex, 'exit'),
    };
})();

  