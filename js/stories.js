"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

const inactiveStar = "fa-regular fa-star fa-lg";
const activeStar =  "fa-solid fa-star fa-lg" ;
/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  let starActive;
  let deleteButtonClass = "delete-button";
  switch (checkifStoryFavorited(story.storyId))
  {
    case 0:   //if 0 returned, no user is logged in - hide Star and Delete Button
        starActive = "hidden";
        deleteButtonClass = "hidden";
        break;
    case 1:   //logged in but not favorited
        starActive = inactiveStar;
        break;
    case 2:     //logged in and favorited
        starActive = activeStar;
        break;
  }
  const hostName = story.getHostName(story.url);
  return $(`
      <li id="${story.storyId}">
          <button id="del-button" class=${deleteButtonClass} data-id=${story.storyId}> X </button>
          <button id="fav-button"> <i data-id=${story.storyId} class="${starActive}"></i> </button> 
          <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        
        <div class="story-author">by ${story.author}</div>
        <div class="story-user">posted by ${story.username}</div>
      </li>

    `);
}

//hides the pages for when switching between tabs on the navbar
function hidePages()
{
  $allStoriesList.hide();
  $storyForm.addClass("hidden");
  $myStoriesList.addClass("hidden");
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  SHOWING_FAVORITES= false;
  console.debug("putStoriesOnPage");
  hidePages();
  $allStoriesList.empty();
  $allStoriesList.show();
  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

 
}


$navMyStories.on("click", showMyStories);

function showMyStories()
{
  SHOWING_FAVORITES= false;
  hidePages();
  $myStoriesList.removeClass("hidden");
  $myStoriesList.empty();
  for (let story of currentUser.ownStories)
  {
    const $story = generateStoryMarkup(story);
    $myStoriesList.append($story);
  }
}



$navFavorites.on("click", showFavoriteStories);

function showFavoriteStories()
{
  hidePages();
  $allStoriesList.show();
  SHOWING_FAVORITES= true;
  console.debug("showFavoriteStories");
  $allStoriesList.empty();
  for (let story of currentUser.favorites)
  {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
}

$storyForm.on("submit", GenerateNewStory);

// creates a new story based on the $newStory Form
async function GenerateNewStory(evt)
{
   evt.preventDefault();
   const enteredTitle = $("#title").val();
   const enteredAuthor = $("#author").val();
   const enteredUrl = $("#url").val();
   await storyList.addStory(currentUser, {title: enteredTitle, author :enteredAuthor, url: enteredUrl});
   $storyForm.addClass("hidden");
   putStoriesOnPage();
   $("#title").val("");
   $("#author").val("");
   $("#url").val("");
}

