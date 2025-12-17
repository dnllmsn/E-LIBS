/* --- PTC Library System --- */
/* --- Librarian Page Logic --- */

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

    // Personalize and set up logout
    welcomeMessage.textContent = `Welcome, ${currentUser.name}! Manage book requests and inventory.`;
    logoutBtn.addEventListener('click', () => {
        window.appData.logoutUser();
        showToast('You have been logged out.', 'info');
        setTimeout(() => window.location.href = 'index.html', 1000);
    });

    // Initial dashboard render
    renderDashboard();

    function renderDashboard() {
        dashboardContent.innerHTML = `
            <div class="requests-section">
                <h2>Pending Borrow Requests</h2>
                <div id="request-list" class="request-list"></div>
            </div>
            <hr style="margin: 40px 0;">
            <div class="inventory-section">
                <h2>Full Book Inventory Management</h2>
                <div id="all-books-list" class="all-books-list"></div>
            </div>
        `;
        displayRequests();
        displayAllBooks();
    }

    function displayRequests() {
        const requestList = document.getElementById('request-list');
        const requests = window.appData.getRequests().filter(r => r.status === 'Pending');
        const books = window.appData.getBooks();
        
        requestList.innerHTML = '';

        if (requests.length === 0) {
            requestList.innerHTML = '<p>No pending requests.</p>';
            return;
        }

        requests.forEach(request => {
            const book = books.find(b => b.id === request.bookId);
            const item = document.createElement('div');
            item.className = 'request-item';
            item.innerHTML = `
                <div class="request-main-info">
                    <div class="request-details">
                        <strong>Book:</strong> ${book ? book.title : 'Unknown'}<br>
                        <em>Student:</em> ${request.studentName} (ID: ${request.studentId})
                    </div>
                    ${book && book.cover ? `<img src="${book.cover}" alt="${book.title} Cover" class="request-book-thumbnail">` : ''}
                </div>
                <div class="request-actions">
                    <button class="btn approve-btn" data-id="${request.id}">Approve</button>
                    <button class="btn decline-btn" data-id="${request.id}">Decline</button>
                </div>
            `;
            requestList.appendChild(item);
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
    dashboardContent.addEventListener('click', (e) => {
        const target = e.target;
        const requestId = parseInt(target.dataset.id, 10);

        if (target.classList.contains('approve-btn') || target.classList.contains('decline-btn')) {
            handleRequest(requestId, target.classList.contains('approve-btn'));
        } else if (target.classList.contains('update-status-btn')) {
            const bookId = parseInt(target.dataset.id, 10);
            const select = dashboardContent.querySelector(`select[data-id="${bookId}"]`);
            updateBookStatus(bookId, select.value);
        }
    });
    
    function handleRequest(requestId, isApproved) {
        let requests = window.appData.getRequests();
        let books = window.appData.getBooks();
        const request = requests.find(r => r.id === requestId);

        if (request) {
            const book = books.find(b => b.id === request.bookId);
            if (isApproved) {
                book.status = 'Reserved';
                request.status = 'Approved';
                showToast('Request approved. Book is now reserved.', 'success');
            } else {
                book.status = 'Available';
                request.status = 'Declined';
                showToast('Request declined. Book is available again.', 'info');
            }
            
            window.appData.saveBooks(books);
            window.appData.saveRequests(requests);
            renderDashboard();
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
            renderDashboard();
        }
    }
});