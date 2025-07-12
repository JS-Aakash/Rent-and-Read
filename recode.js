function runcode() {

    const searchBtn = document.getElementById('searchButton');
    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            const searchTerm = document.getElementById('searchBox').value.trim();
            if (searchTerm) {
                window.location.href = 'search.html?q=' + encodeURIComponent(searchTerm);
            }
        });
    }
    document.getElementById('searchBox').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('searchButton').click();
        }
    });
    const hamburger = document.getElementById('hamburger');
    const sideMenu = document.getElementById('side-menu');
    const navbar = document.getElementById('navbar');
    const closeBtn = document.getElementById('close-btn');
    hamburger.addEventListener('click', () => {
        sideMenu.classList.add('open');
        navbar.classList.add('menu-open');
        hamburger.setAttribute('aria-expanded', 'true');
    });

    closeBtn.addEventListener('click', () => {
        sideMenu.classList.remove('open');
        navbar.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
    });

    sideMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            sideMenu.classList.remove('open');
            navbar.classList.remove('menu-open');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });
    const notificationBell = document.getElementById('notificationBell');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notificationList = document.getElementById('notificationList');
    const notificationCount = document.getElementById('notificationCount');
    notificationBell.addEventListener('click', (e) => {
        notificationDropdown.classList.toggle('show');
        e.stopPropagation();
    });
    document.addEventListener('click', (e) => {
        if (!notificationBell.contains(e.target) && !notificationDropdown.contains(e.target)) {
            notificationDropdown.classList.remove('show');
        }
    });
    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {
            notificationList.innerHTML = '<div class="notification-empty">Please log in to see notifications.</div>';
            notificationCount.style.display = 'none';
            return;
        }

        firebase.firestore().collection('notifications')
            .where('userId', '==', user.uid)
            .orderBy('timestamp', 'desc')
            .onSnapshot(function (snapshot) {
                const notifications = [];
                snapshot.forEach(function (doc) {
                    notifications.push({ id: doc.id, ...doc.data() });
                });
                renderNotifications(notifications);
            });
    });

    function renderNotifications(notifications) {
        if (!notifications || notifications.length === 0) {
            notificationList.innerHTML = '<div class="notification-empty">No notifications</div>';
            notificationCount.style.display = 'none';
            return;
        }

        notificationList.innerHTML = '';
        let unreadCount = 0;

        notifications.forEach(function (notif) {
            const item = document.createElement('div');
            item.className = 'notification-item' + (notif.read ? '' : ' unread');
            item.textContent = notif.message || '[No message]';
            item.tabIndex = 0;
            let dateStr = '';
            if (notif.timestamp && notif.timestamp.toDate) {
                const dateObj = notif.timestamp.toDate();
                dateStr = dateObj.toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            }
            item.innerHTML = `
                <div>${notif.message || '[No message]'}</div>
                <div style="font-size:12px;color:#888;margin-top:4px;">${dateStr}</div>
            `;

            if (!notif.read) unreadCount++;

            item.onclick = function () {
                if (!notif.read) {
                    firebase.firestore().collection('notifications').doc(notif.id).update({ read: true });
                    item.classList.remove('unread');
                    unreadCount--;
                    updateNotificationCount(unreadCount);
                }
            };

            notificationList.appendChild(item);
        });

        updateNotificationCount(unreadCount);
    }

    function updateNotificationCount(unreadCount) {
        if (unreadCount > 0) {
            notificationCount.style.display = 'inline-block';
            notificationCount.textContent = unreadCount;
        } else {
            notificationCount.style.display = 'none';
        }
    }
}
runcode();