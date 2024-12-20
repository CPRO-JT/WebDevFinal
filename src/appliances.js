$(document).ready(function () {
    // Function to transform Appliance Data into a format suitable for displaying as cards
    let cardData = (ApplianceData) => {
        let result = [];
        for (let Appliance of ApplianceData) {
            // Create a card object for each appliance with title, description, and placeholder image
            result.push({
                index: ApplianceData.indexOf(Appliance),
                title: Appliance.Name,
                description: Appliance.Details,
                image: "https://via.placeholder.com/300x200", // Placeholder image
            });
        }
        return result; // Return the transformed card data array
    };

    // Container where cards will be dynamically generated and appended
    const $cardContainer = $(".card-container");

    // Synchronize data with the desktop app and handle callback when synchronization is complete
    try {
        AMT.SyncWithDesktop(DesktopSync);
    } catch (e) {
        // Log any errors in the synchronization process
        console.error(e);
        // If SyncWithDesktop fails, call DesktopSync directly
        DesktopSync();
    }

    // Callback function to process appliances data and generate cards
    function DesktopSync() {
        let CardData = [...AMT.Appliances]; // Copy appliance data from AMT object

        // Fallback to localStorage data if no appliances are found
        if (CardData.length < 1) {
            CardData = JSON.parse(localStorage.getItem("AMT_Appliances"));
        }

        // Transform appliance data into card data and generate HTML for each card
        cardData(CardData).forEach((card, index) => {
            // HTML template for each card
            let cardHtml = `
                <div class="card" data-title="${card.title}" data-description="${card.description}" data-image="${
                card.image}" card-index="${index}">
                    <img src="${card.image}" alt="Card Image" id="card-image" />
                    <div class="card-content">
                        <h3>${card.title}</h3>
                        <p>${card.description.substring(0, 50)}...</p> 
                    </div>
                    <div class="card-footer">
                        <button class="btn">Read More</button>
                    </div>
                </div>`;
            // Append the generated card to the container //CARD IMAGE ID
            $cardContainer.append(cardHtml);
        });

        // Add a click event listener to the "Read More" buttons for navigation
        $(document).on("click", ".btn", function () {
            // Get the parent card element and extract its data attributes
            let $card = $(this).closest(".card");
            const title = $card.data("title");
            const description = $card.data("description");
            /*let image = JSON.stringify($card.find("img"));
            console.log(image);
            console.log(image.src);
            let imagesrc = image.src;*/
            let $image = $card.find("img").first();

            // Log the image element and its src
            console.log($image);
            console.log($image.attr("src"));

            // Now you can get the src like this:
            let imagesrc = $image.attr("src");

            // Construct the URL for the subpage with the card's details as query parameters
            let subPageUrl = `../WebFinal/views/subpage.html?title=${encodeURIComponent(
                title
            )}&description=${encodeURIComponent(description)}&image=${encodeURIComponent(imagesrc)}`;
            // Navigate to the subpage
            window.location.href = subPageUrl;
        });

        $(document).on("click", "#card-image", function () {
            // Prompt user for the image URL
            let userInput = prompt("Please enter the new image URL:");
        
            let $card = $(this).closest(".card");
        

            $card.find("img").attr("src", userInput);

        });


        // Save appliance data to localStorage for fallback usage
        if (AMT.Appliances.length > 0) {
            localStorage.setItem("AMT_Appliances", JSON.stringify(AMT.Appliances));
        }

    }
});
