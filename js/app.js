$(document).ready(function() {
    // Initialize the carousel with interval and wrap settings
    $('#ticketCarousel').carousel({
        interval: 4000,
        wrap: true
    });

    // Directly use the Firebase config
    initializeFirebase();
});

function initializeFirebase() {
    var firebaseConfig = {
        apiKey: 'AIzaSyDiqIjcxw0EIKBUk1oSd-qmwu9eyLEK-08',
        authDomain: 'thailottery-cc39c.firebaseapp.com',
        databaseURL: 'https://thailottery-cc39c-default-rtdb.asia-southeast1.firebasedatabase.app/',
        projectId: 'thailottery-cc39c',
        storageBucket: 'thailottery-cc39c.appspot.com',
        messagingSenderId: '553426099598',
        appId: '1:553426099598:web:3b5184a3e8039f932218df'
    };

    // Initialize Firebase with the provided config
    firebase.initializeApp(firebaseConfig);
    var database = firebase.database();

    // Call the functions to fetch tickets and winners for a specific date
    fetchWinnersForDate(database, 'xxx');
    fetchTicketsForDate(database, '16July2024', 'xxx');
}

function fetchWinnersForDate(database, dateNode) {
    database.ref('winners/' + dateNode).on('value', function(snapshot) {
        var winners = snapshot.val();
        var winnersContainer = $('#winners'); // Target the container for winners

        // Clear existing content before appending new items
        winnersContainer.empty();
        
        // Define a mapping for category titles
        var categoryTitles = {
            firstPrize: "ပထမဆု (ဘတ် ၆ သန်း)",
            secondPrize: "ဒုတိယဆု (ဘတ် ၂ သိန်း)",
            thirdPrize: "တတိယဆု (ဘတ် ၈ သောင်း)",
            fourthPrize: "စတုတ္ထဆု (ဘတ် ၄ သောင်း)",
            fifthPrize: "ပဥ္စမဆု (ဘတ် ၂ သောင်း)",
            nearFirstPrize: "အနီးစပ်ဆုံးပထမဆု (ဘတ် ၁ သိန်း)",
            firstThreeDigits: "ရှေ့ဆုံးသုံးလုံးတူ (ဘတ် ၄ ထောင်)",
            lastThreeDigits: "နောက်ဆုံးသုံးလုံးတူ (ဘတ် ၄ ထောင်)",
            lastTwoDigits: "နောက်ဆုံးနှစ်လုံးတူ (ဘတ် ၂ ထောင်)"
        };

        var categoriesOrder = [
            'firstPrize',
            'secondPrize',
            'nearFirstPrize',
            'thirdPrize',
            'fourthPrize',
            'fifthPrize',
            'firstThreeDigits',
            'lastThreeDigits',
            'lastTwoDigits'
        ];

        categoriesOrder.forEach(category => {
            var categoryRef = database.ref('winners/' + dateNode + '/' + category);
            categoryRef.once('value', function(snapshot) {
                var categoryWinners = snapshot.val();
                if (categoryWinners) {
                    var categoryTitle = categoryTitles[category]; // Get the title from the mapping

                    var categoryHtml = `
                        <div class="col-12">
                            <h3 class="text-center my-4">${categoryTitle}</h3>
                        </div>
                    `;
                    winnersContainer.append(categoryHtml);

                    for (var id in categoryWinners) {
                        if (categoryWinners.hasOwnProperty(id)) {
                            var winner = categoryWinners[id];
                            var formattedTicketNumber = winner.ticketNumber.split('').join(' ');

                            // Create HTML for individual winner card
                            var winnerHtml = `
                                <div class="col-6 col-md-3 mb-4">
                                    <div class="card" data-toggle="modal" data-target="#ticketModal" data-img="${winner.ticketImagePath}" data-description="${formattedTicketNumber}">
                                        <img src="${winner.ticketImagePath}" class="card-img-top" alt="Winner Ticket ${winner.ticketNumber}" loading="lazy">
                                        <div class="card-body text-center">
                                            <p class="card-text">${formattedTicketNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            `;
                            winnersContainer.append(winnerHtml);
                        }
                    }
                }
            });
        });

        // Re-attach modal event handlers for winner cards
        $('.card').off('click').on('click', function () {
            var imgSrc = $(this).data('img');
            var description = $(this).data('description');
            $('#modalImage').attr('src', imgSrc);
            $('#modalDescription').text(description);
        });
    });
}


function fetchTicketsForDate(database, dateNode, winnerDate) {
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
        database.ref('winners/' + winnerDate).on('value', function(snapshot) {
            var winners = snapshot.val();
        if (availableTicketCount > 0) {
            $('#availableTicketsCount').text(`(Only ${availableTicketCount} Ticket(s) Available)`);
        } else if (winners){
            $('#availableTicketsCount').html('');
            $('#winnersTicketsCount').html(`<em style="color:red">ဂျူလိုင် ၁ ရက်နေ့အတွက်<br/><br/>ထိုင်းထီဆု ကံထူးသူများ<br/><br/>ထွက်ပေါ်လာပါပြီ ခင်ဗျာ</em>`);

            var staticImageHtml = `
                <div class="carousel-item active">
                    <img src="img/winnerStatic.png" class="d-block w-100" alt="There's our winners" loading="lazy">
                </div>
            `;
            carouselInner.append(staticImageHtml);
        }else{
            $('#winnersTicketsCount').html('');
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
    })

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
