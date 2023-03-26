"use strict";

//used to calculate screen pixels
let moveSpeed = 40;

let playerData = {
    health: 30,
    maxHealth: 100,
    exp: 0,
    lvl: 1,
    attack: 0,
    attackPower: 4,
    defense: 0,
    score: 0,
    hitChance: 0.6,
    position: {
        x: 4,
        y: 4
    },
    GfxPosition: {
        x: 160,
        y: 160
    },
    fov: {
        x: 9,
        h: 9
    },
    equiped: [], //{name: "empty", type: "empty"}],
    inventory: [],
    setExp: function (exp_) {
        if (playerData.exp >= 100) {
    
            playerData.exp = playerData.exp - 100;
            playerData.lvl += 1;
            //set attributes
            playerData.attackPower += 1;
            addLine('Level up!', 'yellowText');
        } else {
            playerData.exp += exp_;
        }
        //level up code is embedded in setExp
        if (playerData.exp >= 100) {
            addLine('Level up!', 'yellowText');
            playerData.exp = playerData.exp - 100;
            playerData.lvl += 1;
            //set attributes
            playerData.attackPower += 1;

        }
    },
    setHealth: function (type_, hlth_) {
        if (type_ == "add") {
            playerData.health += hlth_;

        } else if (type_ == "remove") {
            playerData.health -= hlth_;

        }

        //prevents player health from going byond max health or bellow 0
        if (playerData.health > playerData.maxHealth) {
            playerData.health = playerData.maxHealth;
        }
        if (playerData.health < 0) {
            playerData.health = 0;
        }
    },
}

class Sword {
    constructor() {
        this.name = "Sword";
        this.type = "Sword";
        this.attack = 6;
        this.equiped = false;
        this.dropChance = 0.015;
    }
}

let isDead = 0;

class enemyData {
    constructor(health, y, x, name) {
        this.name = name;
        this.health = health + (gameData.currentMap * 10);
        this.attack = 2 + (gameData.currentMap * 2);
        this.attackPower = 2 + (gameData.currentMap * 2);
        this.y = y;
        this.x = x;
        this.hitChance = 0.4;
        this.spawnChance = 0.05;
        this.exp = 5 + gameData.currentMap;
        this.move = function (moveY, moveX) {
            if (los.isVisable(entMaps[gameData.currentMap][moveY][moveX].y, entMaps[gameData.currentMap][moveY][moveX].x, playerData.position.y, playerData.position.x)) {
                let stepX = rC.getDirection(moveX, playerData.position.x), stepY = rC.getDirection(moveY, playerData.position.y), deltaX = Math.abs(playerData.position.x - moveX), deltaY = Math.abs(playerData.position.y - moveY), err = deltaX - deltaY;

                let x = moveX, y = moveY, valid = true, errCalc;
                for (let i = 0; i < 13; i++) {

                    // Check for invalid tile
                    if (rC.isBlocked(x, y)) {
                        console.log('no touch');
                        break;
                    }

                    // Check for destination
                    if (x === playerData.position.x && y === playerData.position.y) {
                        console.log('TOUCH');
                        if (i < 2) {
                            fight(moveY, moveX);
                        }
                        break;
                    }

                    // Check error and increment x
                    errCalc = 2 * err;
                    if (errCalc > deltaY * -1) {
                        err -= deltaY;
                        x += stepX;
                        //test 
                        if (i > 1) {
                            break;
                        }
                    }

                    // Check for destination
                    if (x === playerData.position.x && y === playerData.position.y) {
                        console.log('TOUCH');
                        if (i < 2) {
                            fight(moveY, moveX);
                        }
                        break;
                    }

                    // Inrement y
                    if (errCalc < deltaX) {
                        err += deltaX;
                        y += stepY;
                        //test
                        if (i > 1) {
                            break;
                        }
                    }

                    if (i < 1) {
                        if (maps[gameData.currentMap][y][x] == 0 || maps[gameData.currentMap][y][x] == 4) {
                            maps[gameData.currentMap][moveY][moveX] = 0;
                            maps[gameData.currentMap][y][x] = 2;

                            entMaps[gameData.currentMap][y][x] = entMaps[gameData.currentMap][moveY][moveX];
                            entMaps[gameData.currentMap][y][x].y = y;
                            entMaps[gameData.currentMap][y][x].x = x;
                            //if we set this to 2 our enemy would be respawned with full health when walking back into view
                            entMaps[gameData.currentMap][moveY][moveX] = 10;
                        }
                    }
                }


            }
        };
    }
}

//0 is player turn and 1 is enemy
let fightState = 0;

let maps = [];

let entMaps = [];


let gameData = {
    currentMap: 0,
    //used to offset gamewindow
    gameWindowX: 0,
    gameWindowY: 0,
    mapX: 100,
    mapY: 100
}

//generate tp object
class tp {
    constructor(y, x) {
        this.nextMap = gameData.currentMap + 1;
        this.currentMap = gameData.currentMap;
        this.posY = y;
        this.posX = x;
    }
}

class tpUp {
    constructor(y, x) {
        this.nextMap = gameData.currentMap - 1;
        this.currentMap = gameData.currentMap;
        this.posY = y;
        this.posX = x;
    }
}

let Helpers = {
    GetRandom: function (low, high) {
        return ~~(Math.random() * (high - low)) + low;
    }
};


let test = 0;
let test1;

//addapted from https://jsfiddle.net/bigbadwaffle/YeazH/
let generateMap = function (mapNum) {
    maps[mapNum] = new Array();
    entMaps[mapNum] = new Array();
    //generate  map array
    test = 0;
    test1 = 0;
    for (let test = 0; test <= 99; test++) {
        //console.log(String(test1) + " " + String(test));
        maps[mapNum][test] = new Array(100);
        entMaps[mapNum][test] = new Array(100);
    }

}

let room_count = Helpers.GetRandom(20, 40);

let min_size = 3;
let max_size = 8;

let map_size = 98;
let rooms = [];
let generateRooms = function (mapNum) {

    for (let i = 0; i < room_count; i++) {
        let room = {}

        room.x = Helpers.GetRandom(5, 40); //(50, map_size - max_size - 1);
        room.y = Helpers.GetRandom(5, 40); //(, map_size - max_size - 1);
        room.w = Helpers.GetRandom(min_size, max_size);
        room.h = Helpers.GetRandom(min_size, max_size);

        if (DoesCollide(room)) {
            i--;
            continue;
        }
 
        room.w--;
        room.h--;

        rooms.push(room);
    }
    SquashRooms();
    for (let i = 0; i < room_count; i++) {
        let roomA = rooms[i];
        let roomB = FindClosestRoom(roomA);

        let pointA = {
            x: Helpers.GetRandom(roomA.x, roomA.x + roomA.w),
            y: Helpers.GetRandom(roomA.y, roomA.y + roomA.h)
        };
        console
        let pointB = {
            x: Helpers.GetRandom(roomB.x, roomB.x + roomB.w),
            y: Helpers.GetRandom(roomB.y, roomB.y + roomB.h)
        };

        while ((pointB.x != pointA.x) || (pointB.y != pointA.y)) {
            if (pointB.x != pointA.x) {
                if (pointB.x > pointA.x) pointB.x--;
                else pointB.x++;
            } else if (pointB.y != pointA.y) {
                if (pointB.y > pointA.y) pointB.y--;
                else pointB.y++;
            }

            maps[mapNum][pointB.y][pointB.x] = 0;
            //hallways
            //1
        }
    }

    for (let i = 0; i < room_count; i++) {
        let room = rooms[i];
        for (let x = room.x; x < room.x + room.w; x++) {
            for (let y = room.y; y < room.y + room.h; y++) {
                maps[mapNum][y][x] = 0;
                //room floor
                //1
            }
        }
    }

}


let DoesCollide = function (room, ignore) {
    for (let i = 0; i < rooms.length; i++) {
        if (i == ignore) continue;
        let check = rooms[i];
        if (!((room.x + room.w < check.x) || (room.x > check.x + check.w) || (room.y + room.h < check.y) || (room.y > check.y + check.h))) return true;
    }

    return false;
}

let FindClosestRoom = function (room) {
    let mid = {
        x: room.x + (room.w / 2),
        y: room.y + (room.h / 2)
    };
    let closest = null;
    let closest_distance = 1000;
    for (let i = 0; i < rooms.length; i++) {
        let check = rooms[i];
        if (check == room) continue;
        let check_mid = {
            x: check.x + (check.w / 2),
            y: check.y + (check.h / 2)
        };
        let distance = Math.min(Math.abs(mid.x - check_mid.x) - (room.w / 2) - (check.w / 2), Math.abs(mid.y - check_mid.y) - (room.h / 2) - (check.h / 2));
        if (distance < closest_distance) {
            closest_distance = distance;
            closest = check;
        }
    }
    return closest;
}


let SquashRooms = function () {
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < rooms.length; j++) {
            let room = rooms[j];
            while (true) {
                var old_position = {
                    x: room.x,
                    y: room.y
                };
                if (room.x > 1) room.x--;
                if (room.y > 1) room.y--;
                if ((room.x == 1) && (room.y == 1)) break;
                if (DoesCollide(room, j)) {
                    room.x = old_position.x;
                    room.y = old_position.y;
                    break;
                }
            }
        }
    }
}

let generateEmptyMap = function (mapNum) {
    //generate empty map with wall tiles
    test = 0;
    test1 = 0;

    for (let test = 0; test < 99; test++) {
        //console.log(String(test1) + " " + String(test));
        maps[mapNum][test1][test] = 1;
        entMaps[mapNum][test1][test] = 0;
        for (test1 = 0; test1 < 99; test1++) {
            maps[mapNum][test1][test] = 1;
            entMaps[mapNum][test1][test] = 1;
        }
    }
}

//fills map with items and entities
let fillMap = function (mapNum) {

    let settps = true;
    let enemyCount = 0;
    let healthCount = 0;
    let swordCount = 0;

    for (let i = 0; i < room_count; i++) {
        let room = rooms[i];
        for (let x = room.x; x < room.x + room.w; x++) {
            for (let y = room.y; y < room.y + room.h; y++) {
                //tp
                if (settps == true && maps[mapNum][y][x] == 0 && maps[mapNum][y][x] != 3) {
                    maps[mapNum][y][x] = 5;
                    console.log("set tps");
                    settps = false;
                }
                //health potions
                if (Math.random() < 0.05) {
                    if (maps[mapNum][y][x] == 0 && maps[mapNum][y][x] != 3 && maps[mapNum][y][x] != 5 && healthCount < 5) {
                        maps[mapNum][y][x] = 4;
                        healthCount++;
                    }
                }
                //enemy
                if (Math.random() < new enemyData().spawnChance) {
                    if (maps[mapNum][y][x] == 0 && maps[mapNum][y][x] != 3 && maps[mapNum][y][x] != 5 && enemyCount < 10) {
                        maps[mapNum][y][x] = 2; 
                        entMaps[mapNum][y][x] = new enemyData(40 + (gameData.currentMap * 0.3), y, x, 'enemy');
                        enemyCount++;
                    }
                }
                //sword
                if (Math.random() < new Sword().dropChance) {
                    if (maps[mapNum][y][x] == 0 && maps[mapNum][y][x] != 3 && maps[mapNum][y][x] != 5 && swordCount < 2) {
                        maps[mapNum][y][x] = 8;
                        swordCount++;
                    }
                }

            }
        }
    }
}

//places user within a certain room
let placePlayer = function (roomNum) {
    let room = rooms[roomNum];
    let mid = {
        x: Math.floor(room.x + (room.w / 2)),
        y: Math.floor(room.y + (room.h / 2)),
    };
    console.log("y: " + String(mid.y) + "  x: " + String(mid.x));
    maps[gameData.currentMap][mid.y][mid.x] = 3;
    playerData.position.y = 4;
    playerData.position.x = 4;
    playerData.GfxPosition.y = 80;
    playerData.GfxPosition.x = 80;
}

//changes our currentMap array index and redraws map
let changeMap = function (y, x) {
    //clears current player position. fixed bug when reusing tp
    maps[gameData.currentMap][playerData.position.y][playerData.position.x] = 0;

    gameData.currentMap = entMaps[gameData.currentMap][y][x].nextMap;

    if (maps[gameData.currentMap] == undefined) {
        generate();
    }


    addLine("Player used the tps.");

    gameCamera.x = 0;
    gameCamera.y = 0;
    gameData.gameWindowX = 0;
    gameData.gameWindowY = 0;

    movePlayer(4, 4);

    clearMap();
    drawMap();
}

//moves player on array
let movePlayer = function (nextY, nextX) {
    //prevents enemy from being overwritten when changing maps by using tps
    if (maps[gameData.currentMap][playerData.position.y][playerData.position.x] == 2) {} else {
        maps[gameData.currentMap][playerData.position.y][playerData.position.x] = 0
    }
    //clear last position
    maps[gameData.currentMap][playerData.position.y][playerData.position.x] = 0
    clearMap();

    playerData.position.y = nextY;
    playerData.position.x = nextX;
    maps[gameData.currentMap][nextY][nextX] = 3;


    drawMap();
}

//adds css transition class to battle text information
let fadeAway = function () {
    let tryC = true;
    if (document.querySelectorAll(".btlData") == undefined) {
        tryC = false;
    }
    if (document.querySelectorAll(".btlDataPlayer") == undefined) {
        tryC = false;
    }

    if (tryC == true) {
        let btlData = document.querySelectorAll(".btlData");
        let btlDataPlayer = document.querySelectorAll(".btlDataPlayer");
        for (let i of btlData) {
            i.classList.add("btlDataEffect");
        }
        for (let i of btlDataPlayer) {
            i.classList.add("btlDataEffect");
        }
    }

}

//function used for player combat
let fight = function (y, x) {
    let dmg;
    try {
        if (fightState == 0) {
            //player turn
            if (Math.random() < playerData.hitChance) {
                addLine("Player attacked " + entMaps[gameData.currentMap][y][x].name + ".");
                //calc damage
                let equipDmg = playerData.equiped.attack;
                if (equipDmg == undefined) {
                    equipDmg = 0;
                }
                dmg = Math.floor(Math.random() * playerData.attack) + playerData.attackPower + equipDmg;
                //console.log(dmg);
                draw('section', 'class', 'btlData', String(dmg), y * 40 - 40, x * 40);

                entMaps[gameData.currentMap][y][x].health -= dmg;
                if (entMaps[gameData.currentMap][y][x].health <= 0) {
                    addLine("Player killed " + entMaps[gameData.currentMap][y][x].name + ".", "yellowText");
                    playerData.setExp(entMaps[gameData.currentMap][y][x].exp);
                    playerData.score = playerData.score + 10;
                    entMaps[gameData.currentMap][y][x] = "";
                    maps[gameData.currentMap][y][x] = 0;
                    clearMap();
                    drawMap();
                }
            } else {
                addLine("Player missed.");
            }
            fightState = 1;
        } else {
            //enemy turn
            if (Math.random() < entMaps[gameData.currentMap][y][x].hitChance) {
                addLine(entMaps[gameData.currentMap][y][x].name + " attacked Player.");
                dmg = Math.floor(Math.random() * entMaps[gameData.currentMap][y][x].attack) + entMaps[gameData.currentMap][y][x].attackPower;
                draw('section', 'class', 'btlDataPlayer', String(dmg), String(playerData.position.y * 40 - 40), String(playerData.position.x * 40));
                playerData.setHealth("remove", dmg);
                if (playerData.health <= 0) {
                    //player death transition BUG
                    isDead = 1;
                    /* try {
                        document.querySelectorAll("#player")[0].classList.add('playerDead');
                        document.querySelectorAll("#player")[1].classList.add('playerDead');
                    } catch (error) {
                        console.log(error);
                    } */
                    /* for (let i = 0; i < document.querySelectorAll("#player").length; i++) {
                         document.querySelectorAll("#player")[i].classList.add("playerDead");
                     }*/
                    try {
                        document.querySelector("#player").classList.add("playerDead");
                    } catch (error) {
                        console.log(error);
                    }
                    let cookie = getCookie("highScore");
                    addLine(entMaps[gameData.currentMap][y][x].name + " killed Player.", "redText");
                    //set newhigh score if score is higher then existing highscore
                    if (playerData.score > cookie) {
                        addLine("High score: " + playerData.score);
                        document.cookie = "highScore=" + playerData.score;
                    } else {
                        addLine("Score: " + playerData.score);
                    }

                    isDead = 1;
                }
            } else {
                addLine(entMaps[gameData.currentMap][y][x].name + " missed.");
            }
            fightState = 0;
        }
    } catch (error) {
        console.log(error);
    }
    updateUi();

    //running fadeAway with delay to fix transition bug
    setTimeout(() => {
        fadeAway();
    }, 1000);

}

//light of sight code from
//https://codepen.io/ashblue/details/ADBba

let los = {

    isVisable: function (startY, startX, endY, endX) {
        let stepX = rC.getDirection(startX, endX),
            stepY = rC.getDirection(startY, endY),

            deltaX = Math.abs(endX - startX),
            deltaY = Math.abs(endY - startY),

            err = deltaX - deltaY;

        let x = startX,
            y = startY,
            valid = true,
            errCalc;
        for (let i = 0; i < 20; i++) {
            // Check for invalid tile
            if (rC.isBlocked(x, y)) {
                console.log('Sight is blocked at X ' + (x) + ' Y ' + (y));
                return false;
                break;
            }

            // Check for destination
            if (x === endX && y === endY) {
                console.log('Valid line-of-sight');
                return true;
                break;
            }

            // Check error and increment x
            let errCalc = 2 * err;
            if (errCalc > deltaY * -1) {
                err -= deltaY;
                x += stepX;
            }

            // Check for destination
            if (x === endX && y === endY) {
                console.log('Valid line-of-sight');
                return true;
                break;
            }

            // Inrement y
            if (errCalc < deltaX) {
                err += deltaX;
                y += stepY;
            }
        }

    }
};

//enemy move co
//light of sight code
//https://codepen.io/ashblue/details/ADBba

//raycast code
let rC = {

    // Get the direction between two points
    getDirection: function (a, b) {
        if (a < b) {
            return 1;
        } else {
            return -1;
        }
    },

    isBlocked: function (x, y) {
        return maps[gameData.currentMap][y][x] === 1;
        // || entMaps[gameData.currentMap][y][x] != 1;
    }
};


//update player stats on ui
let updateUi = function () {
    let healthUi = document.querySelector('#healthHtml');
    let lvlUi = document.querySelector('#lvlHtml');
    let equipedUi = document.querySelector('#equipedHtml');

    equipedUi.innerHTML = playerData.equiped.name;
    healthUi.innerHTML = playerData.health;
    lvlUi.innerHTML = playerData.lvl;
}

//function to retrieve specific cookie data
//modified w3 school example https://www.w3schools.com/js/js_cookies.asp
let getCookie = function (cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

//gets cookie and sets highscore if cookie exists
let loadCookie = function () {
    let cookie = getCookie("highScore");
    let outputCookie = document.querySelector("#highScoreHtml");

    outputCookie.innerHTML = cookie;
}

//append msg to output console
let addLine = function (inputT, textColor = '') {
    let inputText = inputT
    let textLine = document.createElement('P');
    textLine.innerHTML = inputText;
    textLine.setAttribute('class', textColor);
    document.querySelector('#txtOut').appendChild(textLine);

    //auto scroll output console
    document.querySelector('#txtOut').scrollTop = document.querySelector('#txtOut').scrollHeight;
}

//gets called on button press or mobile button press
let handelInput = function (event) {
    let nextPosY;
    let nextPosX;

    let dirx = 0;
    let diry = 0;
    console.log(event);
    if (event.originalTarget == undefined) {
        event.originalTarget = "";
    }
    if (event.target == undefined) {
        event.target = "";
    }

    try {
        if (event.key == "s" || event.key == "ArrowDown") {
            //down
            if (isDead == 0) {
                nextPosY = playerData.position.y + 1;
                nextPosX = playerData.position.x;
                if (maps[gameData.currentMap][nextPosY][nextPosX] == 1) {
                    //hit wall

                    clearMap();
                    drawMap();
                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 0) {
                    //moveEnemy();

                    movePlayer(nextPosY, nextPosX)
                    playerData.position.y = nextPosY;

                    playerData.GfxPosition.y = playerData.GfxPosition.y + moveSpeed;
                    document.getElementById("player").style.top = playerData.GfxPosition.y + 'px';
                    console.log(gameData.gameWindowY);
                    dirx = 1;
                    if (gameData.gameWindowY <= 0) {
                        gameCamera.move(dirx, diry);
                    } else {
                        console.log("bounds");
                    }
                    gameData.gameWindowY = gameData.gameWindowY - 40;

                    clearMap();
                    drawMap();
                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 2) {
                    //fight
                    fight(nextPosY, nextPosX);
                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 4) {
                    //potion
                    playerData.setHealth("add", 25);
                    updateUi();
                    movePlayer(nextPosY, nextPosX)
                    playerData.position.y = nextPosY;
                    maps[gameData.currentMap][nextPosY][nextPosX] = 3;
                    playerData.GfxPosition.y = playerData.GfxPosition.y + moveSpeed;
                    document.getElementById("player").style.top = playerData.GfxPosition.y + 'px';

                    dirx = 1;
                    if (gameData.gameWindowY <= 0) {
                        gameCamera.move(dirx, diry);
                    } else {
                        console.log("bounds");
                    }
                    gameData.gameWindowY = gameData.gameWindowY - 40;
                    clearMap();
                    drawMap();
                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 5 || maps[gameData.currentMap][nextPosY][nextPosX] == 6) {
                    //tps
                    changeMap(nextPosY, nextPosX);

                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';
                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 7) { // || maps[gameData.currentMap][nextPosY][nextPosX] == 6) {
                    //broken sword
                    //push new instance of item to inventoryarray
                    let newItem = new brokenSword;
                    playerData.inventory.push(newItem);
                    addLine("Picked up " + newItem.name, 'yellowText');

                    movePlayer(nextPosY, nextPosX)
                    playerData.position.y = nextPosY;
                    maps[gameData.currentMap][nextPosY][nextPosX] = 3;
                    playerData.GfxPosition.y = playerData.GfxPosition.y + moveSpeed;
                    document.getElementById("player").style.top = playerData.GfxPosition.y + 'px';

                    dirx = 1;
                    if (gameData.gameWindowY <= 0) {
                        gameCamera.move(dirx, diry);
                    } else {
                        console.log("bounds");
                    }
                    gameData.gameWindowY = gameData.gameWindowY - 40;
                    clearMap();
                    drawMap();


                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';
                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 8) {
                    // sword
                    //push new instance of item to inventoryarray
                    let newItem = new Sword;
                    playerData.inventory.push(newItem);
                    addLine("Picked up " + newItem.name, 'yellowText');

                    movePlayer(nextPosY, nextPosX)
                    playerData.position.y = nextPosY;
                    maps[gameData.currentMap][nextPosY][nextPosX] = 3;
                    playerData.GfxPosition.y = playerData.GfxPosition.y + moveSpeed;
                    document.getElementById("player").style.top = playerData.GfxPosition.y + 'px';

                    dirx = 1;
                    if (gameData.gameWindowY <= 0) {
                        gameCamera.move(dirx, diry);
                    } else {
                        console.log("bounds");
                    }
                    gameData.gameWindowY = gameData.gameWindowY - 40;
                    clearMap();
                    drawMap();


                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';
                }


                //                }
            }
        } else if (event.key == "a" || event.key == "ArrowLeft") {
            //left
            if (isDead == 0) {

                nextPosY = playerData.position.y;
                nextPosX = playerData.position.x - 1;

                //                if (nextPosY >= 0 && nextPosY <= mapY && nextPosX >= 0 && nextPosX <= mapX) {
                if (maps[gameData.currentMap][nextPosY][nextPosX] == 1) {
                    //hit wall
                    clearMap();
                    drawMap();

                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 0) {
                    //free space
                    //moveEnemy();

                    movePlayer(nextPosY, nextPosX)
                    playerData.position.x = nextPosX;

                    playerData.GfxPosition.x = playerData.GfxPosition.x - moveSpeed;
                    document.getElementById("player").style.left = playerData.GfxPosition.x + 'px';
                    diry = -1;

                    if (gameData.gameWindowX <= 0) {
                        gameCamera.move(dirx, diry);
                    }
                    gameData.gameWindowX = gameData.gameWindowX + 40;

                    clearMap();
                    drawMap();
                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 2) {
                    //enemy
                    fight(nextPosY, nextPosX);
                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 4) {
                    //potion
                    playerData.setHealth("add", 25);
                    updateUi();
                    movePlayer(nextPosY, nextPosX)
                    playerData.position.x = nextPosX;
                    maps[gameData.currentMap][nextPosY][nextPosX] = 3;
                    playerData.GfxPosition.x = playerData.GfxPosition.x - moveSpeed;
                    document.getElementById("player").style.left = playerData.GfxPosition.x + 'px';
                    diry = -1;

                    if (gameData.gameWindowX <= 0) {
                        gameCamera.move(dirx, diry);
                    }
                    gameData.gameWindowX = gameData.gameWindowX + 40;

                    clearMap();
                    drawMap();
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';
                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 5 || maps[gameData.currentMap][nextPosY][nextPosX] == 6) {
                    //tps
                    changeMap(nextPosY, nextPosX);

                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';
                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 7) { // || maps[gameData.currentMap][nextPosY][nextPosX] == 6) {
                    //push new instance of item to inventoryarray
                    let newItem = new brokenSword;
                    playerData.inventory.push(newItem);

                    addLine("Picked up " + newItem.name, 'yellowText');

                    movePlayer(nextPosY, nextPosX)
                    playerData.position.x = nextPosX;
                    maps[gameData.currentMap][nextPosY][nextPosX] = 3;
                    playerData.GfxPosition.x = playerData.GfxPosition.x - moveSpeed;
                    document.getElementById("player").style.left = playerData.GfxPosition.x + 'px';
                    diry = -1;

                    if (gameData.gameWindowX <= 0) {
                        gameCamera.move(dirx, diry);
                    }
                    gameData.gameWindowX = gameData.gameWindowX + 40;

                    clearMap();
                    drawMap();


                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';
                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 8) {
                    // sword
                    //push new instance of item to inventoryarray
                    let newItem = new Sword;
                    playerData.inventory.push(newItem);

                    addLine("Picked up " + newItem.name, 'yellowText');

                    movePlayer(nextPosY, nextPosX)
                    playerData.position.x = nextPosX;
                    maps[gameData.currentMap][nextPosY][nextPosX] = 3;
                    playerData.GfxPosition.x = playerData.GfxPosition.x - moveSpeed;
                    document.getElementById("player").style.left = playerData.GfxPosition.x + 'px';
                    diry = -1;

                    if (gameData.gameWindowX <= 0) {
                        gameCamera.move(dirx, diry);
                    }
                    gameData.gameWindowX = gameData.gameWindowX + 40;

                    clearMap();
                    drawMap();


                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';
                }


                //                }
            }
        } else if (event.key == "d" || event.key == "ArrowRight") {
            //right
            if (isDead == 0) {

                nextPosY = playerData.position.y;
                nextPosX = playerData.position.x + 1;

                //                if (nextPosY >= 0 && nextPosY <= mapY && nextPosX >= 0 && nextPosX <= mapX) {

                if (maps[gameData.currentMap][nextPosY][nextPosX] == 1) {
                    //hit wall
                    clearMap();
                    drawMap();

                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 0) {
                    //moveEnemy();

                    movePlayer(nextPosY, nextPosX)
                    playerData.position.x = nextPosX;

                    playerData.GfxPosition.x = playerData.GfxPosition.x + moveSpeed;
                    //document.getElementById("player").style.left = playerData.GfxPosition.x + 'px';


                    diry = 1;
                    if (gameData.gameWindowX <= 0) {
                        gameCamera.move(dirx, diry);
                    } else {
                        console.log("bounds");
                    }
                    gameData.gameWindowX = gameData.gameWindowX - 40;

                    clearMap();
                    drawMap();
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';
                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 2) {
                    //fight
                    fight(nextPosY, nextPosX);
                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 4) {
                    //potion
                    playerData.setHealth("add", 25);
                    updateUi();
                    movePlayer(nextPosY, nextPosX)
                    playerData.position.x = nextPosX;
                    maps[gameData.currentMap][nextPosY][nextPosX] = 3;
                    //playerData.GfxPosition.x = playerData.GfxPosition.x + moveSpeed;
                    //document.getElementById("player").style.left = playerData.GfxPosition.x + 'px';

                    diry = 1;
                    if (gameData.gameWindowX <= 0) {
                        gameCamera.move(dirx, diry);
                    } else {
                        console.log("bounds");
                    }


                    gameData.gameWindowX = gameData.gameWindowX - 40;
                    clearMap();
                    drawMap();
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';
                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 5 || maps[gameData.currentMap][nextPosY][nextPosX] == 6) {
                    //tps
                    changeMap(nextPosY, nextPosX);


                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 7) {
                    //broken sword
                    //push new instance of item to inventoryarray
                    let newItem = new brokenSword;
                    playerData.inventory.push(newItem);

                    addLine("Picked up " + newItem.name, 'yellowText');


                    movePlayer(nextPosY, nextPosX)
                    playerData.position.x = nextPosX;
                    maps[gameData.currentMap][nextPosY][nextPosX] = 3;
                    //playerData.GfxPosition.x = playerData.GfxPosition.x + moveSpeed;
                    //document.getElementById("player").style.left = playerData.GfxPosition.x + 'px';

                    diry = 1;
                    if (gameData.gameWindowX <= 0) {
                        gameCamera.move(dirx, diry);
                    } else {
                        console.log("bounds");
                    }
                    gameData.gameWindowX = gameData.gameWindowX - 40;
                    clearMap();
                    drawMap();


                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 8) {
                    //broken sword
                    //push new instance of item to inventoryarray
                    let newItem = new Sword;
                    playerData.inventory.push(newItem);

                    addLine("Picked up " + newItem.name, 'yellowText');


                    movePlayer(nextPosY, nextPosX)
                    playerData.position.x = nextPosX;
                    maps[gameData.currentMap][nextPosY][nextPosX] = 3;
                    playerData.GfxPosition.x = playerData.GfxPosition.x + moveSpeed;
                    document.getElementById("player").style.left = playerData.GfxPosition.x + 'px';

                    diry = 1;
                    if (gameData.gameWindowX <= 0) {
                        gameCamera.move(dirx, diry);
                    } else {
                        console.log("bounds");
                    }
                    gameData.gameWindowX = gameData.gameWindowX - 40;
                    clearMap();
                    drawMap();


                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                }


            }
        } else if (event.key == "w" || event.key == "ArrowUp") {
            //up
            if (isDead == 0) {
                nextPosY = playerData.position.y - 1;
                nextPosX = playerData.position.x;

                // if (nextPosY >= 0 && nextPosY <= mapY && nextPosX >= 0 && nextPosX <= mapX) {

                if (maps[gameData.currentMap][nextPosY][nextPosX] == 1) {
                    //hit wall
                    clearMap();
                    drawMap();

                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 0) {
                    //moveEnemy();

                    movePlayer(nextPosY, nextPosX)
                    playerData.position.y = nextPosY;

                    //playerData.GfxPosition.y = playerData.GfxPosition.y - moveSpeed;
                    // document.getElementById("player").style.top = playerData.GfxPosition.y + 'px';
                    dirx = -1;

                    if (gameData.gameWindowY <= 0) {
                        gameCamera.move(dirx, diry);
                    } else {
                        console.log("bounds");
                    }
                    gameData.gameWindowY = gameData.gameWindowY + 40;
                    clearMap();
                    drawMap();
                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 2) {
                    //fight
                    fight(nextPosY, nextPosX);
                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 4) {
                    //potion
                    playerData.setHealth("add", 25);
                    updateUi();
                    movePlayer(nextPosY, nextPosX)
                    playerData.position.y = nextPosY;
                    maps[gameData.currentMap][nextPosY][nextPosX] = 3;
                    //playerData.GfxPosition.y = playerData.GfxPosition.y - moveSpeed;
                    //document.getElementById("player").style.top = playerData.GfxPosition.y + 'px';
                    dirx = -1;

                    if (gameData.gameWindowY <= 0) {
                        gameCamera.move(dirx, diry);
                    } else {
                        console.log("bounds");
                    }
                    gameData.gameWindowY = gameData.gameWindowY + 40;

                    clearMap();
                    drawMap();

                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';
                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 5 || maps[gameData.currentMap][nextPosY][nextPosX] == 6) {
                    //tps
                    changeMap(nextPosY, nextPosX);
                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 7) {
                    //broken sword
                    //push new instance of item to inventoryarray
                    let newItem = new brokenSword;
                    playerData.inventory.push(newItem);

                    addLine("Picked up " + newItem.name, 'yellowText');

                    movePlayer(nextPosY, nextPosX)
                    playerData.position.y = nextPosY;
                    maps[gameData.currentMap][nextPosY][nextPosX] = 3;
                    //playerData.GfxPosition.y = playerData.GfxPosition.y - moveSpeed;
                    //document.getElementById("player").style.top = playerData.GfxPosition.y + 'px';
                    dirx = -1;

                    if (gameData.gameWindowY <= 0) {
                        gameCamera.move(dirx, diry);
                    } else {
                        console.log("bounds");
                    }
                    gameData.gameWindowY = gameData.gameWindowY + 40;

                    clearMap();
                    drawMap();

                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                } else if (maps[gameData.currentMap][nextPosY][nextPosX] == 8) {
                    //sword
                    //push new instance of item to inventoryarray
                    let newItem = new Sword;
                    playerData.inventory.push(newItem);

                    addLine("Picked up " + newItem.name, 'yellowText');

                    movePlayer(nextPosY, nextPosX)
                    playerData.position.y = nextPosY;
                    maps[gameData.currentMap][nextPosY][nextPosX] = 3;
                    playerData.GfxPosition.y = playerData.GfxPosition.y - moveSpeed;
                    document.getElementById("player").style.top = playerData.GfxPosition.y + 'px';
                    dirx = -1;

                    if (gameData.gameWindowY <= 0) {
                        gameCamera.move(dirx, diry);
                    } else {
                        console.log("bounds");
                    }
                    gameData.gameWindowY = gameData.gameWindowY + 40;

                    clearMap();
                    drawMap();


                    document.getElementById("gameWindow").style.top = gameData.gameWindowY + 'px';
                    document.getElementById("gameWindow").style.left = gameData.gameWindowX + 'px';

                }
            }
        }
    } catch (err) {
        console.log("ERROR: " + err);
    }

}

//clears map so we can redraw it
let clearMap = function () {
    let elemGameWindow = document.querySelector('#gameWindow');
    elemGameWindow.parentNode.removeChild(elemGameWindow)

    let elemCreateWindow = document.createElement('div');
    elemCreateWindow.setAttribute('id', 'gameWindow');
    document.querySelector('body').appendChild(elemCreateWindow);

}


//scrolling map adapted from https://github.com/mozdevs/gamedev-js-tiles/blob/gh-pages/square/scroll.js
class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.maxX = 100 * moveSpeed - width;
        this.maxY = 100 * moveSpeed - height;
        this.testx = 0;
        this.texty = 0;
    }
}

let gameCamera = new Camera(880, 1900);

gameCamera.SPEED = 40; // pixels per move

gameCamera.move = function (dirx, diry) {
    clearMap();
    this.testx = this.x;
    this.textx += dirx * 40;
    this.testy = this.y;
    this.testy += diry * 40;
    if (this.x < 0 || this.y < 0) {
        console.log("don't move");
        this.testx = this.x;
        this.testy = this.y;
    } else { // move camera
        this.x += dirx * 40;
        this.y += diry * 40;

        this.x = Math.max(0, Math.min(this.x, this.maxX));
        this.y = Math.max(0, Math.min(this.y, this.maxY));

    }
    console.log(this.x);
    console.log(this.y);

};

let draw = function (elementName, elementType, elementTypeValue, elementY, elementX) {
    let drawObj = document.createElement(elementName);
    drawObj.setAttribute(elementType, elementTypeValue);
    drawObj.style.top = elementY + 'px';
    drawObj.style.left = elementX + 'px';
    document.querySelector('#gameWindow').appendChild(drawObj);
}


let drawMap = function () {
    let startCol = (Math.floor(gameCamera.x / moveSpeed));
    let endCol = startCol + (gameCamera.width / moveSpeed);
    let startRow = Math.floor(gameCamera.y / moveSpeed);
    let endRow = startRow + (gameCamera.height / moveSpeed);
    let offsetX = -gameCamera.x + startCol * moveSpeed;
    let offsetY = -gameCamera.y + startRow * moveSpeed;


    for (var c = startCol; c <= endCol; c++) {
        for (var r = startRow; r <= endRow; r++) {

            let x = (c - startCol) * gameData.mapX + offsetX;
            let y = (r - startRow) * gameData.mapY + offsetY;
            if (maps[gameData.currentMap][c][r] == undefined) {
                continue;
            }

            if (maps[gameData.currentMap][c][r] == 3) {
                //draw player
                let tile_X = playerData.position.x * moveSpeed;
                let tile_Y = playerData.position.y * moveSpeed;

                draw('section', 'id', 'player', tile_Y, tile_X);
            } else if (maps[gameData.currentMap][c][r] == 1) {
                //draw wall
                let tile_X = r * moveSpeed;
                let tile_Y = c * moveSpeed;

                draw('section', 'class', 'wall', tile_Y, tile_X);
            } else if (maps[gameData.currentMap][c][r] == 0) {
                //draw floor
                let tile_X = r * moveSpeed;
                let tile_Y = c * moveSpeed;

                draw('section', 'class', 'floor', tile_Y, tile_X);
            } else if (maps[gameData.currentMap][c][r] == 2) {
                //draw enemy
                let tile_X = r * moveSpeed;
                let tile_Y = c * moveSpeed;

                //runs line of sight and tries to move towards player
                entMaps[gameData.currentMap][c][r].move(c, r);

                
                    draw('section', 'class', 'enemy', tile_Y, tile_X);
                
            } else if (maps[gameData.currentMap][c][r] == 4) {
                //draw health potion
                let tile_X = r * moveSpeed;
                let tile_Y = c * moveSpeed;

                draw('section', 'class', 'healthPotion', tile_Y, tile_X);
            } else if (maps[gameData.currentMap][c][r] == 5) {
                //draw tps
                let tile_X = r * moveSpeed;
                let tile_Y = c * moveSpeed;

                if (entMaps[gameData.currentMap][c][r] == 1) {
                    entMaps[gameData.currentMap][c][r] = new tp(c, r);
                }

                draw('section', 'class', 'tp', tile_Y, tile_X);
            } else if (maps[gameData.currentMap][c][r] == 6) {
                //draw tpsUp
                let tile_X = r * moveSpeed;
                let tile_Y = c * moveSpeed;

                if (entMaps[gameData.currentMap][c][r] == 1) {
                    entMaps[gameData.currentMap][c][r] = new tpUp(c, r);
                }

                draw('section', 'class', 'tp', tile_Y, tile_X);
            } else if (maps[gameData.currentMap][c][r] == 8) {
                //draw sword
                let tile_X = r * moveSpeed;
                let tile_Y = c * moveSpeed;

                draw('section', 'class', 'item', tile_Y, tile_X);
            }


        }
    }
}

//generate complete map
let generate = function () {
    rooms = [];

    let mapNum = gameData.currentMap;
    console.log("generating map: " + mapNum);
    //generate  map
    generateMap(mapNum);
    //populate that map
    generateEmptyMap(mapNum);
    //generate rooms and fill them in
    generateRooms(mapNum);
    //fill map with items and enteties
    fillMap(mapNum);
    setTimeout(() => {
        movePlayer(4, 4);
        cleanSpawn();
        clearMap();
        drawMap();
    }, 20);
}

//clears blocks around player to prevent player from being stuck
let cleanSpawn = function () {
    if (gameData.currentMap >= 1) {
        console.log("HERE");
        if (maps[gameData.currentMap][playerData.position.y + 1][playerData.position.x + 1] == 1 || maps[gameData.currentMap][playerData.position.y + 1][playerData.position.x + 1] == 4 || maps[gameData.currentMap][playerData.position.y + 1][playerData.position.x + 1] == 0) {
            maps[gameData.currentMap][playerData.position.y + 1][playerData.position.x + 1] = 6;
        }
    }
    if (maps[gameData.currentMap][playerData.position.y + 1][playerData.position.x] == 1) {
        maps[gameData.currentMap][playerData.position.y + 1][playerData.position.x] = 0;
    }
    if (maps[gameData.currentMap][playerData.position.y][playerData.position.x + 1] == 1) {
        maps[gameData.currentMap][playerData.position.y][playerData.position.x + 1] = 0;
    }
    if (maps[gameData.currentMap][playerData.position.y - 1][playerData.position.x - 1] == 1) {
        maps[gameData.currentMap][playerData.position.y - 1][playerData.position.x - 1] = 0;
    }
    if (maps[gameData.currentMap][playerData.position.y - 1][playerData.position.x] == 1) {
        maps[gameData.currentMap][playerData.position.y - 1][playerData.position.x] = 0;
    }
    if (maps[gameData.currentMap][playerData.position.y][playerData.position.x - 1] == 1) {
        maps[gameData.currentMap][playerData.position.y][playerData.position.x - 1] = 0;
    }
}

//main
//loads cookie to display highscore
loadCookie();
//generate first map
generateMap(0);
//populate that map with walls
generateEmptyMap(0);
//generate rooms and fill them in
generateRooms(0);
//fill map with items and entities
fillMap(0);
//place player at starting position
movePlayer(4, 4);
//clean area around play to prevent player from being stuck
cleanSpawn();

clearMap();
drawMap();

playerData.equiped = {
    name: "empty",
    type: "empty"
};


//handel user input via keyboard
document.addEventListener("keydown", function onPress(event) {
    handelInput(event);
});

let btnStartScreen = document.querySelector("#btnStartScreen");

let elemOverlayStartScreen = document.querySelector("#startScreen");
let elemOverlay = document.querySelector("#overlay");

//start screen
btnStartScreen.addEventListener('click', function () {
    elemOverlayStartScreen.style.display = "none";
});


//prevents display bug
let contentPayload = "<p>Health: <span id='healthHtml'>30</span> Level: <span id='lvlHtml'>1</span> High Score: <span id='highScoreHtml'></span> Equiped: <span id='equipedHtml'></span></p>";


