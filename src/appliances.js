$(document).ready(function () {
    // create Card Data from Appliance Data for use in displaying on page
    const cardData = (ApplianceData) => {
        let result = [];
        for (let Appliance of ApplianceData) {
            result.push({
                title: Appliance.Name,
                description: Appliance.Details,
                image: "https://via.placeholder.com/300x200",
            });
        }
        return result;
    };

    // Generate cards dynamically
    const $cardContainer = $(".card-container");

    // Ask AMT to SyncWithDesktop and callback to DesktopSync when complete
    try {
        AMT.SyncWithDesktop(DesktopSync);
    } catch (e) {
        console.error(e);
        DesktopSync();
    }

    // Just a callback wrapper, no other reason for it to be a function
    function DesktopSync() {
        let CardData = [...AMT.Appliances];
        if (CardData < 1) {
            CardData = JSON.parse(localStorage.getItem("AMT_Appliances"));
        }
        // get card data and loop through all of it
        cardData(CardData).forEach((card) => {
            // declare the html template we will use with the card data
            const cardHtml = `
                <div class="card" data-title="${card.title}" data-description="${card.description}" data-image="${
                card.image
            }">
                    <img src="${card.image}" alt="Card Image" />
                    <div class="card-content">
                        <h3>${card.title}</h3>
                        <p>${card.description.substring(0, 50)}...</p>
                    </div>
                    <div class="card-footer">
                        <button class="btn">Read More</button>
                    </div>
                </div>`;
            // append the card html fragment to the container
            $cardContainer.append(cardHtml);
        });

        // Add click event listener to "Read More" buttons
        $(document).on("click", ".btn", function () {
            const $card = $(this).closest(".card");
            const title = $card.data("title");
            const description = $card.data("description");
            const image = $card.data("image");

            const subPageUrl = `../WebFinal/views/subpage.html?title=${encodeURIComponent(
                title
            )}&description=${encodeURIComponent(description)}&image=${encodeURIComponent(image)}`;
            window.location.href = subPageUrl;
        });

        if (AMT.Appliances.length > 0) {
            localStorage.setItem("AMT_Appliances", JSON.stringify(AMT.Appliances));
        }
    }
});
