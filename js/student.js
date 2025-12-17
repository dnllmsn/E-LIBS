/* --- PTC Library System --- */
/* --- Student Page Logic --- */

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = window.appData.getCurrentUser();

    // --- AUTHENTICATION GUARD ---
    if (!currentUser || currentUser.role !== 'student') {
        alert('You must be logged in as a student to access this page.');
        window.location.href = 'student-login.html';
        return; // Stop script execution
    }

    const bookList = document.getElementById('book-list');
    const searchInput = document.getElementById('searchInput');
    const logoutBtn = document.getElementById('logout-btn');
    const welcomeMessage = document.getElementById('welcome-message');
    const notificationPanel = document.querySelector('.notification-panel');
    const notificationList = document.getElementById('notification-list');

    // Personalize welcome message
    welcomeMessage.textContent = `Welcome, ${currentUser.name}! Search for books and request to borrow them.`;

    // --- LOGOUT ---
    logoutBtn.addEventListener('click', () => {
        window.appData.logoutUser();
        showToast('You have been logged out.', 'info');
        setTimeout(() => window.location.href = 'index.html', 1000);
    });
    
    // Load initial book data
    displayBooks();
    renderNotifications();

    // Initialize polling state
    window.appData._lastBooksState = JSON.stringify(window.appData.getBooks());
    window.appData._lastRequestsState = JSON.stringify(window.appData.getRequests());
    window.appData._lastNotificationsState = JSON.stringify(window.appData.getNotifications());

    // Start real-time polling (check every 500ms for changes)
    window.appData.startPolling(500);

    // Add event listener for the search input
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        displayBooks(searchTerm);
    });

    // Listen for changes in localStorage from other tabs/windows
    window.addEventListener('storage', (event) => {
        if (event.key === 'books' || event.key === 'requests' || event.key === 'notifications') {
            displayBooks(searchInput.value.toLowerCase());
            renderNotifications();
        }
    });

    // Listen for custom events from the same tab (for real-time updates)
    window.addEventListener('booksUpdated', () => {
        displayBooks(searchInput.value.toLowerCase());
        renderNotifications();
    });

    window.addEventListener('notificationsUpdated', () => {
        renderNotifications();
    });

    // Stop polling when user logs out
    logoutBtn.addEventListener('click', () => {
        window.appData.stopPolling();
    });

    function displayBooks(searchTerm = '') {
        const books = window.appData.getBooks();
        bookList.innerHTML = ''; // Clear existing list

        const filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(searchTerm) || 
            book.author.toLowerCase().includes(searchTerm)
        );

        if (filteredBooks.length === 0) {
            bookList.innerHTML = '<p>No books found.</p>';
            return;
        }

        filteredBooks.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            if (book.status === 'Available') {
                card.classList.add('clickable');
                card.dataset.id = book.id;
            }
            card.innerHTML = `
                <div class="book-cover">
                    ${book.cover ? `<img src="${book.cover}" alt="${book.title} Cover" style="width:100%; height:100%; object-fit:cover;">` : 'No Cover Available'}
                </div>
                <h3>${book.title}</h3>
                <p>by ${book.author}</p>
                <div class="status status-${book.status.toLowerCase()}">${book.status}</div>
                ${book.status === 'Available' ? '<button class="btn borrow-btn" data-id="' + book.id + '">Request to Borrow</button>' : ''}
            `;
            bookList.appendChild(card);
        });
    }

    function renderNotifications() {
        const allNotifications = window.appData.getNotifications();
        const relevantNotifications = allNotifications.filter(notif => 
            !notif.studentId || notif.studentId === currentUser.id
        ).sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first

        notificationList.innerHTML = '';

        if (relevantNotifications.length === 0) {
            notificationList.innerHTML = '<li>No notifications.</li>';
            return;
        }

        relevantNotifications.forEach(notif => {
            const item = document.createElement('li');
            item.innerHTML = `
                <div class="notification-content">
                    <div class="notification-message">${notif.message}</div>
                    <button class="delete-notification-btn" data-id="${notif.id}" title="Delete notification">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            notificationList.appendChild(item);
        });
    }

    // Event delegation for borrow buttons and clickable cards
    bookList.addEventListener('click', (e) => {
        console.log('Book list clicked:', e.target);
        const target = e.target;
        const borrowBtn = target.closest('.borrow-btn');
        const clickableCard = target.closest('.book-card.clickable');

        console.log('Borrow button found:', borrowBtn);
        console.log('Clickable card found:', clickableCard);

        if (borrowBtn) {
            const bookId = parseInt(borrowBtn.dataset.id, 10);
            console.log('Sending borrow request for book ID:', bookId);
            sendBorrowRequest(bookId);
        } else if (clickableCard) {
            const bookId = parseInt(clickableCard.dataset.id, 10);
            console.log('Sending borrow request for clickable card book ID:', bookId);
            sendBorrowRequest(bookId);
        }
    });

    // Event delegation for delete notification buttons
    notificationList.addEventListener('click', (e) => {
        console.log('Notification list clicked:', e.target);
        const deleteBtn = e.target.closest('.delete-notification-btn');
        console.log('Delete button found:', deleteBtn);
        if (deleteBtn) {
            const notificationId = parseInt(deleteBtn.dataset.id, 10);
            console.log('Deleting notification ID:', notificationId);
            deleteNotification(notificationId);
        }
    });

    function deleteNotification(notificationId) {
        console.log('deleteNotification called with ID:', notificationId);
        let notifications = window.appData.getNotifications();
        console.log('Current notifications:', notifications);
        notifications = notifications.filter(notif => notif.id !== notificationId);
        console.log('Notifications after filter:', notifications);
        window.appData.saveNotifications(notifications);
        showToast('Notification deleted.', 'info');
    }

    function sendBorrowRequest(bookId) {
        const books = window.appData.getBooks();
        const requests = window.appData.getRequests();

        const book = books.find(b => b.id === bookId);
        if (book && book.status === 'Available') {
            // Update book status to 'Pending'
            book.status = 'Pending';
            window.appData.saveBooks(books);

            // Create a new request with the logged-in student's data
            const newRequest = {
                id: requests.length + 1, // Keep separate request tracking for librarian view
                bookId: bookId,
                studentId: currentUser.id,
                studentName: currentUser.name,
                status: 'Pending',
                read: false // This 'read' status is for the request object, not the notification
            };
            requests.push(newRequest);
            window.appData.saveRequests(requests);

            // Create a notification for the student
            const notifications = window.appData.getNotifications();
            const newNotification = {
                id: notifications.length + 1,
                type: 'request-update',
                message: `Your request for "${book.title}" has been sent for approval.`,
                timestamp: Date.now(),
                studentId: currentUser.id
            };
            notifications.push(newNotification);
            window.appData.saveNotifications(notifications);

            // Update UI and show notification
            displayBooks(searchInput.value.toLowerCase());
            showToast('Borrow request sent successfully!', 'success');
        } else {
            showToast('This book is not available for request.', 'error');
        }
    }
});
