document.addEventListener('DOMContentLoaded', () => {
    const currentUser = window.appData.getCurrentUser();

    // --- AUTHENTICATION GUARD ---
    if (!currentUser || currentUser.role !== 'librarian') {
        alert('You must be logged in as a librarian to access this page.');
        window.location.href = 'librarian-login.html';
        return; // Stop script execution
    }

    const dashboardContent = document.getElementById('dashboard-content');
    const logoutBtn = document.getElementById('logout-btn');
    const welcomeMessage = document.getElementById('welcome-message');
    const notificationPanel = document.querySelector('.notification-panel');

    // Personalize and set up logout
    welcomeMessage.textContent = `Welcome, ${currentUser.name}! Manage book requests and inventory.`;
    logoutBtn.addEventListener('click', () => {
        window.appData.logoutUser();
        showToast('You have been logged out.', 'info');
        setTimeout(() => window.location.href = 'index.html', 1000);
    });

    // Initial dashboard render
    renderDashboard();
    renderNotifications(); // Initial render of notifications

    // Initialize polling state
    window.appData._lastBooksState = JSON.stringify(window.appData.getBooks());
    window.appData._lastRequestsState = JSON.stringify(window.appData.getRequests());
    window.appData._lastNotificationsState = JSON.stringify(window.appData.getNotifications());

    // Start real-time polling (check every 500ms for changes)
    window.appData.startPolling(500);

    // Listen for storage changes to update notifications in real-time
    window.addEventListener('storage', (event) => {
        if (event.key === 'requests' || event.key === 'books' || event.key === 'notifications') {
            renderNotifications();
            displayAllBooks(); // Also refresh the main book list
        }
    });

    // Listen for custom events from the same tab (for real-time updates)
    window.addEventListener('booksUpdated', () => {
        renderNotifications();
        displayAllBooks();
    });

    window.addEventListener('notificationsUpdated', () => {
        renderNotifications();
    });

    // Stop polling when user logs out
    logoutBtn.addEventListener('click', () => {
        window.appData.stopPolling();
    });

    function renderDashboard() {
        dashboardContent.innerHTML = `
            <div class="inventory-section">
                <h2>Full Book Inventory Management</h2>
                <div id="all-books-list" class="all-books-list"></div>
            </div>
        `;
        displayAllBooks();
    }

    function renderNotifications() {
        const notificationList = document.getElementById('notification-list');
        const requests = window.appData.getRequests().filter(r => r.status === 'Pending');
        const books = window.appData.getBooks();

        notificationList.innerHTML = '';

        if (requests.length === 0) {
            notificationList.innerHTML = '<li>No pending requests.</li>';
            return;
        }

        requests.forEach(request => {
            const book = books.find(b => b.id === request.bookId);
            const item = document.createElement('li');
            item.innerHTML = `
                <div class="notification-content">
                    <div>
                        <div class="book-title">${book ? book.title : 'Unknown'}</div>
                        <div class="student-name">by ${request.studentName}</div>
                    </div>
                    <button class="delete-notification-btn" data-id="${request.id}" title="Delete request">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="actions">
                    <button class="btn approve-btn" data-id="${request.id}">Approve</button>
                    <button class="btn decline-btn" data-id="${request.id}">Decline</button>
                </div>
            `;
            notificationList.appendChild(item);
        });
    }

    function displayAllBooks() {
        const allBooksList = document.getElementById('all-books-list');
        const books = window.appData.getBooks();
        const statuses = ['Available', 'Pending', 'Reserved', 'Borrowed', 'Returned'];

        allBooksList.innerHTML = '';
        
        books.forEach(book => {
            const item = document.createElement('div');
            item.className = 'book-management-item';
            
            const selectOptions = statuses.map(s => 
                `<option value="${s}" ${book.status === s ? 'selected' : ''}>${s}</option>`
            ).join('');

            item.innerHTML = `
                <div class="book-info">
                    ${book.cover ? `<img src="${book.cover}" alt="${book.title} Cover" class="book-cover-thumbnail">` : ''}
                    <strong>${book.title}</strong><br>
                    <em>Current Status:</em> <span class="status status-${book.status.toLowerCase()}">${book.status}</span>
                </div>
                <div class="management-actions">
                    <select data-id="${book.id}">
                        ${selectOptions}
                    </select>
                    <button class="btn update-status-btn" data-id="${book.id}">Update</button>
                </div>
            `;
            allBooksList.appendChild(item);
        });
    }

    // Event delegation for librarian actions
    notificationPanel.addEventListener('click', (e) => {
        console.log('Notification panel clicked:', e.target);
        const target = e.target;
        const deleteBtn = target.closest('.delete-notification-btn');
        const approveBtn = target.closest('.approve-btn');
        const declineBtn = target.closest('.decline-btn');

        console.log('Delete button:', deleteBtn);
        console.log('Approve button:', approveBtn);
        console.log('Decline button:', declineBtn);

        if (deleteBtn) {
            const requestId = parseInt(deleteBtn.dataset.id, 10);
            console.log('Deleting request ID:', requestId);
            deleteRequest(requestId);
        } else if (approveBtn || declineBtn) {
            const requestId = parseInt(target.dataset.id, 10);
            handleRequest(requestId, approveBtn ? true : false);
        }
    });

    dashboardContent.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('update-status-btn')) {
            const bookId = parseInt(target.dataset.id, 10);
            const select = dashboardContent.querySelector(`select[data-id="${bookId}"]`);
            updateBookStatus(bookId, select.value);
        }
    });
    
    function deleteRequest(requestId) {
        let requests = window.appData.getRequests();
        requests = requests.filter(req => req.id !== requestId);
        window.appData.saveRequests(requests);
        showToast('Request deleted.', 'info');
    }

    function handleRequest(requestId, isApproved) {
        let requests = window.appData.getRequests();
        let books = window.appData.getBooks();
        const request = requests.find(r => r.id === requestId);

        if (request) {
            const book = books.find(b => b.id === request.bookId);
            let notificationMessage = '';
            if (isApproved) {
                book.status = 'Reserved';
                request.status = 'Approved';
                notificationMessage = `✅ Your request for "${book.title}" has been APPROVED! The book is now Reserved for you.`;
                showToast('Request approved. Book is now reserved.', 'success');
            } else {
                book.status = 'Available';
                request.status = 'Declined';
                notificationMessage = `❌ Your request for "${book.title}" has been DECLINED. The book is now Available for other students.`;
                showToast('Request declined. Book is available again.', 'info');
            }
            
            window.appData.saveBooks(books);
            window.appData.saveRequests(requests); // Keep request for librarian's historical view

            // Add notification for the student
            const notifications = window.appData.getNotifications();
            const newNotification = {
                id: notifications.length + 1,
                type: 'request-status',
                message: notificationMessage,
                timestamp: Date.now(),
                studentId: request.studentId // Target specific student
            };
            notifications.push(newNotification);
            window.appData.saveNotifications(notifications);
        }
    }

    function updateBookStatus(bookId, newStatus) {
        let books = window.appData.getBooks();
        const book = books.find(b => b.id === bookId);
        
        const finalStatus = newStatus === 'Returned' ? 'Available' : newStatus;

        if (book) {
            console.log(`Librarian: Updating book ID ${book.id} (${book.title}) from ${book.status} to ${finalStatus}`);
            book.status = finalStatus;
            console.log('Librarian: Books array before saving:', JSON.parse(JSON.stringify(books))); // Deep copy for log
            window.appData.saveBooks(books);
            console.log('Librarian: Books saved to localStorage.');
            showToast(`Book status updated to ${finalStatus}.`, 'success');
            
            // Create a general notification for book availability
            if (finalStatus === 'Available') {
                const notifications = window.appData.getNotifications();
                const newNotification = {
                    id: notifications.length + 1,
                    type: 'librarian-activity',
                    message: `${book.title} by ${book.author} is now Available!`,
                    timestamp: Date.now()
                };
                notifications.push(newNotification);
                window.appData.saveNotifications(notifications);
            }

            renderNotifications();
            displayAllBooks();
        }
    }
});