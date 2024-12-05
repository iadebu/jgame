function getTileMap(index, callback) {
    $.getJSON('data/tile-maps.json', function(data) {
        if (data && data.tileMaps && index >= 0 && index < data.tileMaps.length) {
            callback(null, { tileMap: data.tileMaps[index], index: index });
        } else {
            console.warn("Tile map index out of range:", index);
            callback("Tile map index out of range", null);
        }
    }).fail(function(jqxhr, textStatus, error) {
        console.error("Failed to load tile maps:", textStatus, error);
        callback("Failed to load tile maps", null);
    });
}


// Define constants
const tileSize = 17;
const zoomFactor = 4.03; 
const tileSheetSrc = './assets/images/Dungen_Tiles_2.png'; 

// Define offsets for clarity
const backgroundOffsetX = -1; 
const backgroundOffsetY = -1; 
const scaleAdjustment = 0.55; 

const tileCount = 23; 
const tileHeight = tileSize; 

// Append the tile sheet image to the game area
const tileSheet = $('<img/>').attr('src', tileSheetSrc).css({ display: 'none' });
$('.gameArea').append(tileSheet);

// Function to render the tile map
function renderTileMap(tileMap, index) {
    // Set the ID of the game area based on the index
    $(".gameArea").attr('id', `tilemap-${index}`);

    $(".gameArea").empty(); // Clear the game area before rendering new tiles

    tileMap.forEach((row, rowIndex) => {
        row.forEach((tileName, colIndex) => {
            const tileIndex = tileIndexMap[tileName]; // Look up index based on tile name

            // Create a parent div for each tile with the tile type as a class
            const tileParent = $('<div class="tile-parent"></div>').addClass(tileName).css({
                background: '#000', 
                position: 'absolute',
                left: colIndex * tileSize * zoomFactor,
                top: rowIndex * tileSize * zoomFactor,
                width: tileSize * zoomFactor,
                height: tileSize * zoomFactor,
                overflow: 'hidden', 
                zIndex: -1,
            });

            if (tileName.includes("wall")) {
                tileParent.addClass("wall"); 
            }

            // Add "ground" class if tile name includes "ground"
            if (tileName.includes("ground")) {
                tileParent.addClass("walk"); // Add both "ground" and "walk" classes
            }

            // Calculate the correct background position with offsets
            const backgroundX = -((tileIndex % tileCount) * tileSize) + backgroundOffsetX;
            const backgroundY = -Math.floor(tileIndex / tileCount) * tileHeight + backgroundOffsetY;

            // Create a child div for the tile itself
            const tile = $('<div class="tile"></div>').css({
                width: tileSize,
                height: tileSize,
                background: `url(${tileSheetSrc})`,
                backgroundPosition: `${backgroundX}px ${backgroundY}px`,
                transform: `scale(${zoomFactor + scaleAdjustment})`,
                transformOrigin: 'top left',
            });

            // Append tile to its parent
            tileParent.append(tile);
            // Append parent to game area
            $('.gameArea').append(tileParent);
        });
    });
}

function changeTileMap(mapNumber, reverse) {
    getTileMap(mapNumber, function(error, result) {
        if (error) {
            console.error("Error loading tile map:", error);
            return; // If there's an error, exit early
        }

        const { tileMap, index } = result; // Get the tileMap and index
        renderTileMap(tileMap, index); // Re-render the map
        console.log(mapNumber)
        const heroObject = new GameObject(characterData.hero.type, characterData.hero);
        // Positioning.placeHeroAtEntry(heroObject, mapNumber);  // Place hero at entry manually
        ItemPositioningManager.setTileMapItems(mapNumber); // Update items based on the new map
        
        if (reverse) {
       
            Positioning.placeHeroAtExit(heroObject,mapNumber); // Move hero to exit
           
        } else {
            Positioning.placeHeroAtEntry(heroObject,mapNumber); // Move hero to entry
       
        }

        moveVillains(); // Animate villains
    });
}

const tileIndexMap = {
    // Ground Tiles
    ground_1: 0,   // ground exterior
    ground_2: 23,  // ground center left
    ground_3: 24,  // ground top
    ground_4: 25,  // ground center
    ground_5: 46,  // ground left
    ground_6: 47,  // ground center
    ground_7: 48,  // ground right
    ground_8: 70,  // ground bottom
    ground_9: 69,  // ground center bottom left
    ground_10: 71, // ground center bottom right
    ground_11: 72, // ground wall center right
    ground_12: 74, // ground wall center left
    ground_13: 95, // ground wall right
    ground_14: 97, // ground wall left
    ground_15: 96, // ground center rust
    ground_16: 73, // ground center rust
    ground_17: 141,// ground rust 1
    ground_18: 142,// ground rust 2
    ground_19: 164,// ground rust 3
    ground_20: 165,// ground rust 4
    ground_21: 119,// ground center bottom left rust
    ground_22: 187, // wood ground right
    ground_23: 188, // wood ground center
    ground_24: 189, // wood ground left
    ground_25: 233, // wood ground 1
    ground_26: 234, // wood ground 2
    ground_27: 256, // wood ground 3
    ground_28: 257, // wood ground 4

    border_3: 24,
    border_2: 23,
    border_4:25,
    border_5:46,
    border_9:69,
    border_8:70,
    border_1:0,
    ground_end: 96,


    ground_portal_in: 234, // wood ground 2
    ground_portal_out: 234, // wood ground 2
    
    // Wall Tiles
    fence_exterior:1,
    fence_interior:2,
    wall_1: 3,   // wall 1
    wall_2: 4,   // wall 2
    wall_3: 5,   // wall 3
    wall_4: 19,  // wall front
    wall_5: 42,  // wall gap
    wall_6: 26,  // wall center 1
    wall_7: 28,  // wall center 2
    wall_8: 49,  // wall center 3
    wall_9: 50,  // wall 4
    wall_10: 51, // wall 5
    wall_11: 261,// wall 11
    wall_12: 215,// wall 215
    wall_13: 218,// wall 218
    wall_14: 307,// wall 9
    wall_15: 310,// wall 6
    wall_16: 399,// wall 10
    wall_17: 402,// wall 12
    wall_18: 192,// wall top
    wall_19: 287,// wall top 1
    wall_20: 376,// wall top 2
    wall_21: 379,// wall top 3
    wall_22: 121,// wall column 121
    wall_23: 144,// wall column 144

    wall_rotate: 50,
    // Door Tiles
    door_1: 20,    // door left
    door_2: 21,    // door right
    door_3: 43,    // door 043
    door_4: 44,    // door 044
    door_5: 66,    // door left 1
    door_6: 67,    // door right 1
    door_7: 89,    // door left 2
    door_8: 90,    // door right 2
    gate_1: 193,   // gate left top
    gate_2: 194,   // gate right top
    gate_3: 216,   // gate left closed
    gate_4: 217,   // gate right closed
    gate_5: 262,   // gate left
    gate_6: 263,   // gate right
    gate_7: 308,   // gate left 1
    gate_8: 309,   // gate right 1
    gate_9: 378, // gate open left ground
    gate_10: 377, // gate open right ground
    gate_11: 354, // gate open left ground 1
    gate_12: 355, // gate open right ground 1
    gate_13: 400, // gate no door left ground
    gate_14: 401, // gate no door right ground

    // Corridor Tiles
    corridor_ground_1: 6,
    corridor_ground_2: 7,
    corridor_ground_3: 8,
    corridor_ground_4: 9,
    corridor_ground_5: 10,
    corridor_ground_6: 11,
    corridor_ground_7: 12,
    corridor_ground_8: 29,
    corridor_ground_9: 30,
    corridor_ground_10: 32,
    corridor_ground_11: 34,
    corridor_ground_12: 35,
    corridor_ground_13: 52,
    corridor_ground_14: 53,
    corridor_ground_15: 54,
    corridor_ground_16: 55,
    corridor_ground_17: 56,
    corridor_ground_18: 57,
    corridor_ground_19: 58,
    corridor_ground_20: 75,
    corridor_ground_21: 76,
    corridor_ground_22: 77,
    corridor_ground_23: 78,
    corridor_ground_24: 79,
    corridor_ground_25: 80,
    corridor_ground_26: 81,
    corridor_ground_27: 98,
    corridor_ground_28: 99,
    corridor_ground_29: 100,
    corridor_ground_30: 101,
    corridor_ground_31: 102,
    corridor_ground_32: 103,
    corridor_ground_33: 104,
    corridor_ground_34: 122,
    corridor_ground_35: 123,
    corridor_ground_36: 124,
    corridor_ground_37: 125,
    corridor_ground_38: 126,
    corridor_ground_39: 127,
    corridor_ground_40: 146,
    corridor_ground_41: 147,
    corridor_ground_42: 148,
    corridor_ground_43: 149,
    corridor_ground_44: 150,
    corridor_ground_45: 167,
    corridor_ground_46: 169,
    corridor_ground_47: 170,
    corridor_ground_48: 171,
    corridor_ground_49: 172,
    corridor_ground_50: 173,
    corridor_ground_51: 190,
    corridor_ground_52: 191,
    corridor_ground_53: 213,
    corridor_ground_54: 219,
    
    // Shield Tiles
    shield_Y: 13,
    shield_036: 36,
    shield_B: 59,
    shield_R: 82,
    
    // Sword Tiles
    sword_wood: 14,
    sword_metal: 37,
    sword_gold: 60,
    sword_diamond: 83,
    sword_red: 106,
    
    // Jewel Tiles
    jewel_088: 88,
    jewel_111: 111,
    jewel_134: 134,
    jewel_157: 157,
    jewel_180: 180,
    jewel_203: 203,
    jewel_226: 226,
    jewel_249: 249,
    jewel_272: 272,
    jewel_295: 295,
    jewel_318: 318,
    wall_341: 341,

    // Miscellaneous
    barrel: 236,
    fountain: 227,
    chest_259: 259,
    chest_268: 268,
    chest_269: 269,
    chest_270: 270,
    chest_271: 271,
    mushroom_1: 214,
    mushroom_2: 237,
    mushroom_3: 260,
    mushroom_4: 283,
    empty: 413,
    flag_015: 15,
    flag_016: 16,
    flag_017: 17,
    flag_018: 18,
    atic_065: 65,

    // Stairs
    stair_ground_1: 92, // stair_ground_top_ground
    stair_ground_2: 93, // stair_ground_rail_top_ground
    stair_ground_3: 94, // stair_ground_top_ground_1
    stair_ground_4: 115, // stair_ground
    stair_ground_5: 116, // stair_ground_rail_center_ground
    stair_ground_6: 117, // stair_ground_1_ground
    stair_ground_7: 138, // stair_ground_2_ground
    stair_ground_8: 139, // stair_ground_rail_center_ground_1_ground
    stair_ground_9: 140, // stair_ground_3_ground
    stair_ground_10: 161, // stair_ground_to_right_ground
    stair_ground_11: 162, // stair_ground_top_ground_ground
    stair_ground_12: 163, // stair_ground_to_left_ground
    stair_ground_13: 184, // stair_ground_c_ground_1
    stair_ground_14: 185, // stair_ground_front_ground
    stair_ground_15: 186, // stair_ground_c_ground
};
