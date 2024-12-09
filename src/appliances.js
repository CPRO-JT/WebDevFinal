$(document).ready(function () {
    // Sample data for the cards
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

    let temp = [
        {
            title: "Card Title 1",
            description: "This is a detailed description of card 1.",
            image: "https://via.placeholder.com/300x200",
        },
        {
            title: "Card Title 2",
            description: "This is a detailed description of card 2.",
            image: "https://via.placeholder.com/300x200",
        },
        {
            title: "Card Title 3",
            description: "This is a detailed description of card 3.",
            image: "https://via.placeholder.com/300x200",
        },
        {
            title: "Card Title 4",
            description: "This is a detailed description of card 4.",
            image: "https://via.placeholder.com/300x200",
        },
    ];

    // Generate cards dynamically
    const $cardContainer = $(".card-container");

    AMT.SyncWithDesktop(DesktopSync);

    function DesktopSync() {
        cardData(AMT.Appliances).forEach((card) => {
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
    }
});
