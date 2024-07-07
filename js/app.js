$(document).ready(function(){
    // Initialize the carousel with interval and wrap settings
    $('#ticketCarousel').carousel({
        interval: 4000,
        wrap: true
    });

    // Fetch the Firebase config from the PHP endpoint
    fetchFirebaseConfig();
});

function fetchFirebaseConfig() {
    fetch('https://thailottery.42web.io/endpoint.php')
        .then(response => response.json())
        .then(firebaseConfig => {

            // Initialize Firebase with the fetched config
            firebase.initializeApp(firebaseConfig);
            var database = firebase.database();

            // Call the function to fetch tickets for a specific date
            fetchTicketsForDate(database, '1July2024');
        })
        .catch(error => {
            console.error('Error fetching Firebase config:', error);
        });
}

function fetchTicketsForDate(database, dateNode) {
    database.ref('tickets/' + dateNode).on('value', function(snapshot) {
        var tickets = snapshot.val();

        var ticketContainer = $('.row').eq(2); // Target the appropriate container for all tickets
        var carouselInner = $('#ticketCarousel .carousel-inner'); // Target the carousel inner container

        var isFirstItem = true;
        var availableTicketCount = 0;

        // Clear existing content before appending new items
        ticketContainer.empty();
        carouselInner.empty();

        for (var id in tickets) {
            if (tickets.hasOwnProperty(id)) {
                var ticket = tickets[id];
                if (ticket.available) {
                    availableTicketCount++;
                    var formattedTicketNumber = ticket.ticketNumber.split('').join(' ');

                    // Add 'active' class to the first carousel item
                    var activeClass = isFirstItem ? 'active' : '';
                    var carouselItemHtml = `
                        <div class="carousel-item ${activeClass}">
                            <img src="${ticket.ticketImagePath}" class="d-block w-100" alt="Ticket ${ticket.ticketNumber}" loading="lazy">
                        </div>
                    `;
                    carouselInner.append(carouselItemHtml);

                    // Create HTML for individual ticket card
                    var ticketHtml = `
                        <div class="col-6 col-md-3 mb-4">
                            <div class="card" data-toggle="modal" data-target="#ticketModal" data-img="${ticket.ticketImagePath}" data-description="${formattedTicketNumber}">
                                <img src="${ticket.ticketImagePath}" class="card-img-top" alt="Ticket ${ticket.ticketNumber}" loading="lazy">
                                <div class="card-body text-center">
                                    <p class="card-text">${formattedTicketNumber}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    ticketContainer.append(ticketHtml);

                    isFirstItem = false; // Update isFirstItem flag after the first carousel item
                }
            }
        }

        // Display message if no tickets are available
        if (availableTicketCount > 0) {
            $('#availableTicketsCount').text(`(Only ${availableTicketCount} Ticket(s) Available)`);
        } else {
            $('#availableTicketsCount').html(`လက်မှတ်များကုန်သွားပါပြီ <br/><br/> ဘတ် ၆ သန်း ဆုကြီး ဆွတ်ခူးနိုင်ကြပါစေဗျား <br/><br/> 
                <em style="color:red">" လက်မှတ်အသစ်များရလျှင်ထပ်တင်ပေးပါမည် "</em> <br/><br/>
                Follow Us On Facebook <br/>
                <div class="buttons">
                    <a href="#" class="social-btn" onclick="window.location.href='https://www.facebook.com/phyoheinkyaw.bm'; return false;">
                        <i class="fab fa-facebook-f"></i> <span>Phyo Hein Kyaw</span>
                    </a>
                    <a href="#" class="social-btn" onclick="window.location.href='https://www.facebook.com/sarkura.snow'; return false;">
                        <i class="fab fa-facebook-f"></i> <span>Nan Nwe</span>
                    </a>
                </div>`);

            var staticImageHtml = `
                <div class="carousel-item active">
                    <img src="img/noticket.png" class="d-block w-100" alt="No Tickets Available" loading="lazy">
                </div>
            `;
            carouselInner.append(staticImageHtml);
        }

        // Initialize the carousel after appending items
        $('#ticketCarousel').carousel();

        // Re-attach modal event handlers
        $('.card').off('click').on('click', function () {
            var imgSrc = $(this).data('img');
            var description = $(this).data('description');
            $('#modalImage').attr('src', imgSrc);
            $('#modalDescription').text(description);
        });
    });
}
