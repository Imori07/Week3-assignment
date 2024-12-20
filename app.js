console.log("test");
//! Parts starting in red are where ive had help from ai
// MAKING THE ELEMENTS! (ROBBED FROM JOE)
// Select the elements where the cookie count, CPS, and other data will be displayed
const noCookies = document.getElementById("noc");
const cookiesPerSecond = document.getElementById("cps");
const theButton = document.getElementById("theButton");
const errorDiv = document.getElementById("error");
const shopContainer = document.getElementById("shop");

// THE GAME VARIABLES (ROBBED FROM JOE)
// Load saved game state from local storage or set defaults if no saved state exists
let cookies = parseInt(localStorage.getItem("cookies")) || 0; // Total cookies, default to 0
let cps = parseInt(localStorage.getItem("cps")) || 1; // CPS, default to 1
let purchasedUpgrades =
  JSON.parse(localStorage.getItem("purchasedUpgrades")) || {}; // Track purchased upgrades, default to empty object

// THIS IS THE FUNCTION TO UPDATE THE DISPLAY
function updateDisplay() {
  // Update the displayed cookie count and CPS
  noCookies.textContent = `Cookies: ${cookies}`;
  cookiesPerSecond.textContent = `Cookies Per Second: ${cps}`;
}

// FUNCTION TO SAVE GAME STATE TO LOCAL STORAGE
function saveGameState() {
  localStorage.setItem("cookies", cookies); // Save current cookie count
  localStorage.setItem("cps", cps); // Save current CPS
  localStorage.setItem("purchasedUpgrades", JSON.stringify(purchasedUpgrades)); // Save purchased upgrades
}

//==================================================================================================================

// THE FUNCTION TO HANDLE COOKIE CLICKING
function clickCookie() {
  cookies++; // Increment the cookie count by 1
  updateDisplay(); // Update the display to reflect the new cookie count
  saveGameState(); // Save the game state
}

// THE FUNCTION TO HANDLE BUYING SHOP ITEMS
function buyItem(upgrade, upgradeElement) {
  const cost = upgrade.cost; // Cost of the upgrade
  const cpsIncrease = upgrade.cpsIncrease || 0; // CPS increase from the upgrade, defaulting to 0 IF it's undefined

  // THE PART THAT BRINGS IT TOGETHER
  if (cookies >= cost) {
    // If the player has enough cookies to buy the upgrade
    cookies -= cost; // Deduct the cost of the upgrade from the cookie total
    cps += cpsIncrease; // Add the CPS increase to the total CPS

    // Update the quantity displayed for the purchased upgrade
    const quantityElement = upgradeElement.querySelector(".quantity");
    const upgradeId = upgrade.id;

    // Track the number of this upgrade purchased
    purchasedUpgrades[upgradeId] = (purchasedUpgrades[upgradeId] || 0) + 1;
    quantityElement.textContent = purchasedUpgrades[upgradeId]; // Update quantity in UI

    updateDisplay(); // Update the display to reflect the new cookie count and CPS
    saveGameState(); // Save the game state
  } else {
    // If the player does not have enough cookies, show an error message
    showError("Not enough cookies!");
  }
}

// FUNCTION TO SHOW ERROR MESSAGES
function showError(message) {
  // If there's no error currently being displayed
  if (errorDiv.textContent === "") {
    errorDiv.textContent = message; // Display the error message
    setTimeout(() => {
      errorDiv.textContent = ""; // Clear the error message after 2 seconds
    }, 2000);
  }
}

//================================================================================================================

// EVENT LISTENER FOR THE COOKIE BUTTON
theButton.addEventListener("click", clickCookie); // Trigger `clickCookie` when the button is clicked

// INCREASE COOKIES AUTOMATICALLY BASED ON CPS (every 1sec)
setInterval(() => {
  cookies += cps; // Add the CPS value to the total cookies every second
  updateDisplay(); // Update the display to reflect the new cookie count
  saveGameState(); // Save the game state
}, 1000);

//!================================================================================================================
// Had some help from ai because i COULD NOT make this api work
// FUNCTION TO FETCH SHOP UPGRADES FROM API
async function getShopUpgrades() {
  try {
    const response = await fetch(
      "https://cookie-upgrade-api.vercel.app/api/upgrades"
    ); // Fetch upgrades from the API
    if (!response.ok) {
      throw new Error("Failed to fetch upgrades"); // Throw an error if the response is not ok
    }
    const upgrades = await response.json(); // Parse the JSON response

    //!===

    shopContainer.innerHTML = ""; // This gets rid of any existing shop items

    // Populate shop items and restore quantities from local storage
    upgrades.forEach((upgrade) => {
      // Map the API property `increase` to `cpsIncrease`
      const cpsIncrease = upgrade.increase || 0; // Use the `increase` property or default to 0
      const cost = upgrade.cost || 0; // Use the `cost` property or default to 0

      // Create a container for the upgrade item
      const upgradeElement = document.createElement("div");
      upgradeElement.classList.add("sItem");

      //!==========================================================================================================
      // I have no idea how to explain this, mostly work done by ai but i couldnt find another way to track items without it and didnt want to give an incomplete submission
      // Set the inner HTML for the upgrade item
      upgradeElement.innerHTML = `
          <div class="quantity">${
            purchasedUpgrades[upgrade.id] || 0
          }</div> <!-- Tracks how many of this item have been purchased -->
          <div>${
            upgrade.name || "Unnamed Upgrade"
          }</div> <!-- Name of the upgrade -->
          <div>$C ${cost}</div> <!-- Cost of the upgrade -->
          <div>+${cpsIncrease} CPS</div> <!-- CPS increase from the upgrade -->
          <button>Buy</button> <!-- Button to buy the upgrade -->
        `;

      //!===

      // Add an event listener to the "Buy" button
      upgradeElement.querySelector("button").addEventListener("click", () => {
        buyItem({ ...upgrade, cpsIncrease }, upgradeElement); // Pass the upgrade details and element to the buy function
      });

      // Append the upgrade item to the shop container
      shopContainer.appendChild(upgradeElement);
    });
  } catch (error) {
    console.error("Error fetching upgrades:", error); // Log the error for debugging
    showError("Failed to fetch upgrades"); // Show an error message to the player
  }
}

//================================================================================================================

// INITIALIZE THE GAME
getShopUpgrades(); // Fetch and display shop upgrades when the game starts
updateDisplay(); // Update the display to show the initial cookie count and CPS
