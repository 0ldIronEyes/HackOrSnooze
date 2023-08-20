"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  loggedOutNavBarUI();
  location.reload();
}

$navLogOut.on("click", logout);

loggedOutNavBarUI();
/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

//Updates the navbar for when user is logged out
function loggedOutNavBarUI() {

  $navStorySubmit.hide();
  $navFavorites.hide();
  $navMyStories.hide();
}


/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");
  $navStorySubmit.show();
  $navFavorites.show();
  $navMyStories.show();
  $allStoriesList.show();
  putStoriesOnPage();
  updateNavOnLogin();
}



// if no user is logged in, returns 0; if story is not favorited returns 1. If story is favorited returns 2
function checkifStoryFavorited(storyID)
{
  if (currentUser == undefined)
  {
     return 0;  
  }
  else if(currentUser.favorites.some(x=> x.storyId === storyID))
  {
      return 2;
  }
  else
  {
      return 1;
  }   
}



//this handles clicking on icons in the story list. Checks whether the favorite or the delete button was clicked.
$allStoriesList.on("click",clickIcon)
$myStoriesList.on("click",clickIcon)

async function clickIcon(event)
{
  if (event.target.getAttribute("data-id") != null)
  { 
    if (event.target.classList.contains("fa-star"))
    {
      let story= storyList.getStory(event.target.getAttribute("data-id"));
      event.target.classList.toggle("fa-solid");
      event.target.classList.toggle("fa-regular"); 
      await currentUser.toggleFavorite(story);
    } 
    else if (event.target.classList.contains("delete-button"))
    {
      let story= storyList.getStory(event.target.getAttribute("data-id"));
      await storyList.deleteStory(currentUser, story.storyId);
      putStoriesOnPage();
    }
  }
}
