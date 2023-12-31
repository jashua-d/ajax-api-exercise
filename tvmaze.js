// Constant for missing show image
const MISSING_IMAGE_URL = "http://tinyurl.com/missing-tv";

/** 
 * Given a query string, return an array of matching shows:
 * { id, name, summary, image, episodesUrl }
 */

async function searchShows(query) {
    try {
        // Make an AJAX request to the TVMaze API for search shows
        const response = await axios.get(`https://api.tvmaze.com/search/shows?q=${query}`);

        // Map the relevant data from the response to a cleaner format
        let shows = response.data.map(result => {
            let show = result.show;
            return {
                id: show.id,
                name: show.name,
                summary: show.summary || "No summary available",
                // Set the show image or use the missing image URL if not available
                image: show.image ? show.image.medium : MISSING_IMAGE_URL,
            };
        });

        return shows;
    } catch (error) {
        console.error("Error searching for shows:", error);

        // Display an error message to the user
        showError("Error fetching shows. Please try again.");

        return [];
    }
}

// Function to show an error message

function showError(message) {
    alert(message);
}

/** 
 * Populate shows list:
 * - given a list of shows, add shows to the DOM
 */

function populateShows(shows) {
    const $showsList = $("#shows-list");
    $showsList.empty();

    for (let show of shows) {
        let $item = $(`
            <div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
                <div class="card" data-show-id="${show.id}">
                    <img class="card-img-top" src="${show.image}">
                    <div class="card-body">
                        <h5 class="card-title">${show.name}</h5>
                        <p class="card-text">${show.summary}</p>
                        <button class="btn btn-primary get-episodes">Episodes</button>
                    </div>
                </div>
            </div>
        `);

        $showsList.append($item);
    }

    // Use event delegation on a static parent (#shows-list) for "Episodes" button

    $showsList.on("click", ".get-episodes", async function (evt) {
        evt.preventDefault();

        // Get the show ID of the clicked button
        let showId = $(this).closest(".Show").data("show-id");

        try {
            // Get episodes for the selected show and display them

            let episodes = await getEpisodes(showId);
            populateEpisodes(episodes);
        } catch (error) {
            console.error("Error getting episodes:", error);

            // Display an error message to the user
            showError("Error fetching episodes. Please try again.");
        }
    });
}

/** 
 * Handle search form submission:
 * - hide the episodes area
 * - get a list of matching shows and show them in the shows list
 */

$("#search-form").on("submit", async function handleSearch(evt) {
    evt.preventDefault();

    let query = $("#search-query").val();
    if (!query) return;

    // Clear previous episodes and hide the episodes area

    $("#episodes-list").empty();
    $("#episodes-area").hide();

    try {
        // Perform a search for shows based on the user's input
        let shows = await searchShows(query);

        // Display the matching shows in the UI
        populateShows(shows);
    } catch (error) {
        console.error("Error handling search:", error);
        // Display an error message to the user
        showError("Error fetching shows. Please try again.");
    }
});

/** 
 * Given a show ID, return a list of episodes:
 * { id, name, season, number }
 */

async function getEpisodes(id) {
    try {
        // Make an AJAX request to the TVMaze API to get show episodes
        let response = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);

        // Map the episode data to a cleaner format
        let episodes = response.data.map(episode => ({
            id: episode.id,
            name: episode.name,
            season: episode.season,
            number: episode.number,
        }));

        return episodes;
    } catch (error) {
        console.error("Error getting episodes:", error);
        return [];
    }
}

/** 
 * Populate episodes list:
 * - given a list of episodes, add them to the DOM
 */

function populateEpisodes(episodes) {
    const $episodesList = $("#episodes-list");
    $episodesList.empty();

    for (let episode of episodes) {
        let $item = $(`
            <li>
                ${episode.name}
                (season ${episode.season}, episode ${episode.number})
            </li>
        `);

        $episodesList.append($item);
    }

    // Show the #episodes-area
    $("#episodes-area").show();
}

/** 
 * Handle click on a show name.
 */

$("#shows-list").on("click", ".get-episodes", async function handleEpisodeClick(evt) {
    let showId = $(evt.target).closest(".Show").data("show-id");

    try {
        // Get episodes for the selected show and display them
        let episodes = await getEpisodes(showId);
        populateEpisodes(episodes);
    } catch (error) {
        console.error("Error getting episodes:", error);
        // Display an error message to the user
        showError("Error fetching episodes. Please try again.");
    }
});
