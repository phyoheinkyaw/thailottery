$(document).ready(function(){
    $('#ticketCarousel').carousel({
        interval: 4000,
        wrap: true
    });
});

// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDiqIjcxw0EIKBUk1oSd-qmwu9eyLEK-08",
    authDomain: "thailottery-cc39c.firebaseapp.com",
    databaseURL: "https://thailottery-cc39c-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "thailottery-cc39c",
    storageBucket: "thailottery-cc39c.appspot.com",
    messagingSenderId: "553426099598",
    appId: "1:553426099598:web:3b5184a3e8039f932218df"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

$(document).ready(function(){
    fetchTicketsForDate();
});

function fetchTicketsForDate(dateNode) {
    database.ref('tickets/' + dateNode).on('value', function(snapshot) {
        var tickets = snapshot.val();
        var ticketContainer = $('.row').eq(2); // Target the appropriate container for all tickets

        // Clear existing content before appending new items
        // ticketContainer.empty();

        var carouselInner = $('#ticketCarousel .carousel-inner'); // Target the carousel inner container
        // carouselInner.empty(); // Clear existing carousel items

        var isFirstItem = true;

        for (var id in tickets) {
            if (tickets.hasOwnProperty(id)) {
                var ticket = tickets[id];
                if (ticket.available) {
                    var formattedTicketNumber = ticket.ticketNumber.split('').join(' ');

                    // Add 'active' class to first carousel item
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

                    isFirstItem = false; // Update isFirstItem flag after first carousel item
                }
            }
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

// Example usage: Fetch tickets for July 1, 2024
fetchTicketsForDate('1July2024');