/* --- PTC Library System --- */
/* --- Data Handling with User Management --- */

(function () {
  // --- INITIAL DATA ---
  const initialBooks = [
    { id: 1, title: 'Systems Analysis and Design', author: 'Kenneth E. Kendall & Julie E. Kendall', status: 'Pending', cover: 'images/A.png' },
    { id: 2, title: 'Encyclopaedia of Computer Science and Engineering (Volume 1)', author: 'Dr. Rajesh Verma', status: 'Available', cover: 'images/B.png' },
    { id: 3, title: '"Cultivating Capstones: Designing High-Quality Culminating Experiences for Student Learning"', author: 'Caroline J. Ketcham, Anne M. Cafer, and Anne E. Egger', status: 'Borrowed', cover: 'images/D.png' },
    { id: 4, title: 'Discrete Mathematics And Its Applications', author: 'Kenneth H. Rosen', status: 'Reserved', cover: 'images/E.png' },
    { id: 5, title: 'Que\'s Computer & Internet Dictionary, 6th Edition', author: 'Bryan Pfaffenberger', status: 'Pending', cover: 'images/F.png' },
    { id: 6, title: 'Encyclopedia International', author: 'Encyclopedia International Editorial Board', status: 'Available', cover: 'images/G.png' },
    { id: 7, title: 'Introduction to Technopreneurship', author: 'Jennifer Padilla-Juaneza & Jake Rodriguez Pomperada', status: 'Borrowed', cover: 'images/H.png' },
    { id: 8, title: '"ETHICS: A Modular Approach"', author: 'Peter R. Ong-Montalbo, Kristoffer Kiel M. Sarmiento, Kimmore Gene G. Kwong, Ronnie M. Gallego', status: 'Reserved', cover: 'images/I.png' },
    { id: 9, title: 'JAVA 1.1 Certification Study Guide', author: 'Simon Roberts and Philip Heller', status: 'Pending', cover: 'images/J.png' },
    { id: 10, title: 'Asian Founders at Work', author: 'Ezra Ferraz, Jeremy Ong, Jonas Nahm', status: 'Available', cover: 'images/K.png' },
    { id: 11, title: '"Business Research Methods" (12th Edition)', author: 'Pamela S. Schindler', status: 'Borrowed', cover: 'images/L.png' },
    { id: 12, title: 'Compton’s', author: 'Arthur Holly Compton', status: 'Reserved', cover: 'images/M.png' },
    { id: 13, title: 'Batis: Sources in Philippine History', author: 'Jose Victor Z. Torres', status: 'Pending', cover: 'images/N.png' },
    { id: 14, title: '"Efficient Dynamic Simulation of Robotics Mechanisms"', author: 'Rohan Sharma', status: 'Available', cover: 'images/O.png' },
    { id: 15, title: '28th Commencement Exercises', author: 'Pateros Technological College', status: 'Borrowed', cover: 'images/P.png' },
    { id: 16, title: 'System Design Guide for Software Professionals', author: 'Dhirendra Sinha, Tejas Chopra', status: 'Reserved', cover: 'images/Q.png' },
    { id: 17, title: '"Innovation and Entrepreneurship"', author: 'Sunil Gupta', status: 'Pending', cover: 'images/R.png' },
    { id: 18, title: '"Database Management Systems: Study Notes"', author: 'Stanley R. Morrisey', status: 'Available', cover: 'images/S.png' },
    { id: 19, title: 'Making Money Through Intuition', author: 'Nancy Rosanoff', status: 'Borrowed', cover: 'images/T.png' },
    { id: 20, title: '"Grolier Encyclopedia of Knowledge"', author: 'Grolier', status: 'Reserved', cover: 'images/U.png' },
    { id: 21, title: '"Bigelow\'s Virus Troubleshooting Pocket Reference"', author: 'Bigelow', status: 'Pending', cover: 'images/V.png' },
    { id: 22, title: '"English Dictionary"', author: 'Unknown', status: 'Available', cover: 'images/W.png' },
    { id: 23, title: '"Basics of Nano Computer"', author: 'Roshan Sharma', status: 'Borrowed', cover: 'images/X.png' },
    { id: 24, title: '"Fundamentals of Basic Accounting"', author: 'Leonardo L. Alminia, MBA, CPA', status: 'Reserved', cover: 'images/Y.png' },
    { id: 25, title: '"Understanding the Self: Developing Your Skills"', author: 'Jennifer R. Dela Cruz, PhD', status: 'Pending', cover: 'images/Z.png' },
    { id: 26, title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams', status: 'Available', cover: 'images/1.png' },
  ];

  const initialRequests = [
      { id: 1, bookId: 8, studentId: '2023-0001', studentName: 'Alex Doe', status: 'Pending', read: false }
  ];

  // Pre-seeded librarian accounts
  const initialLibrarians = [
      { id: 1, name: 'Admin Librarian', email: 'kmsomera@paterostechnologicalcollege.edu.ph', password: 'admin123' }
  ];

  // --- LOCALSTORAGE INITIALIZATION ---
  function initializeData() {
    localStorage.setItem('books', JSON.stringify(initialBooks));
    if (!localStorage.getItem('requests')) {
      localStorage.setItem('requests', JSON.stringify(initialRequests));
    }
    localStorage.setItem('librarians', JSON.stringify(initialLibrarians));
    if (!localStorage.getItem('students')) {
      localStorage.setItem('students', JSON.stringify([])); // Start with no registered students
    }
    if (!localStorage.getItem('notifications')) {
      localStorage.setItem('notifications', JSON.stringify([]));
    }
  }

  // --- GLOBAL DATA ACCESS OBJECT ---
  window.appData = {
    // Store last known state for change detection
    _lastBooksState: null,
    _lastRequestsState: null,
    _lastNotificationsState: null,

    // Book management
    getBooks: () => JSON.parse(localStorage.getItem('books') || '[]'),
    saveBooks: (books) => {
      localStorage.setItem('books', JSON.stringify(books));
      window.appData._lastBooksState = JSON.stringify(books);
      // Dispatch custom event for real-time updates within the same tab
      window.dispatchEvent(new Event('booksUpdated'));
    },
    
    // Request management
    getRequests: () => JSON.parse(localStorage.getItem('requests') || '[]'),
    saveRequests: (requests) => {
      localStorage.setItem('requests', JSON.stringify(requests));
      window.appData._lastRequestsState = JSON.stringify(requests);
      // Dispatch custom event for real-time updates within the same tab
      window.dispatchEvent(new Event('requestsUpdated'));
    },

    // Notification management
    getNotifications: () => JSON.parse(localStorage.getItem('notifications') || '[]'),
    saveNotifications: (notifications) => {
      localStorage.setItem('notifications', JSON.stringify(notifications));
      window.appData._lastNotificationsState = JSON.stringify(notifications);
      // Dispatch custom event for real-time updates within the same tab
      window.dispatchEvent(new Event('notificationsUpdated'));
    },

    // Student management
    getStudents: () => JSON.parse(localStorage.getItem('students') || '[]'),
    saveStudents: (students) => localStorage.setItem('students', JSON.stringify(students)),

    // Librarian management
    getLibrarians: () => JSON.parse(localStorage.getItem('librarians') || '[]'),

    // Session management (using sessionStorage to persist only for the session)
    setCurrentUser: (user) => sessionStorage.setItem('currentUser', JSON.stringify(user)),
    getCurrentUser: () => JSON.parse(sessionStorage.getItem('currentUser') || 'null'),
    logoutUser: () => sessionStorage.removeItem('currentUser'),
    resetLibrarianData: () => {
        localStorage.removeItem('librarians');
        sessionStorage.removeItem('currentUser');
        initializeData();
        console.log('Librarian data and current user session reset.');
    },

    // Check for changes in data
    checkForChanges: () => {
      const currentBooks = JSON.stringify(window.appData.getBooks());
      const currentRequests = JSON.stringify(window.appData.getRequests());
      const currentNotifications = JSON.stringify(window.appData.getNotifications());

      if (currentBooks !== window.appData._lastBooksState) {
        window.appData._lastBooksState = currentBooks;
        window.dispatchEvent(new Event('booksUpdated'));
      }

      if (currentRequests !== window.appData._lastRequestsState) {
        window.appData._lastRequestsState = currentRequests;
        window.dispatchEvent(new Event('requestsUpdated'));
      }

      if (currentNotifications !== window.appData._lastNotificationsState) {
        window.appData._lastNotificationsState = currentNotifications;
        window.dispatchEvent(new Event('notificationsUpdated'));
      }
    },

    // Start polling for changes
    startPolling: (interval = 1000) => {
      window.appData._pollingInterval = setInterval(() => {
        window.appData.checkForChanges();
      }, interval);
    },

    // Stop polling
    stopPolling: () => {
      if (window.appData._pollingInterval) {
        clearInterval(window.appData._pollingInterval);
        window.appData._pollingInterval = null;
      }
    },
  };

  // Run initialization on script load
  initializeData();
})();