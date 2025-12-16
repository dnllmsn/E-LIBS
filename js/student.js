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

    // Add event listener for the search input
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        displayBooks(searchTerm);
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

    // Event delegation for borrow buttons
    bookList.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('borrow-btn')) {
            const bookId = parseInt(e.target.dataset.id, 10);
            sendBorrowRequest(bookId);
        }
    });

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
                id: requests.length + 1,
                bookId: bookId,
                studentId: currentUser.id,
                studentName: currentUser.name,
                status: 'Pending'
            };
            requests.push(newRequest);
            window.appData.saveRequests(requests);

            // Update UI and show notification
            displayBooks(searchInput.value.toLowerCase());
            showToast('Borrow request sent successfully!', 'success');
        } else {
            showToast('This book is not available for request.', 'error');
        }
    }
});