var firebaseConfig = {
    apiKey: "AIzaSyBqNxMwJV3lz4QcFhPzCtijsjLFv0WU4mY",
    authDomain: "rent-and-read-us.firebaseapp.com",
    projectId: "rent-and-read-us",
    storageBucket: "rent-and-read-us.appspot.com",
    messagingSenderId: "76702135993",
    appId: "1:76702135993:web:65d928d5ad1defe3844d68"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let slideDuration = 2000;
let autoplay = true;
let pauseOnHover = true;
let showArrows = true;
let showSlideNumber = true;
const slideNames = [
    "Featured Books",
    "Top Picks For You",
    "Trending Now",
    "Harry Potter Series"
];

auth.onAuthStateChanged(function (user) {
    if (!user) {
        document.getElementById('slideshow').innerHTML = '<div style="padding:2rem;text-align:center;">Please log in to see your books.</div>';
        return;
    }
    const docIds = ["M6HbbXw9azIEOW1qgNAT", "eMLGIJyjdN513IecwTvD", "9lhonwOrQY4BsVZcncUK", "QxeZFgbBbKuqTq5UyC3z", "bWSTq1ez36un1T5RRJ87", "pOcJL6S2mkeCYyn7G4RX", "GdVxZs40NkyEli1ynPjf", "weaQeWkAHvU49nKg74Bn", "yctcN5rPjq5tPAwGi8oG", "lvEuL41pMSTcvYqJzgQZ", "QYF8T0TwUlN4ddzPL2u3", "JAdTZOh87W9XEhtRVIPE"];
    const chunkSize = 1;

    function chunkArray(arr, size) {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    }

    const chunks = chunkArray(docIds, chunkSize);

    const promises = chunks.map(chunk => {
        return db.collection('books')
            .where(firebase.firestore.FieldPath.documentId(), 'in', chunk)
            .get();
    });

    Promise.all(promises)
        .then(snapshots => {
            const imagesData = [];
            snapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    const book = doc.data();
                    imagesData.push({
                        imageUrl: (book.image && book.image.trim() !== "") ? book.image : "https://via.placeholder.com/140x200?text=No+Image",
                        title: book.title || "Untitled",
                        author: book.author || "",
                        link: 'book-detail.html?id=' + doc.id
                    });
                });
            });
            renderSlidesFn(imagesData);
        })
        .catch(error => {
            document.getElementById('slideshow').innerHTML = '<div style="padding:2rem;text-align:center;color:red;">Failed to load books.</div>';
            console.error("Error loading books: ", error);
        });

});

function renderSlidesFn(imagesData) {
    const slideshow = document.getElementById('slideshow');
    const captionEl = document.getElementById('slideshow-caption');
    slideshow.innerHTML = '';

    if (showArrows) {
        slideshow.innerHTML += `
            <a class="prev" id="prevBtn">&#10094;</a>
            <a class="next" id="nextBtn">&#10095;</a>
        `;
    }

    const imagesPerSlide = 3;
    const numSlides = Math.ceil(imagesData.length / imagesPerSlide);

    for (let i = 0; i < numSlides; i++) {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide';
        for (let j = 0; j < imagesPerSlide; j++) {
            const imgIdx = i * imagesPerSlide + j;
            if (imgIdx >= imagesData.length) break;
            const item = imagesData[imgIdx];
            const itemDiv = document.createElement('div');
            itemDiv.className = 'slide-item';
            itemDiv.onclick = () => window.location.href = item.link;
            itemDiv.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.title}">
                <div class="slide-caption">
                  <strong>${item.title}</strong>
                  <div>${item.author}</div>
                </div>
            `;
            slideDiv.appendChild(itemDiv);
        }
        slideshow.appendChild(slideDiv);
    }

    if (numSlides <= 1) {
        slideshow.classList.add('hide-arrows');
    } else {
        slideshow.classList.remove('hide-arrows');
    }

    let currentSlide = 0;
    let slideInterval = null;

    function showSlide(n) {
        const slides = slideshow.querySelectorAll('.slide');
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === n);
        });
        currentSlide = n;

        console.log("slideNames:", slideNames);
        captionEl.textContent = slideNames[n % slideNames.length] || `Slide ${n + 1}`;
    }

    function nextSlide(n) {
        const slides = slideshow.querySelectorAll('.slide');
        let newIndex = (currentSlide + n + slides.length) % slides.length;
        showSlide(newIndex);
    }

    function startAutoSlide() {
        if (autoplay && numSlides > 1) {
            slideInterval = setInterval(() => {
                nextSlide(1);
            }, slideDuration);
        }
    }

    function stopAutoSlide() {
        if (slideInterval) clearInterval(slideInterval);
    }

    if (showArrows && numSlides > 1) {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        if (prevBtn) prevBtn.onclick = () => { stopAutoSlide(); nextSlide(-1); startAutoSlide(); };
        if (nextBtn) nextBtn.onclick = () => { stopAutoSlide(); nextSlide(1); startAutoSlide(); };
    }

    document.addEventListener('keydown', function (e) {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowLeft') { stopAutoSlide(); nextSlide(-1); startAutoSlide(); }
        if (e.key === 'ArrowRight') { stopAutoSlide(); nextSlide(1); startAutoSlide(); }
    });

    if (pauseOnHover && autoplay && numSlides > 1) {
        slideshow.addEventListener('mouseenter', () => stopAutoSlide());
        slideshow.addEventListener('mouseleave', () => startAutoSlide());
    }

    showSlide(0);
    startAutoSlide();
}

function loginfn() {
    console.log("loginfn loaded");
    console.log("auth object:", auth);
    const loginToggle = document.getElementById("login-toggle");
    const signupToggle = document.getElementById("signup-toggle");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    if (!loginToggle || !signupToggle || !loginForm || !signupForm) {
        console.error("One or more form elements are missing.");
        return;
    }

    loginToggle.addEventListener("click", () => {
        loginToggle.classList.add("active");
        signupToggle.classList.remove("active");
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
    });

    signupToggle.addEventListener("click", () => {
        signupToggle.classList.add("active");
        loginToggle.classList.remove("active");
        signupForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
    });

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email")?.value.trim();
        const password = document.getElementById("login-password")?.value;
        const msg = document.getElementById("login-message");

        if (!email || !password || !msg) return;

        msg.textContent = "Logging in...";
        msg.style.color = "#fff";

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const userRef = db.collection("users").doc(user.uid);
                return userRef.get().then((doc) => {
                    if (!doc.exists) {
                        return userRef.set({
                            uid: user.uid,
                            email: user.email,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }
                }).then(() => {
                    msg.style.color = "#00e676";
                    msg.textContent = "Login successful!";
                    setTimeout(() => {
                        window.location.href = "home.html";
                    }, 1200);
                });
            })
            .catch((error) => {
                msg.style.color = "#ff5252";
                msg.textContent = error.message;
            });
    });

    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("signup-email")?.value.trim();
        const password = document.getElementById("signup-password")?.value;
        const confirm = document.getElementById("signup-confirm")?.value;
        const msg = document.getElementById("signup-message");

        if (!email || !password || !confirm || !msg) return;

        msg.textContent = "Creating account...";
        msg.style.color = "#fff";

        if (password !== confirm) {
            msg.style.color = "#ff5252";
            msg.textContent = "Passwords do not match!";
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                return db.collection("users").doc(user.uid).set({
                    uid: user.uid,
                    email: user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                msg.style.color = "#00e676";
                msg.textContent = "Signup successful! You can login now!";
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1200);
            })
            .catch((error) => {
                msg.style.color = "#ff5252";
                msg.textContent = error.message;
            });
    });
}


function homefn() {
    const booksMessage = document.getElementById('listed-books-message');
    booksMessage.textContent = "Loading your books...";
    booksMessage.style.color = "#f3f3f3";

    const genres = ["Fantasy", "Adventure", "Fiction", "Romance"];
    const allCarousels = document.getElementById('all-carousels');

    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {
            allCarousels.innerHTML = "<p>Please log in to see your listed books.</p>";
            return;
        }
        allCarousels.innerHTML = "";
        let carouselsLoaded = 0;

        genres.forEach((genre, genreIdx) => {
            const section = document.createElement('div');
            section.className = 'carousel-section';
            section.innerHTML = `
                <h2 class="carousel-title">${genre} Books</h2>
                <div class="carousel-wrapper">
                    <button class="carousel-arrow left" style="visibility:hidden">&#10094;</button>
                    <div class="carousel-grid carousel"></div>
                    <button class="carousel-arrow right" style="visibility:hidden">&#10095;</button>
                </div>
            `;
            allCarousels.appendChild(section);
            const carousel = section.querySelector('.carousel-grid');
            const leftArrow = section.querySelector('.carousel-arrow.left');
            const rightArrow = section.querySelector('.carousel-arrow.right');
            const scrollAmount = 300;

            firebase.firestore().collection('books')
                .where("genre", "array-contains", genre)
                .get()
                .then(function (snapshot) {
                    carousel.innerHTML = '';
                    if (snapshot.empty) {
                        carousel.innerHTML = `<div class="carousel-message">No books found for ${genre}.</div>`;
                        leftArrow.style.display = 'none';
                        rightArrow.style.display = 'none';
                    } else {
                        snapshot.forEach(function (doc) {
                            const book = doc.data();
                            const imgSrc = (book.image && book.image.trim() !== "") ? book.image : "https://via.placeholder.com/140x200?text=No+Image";
                            const card = document.createElement('div');
                            card.className = 'listed-book-card';
                            const titleLine = book.title.length <= 24 ? `${book.title}<br></br>` : book.title;
                            card.innerHTML = `
                                <img src="${imgSrc}" alt="${book.title}" class="listed-book-image" tabindex="0">
                                <div class="listed-book-title-bar" tabindex="0">${titleLine}</div>
                                <div class="listed-book-author" tabindex="0">${book.author}</div>
                                <div class="listed-book-author" tabindex="0">Price per Month : ₹ ${book.rentalPricePerDay}</div>
                                
                            `;
                            card.onclick = function () {
                                window.location.href = 'book-detail.html?id=' + doc.id;
                            };
                            carousel.appendChild(card);
                            const title = section.querySelector('.carousel-title');
                            if (title) title.style.visibility = 'visible';
                            leftArrow.style.visibility = 'visible';
                            rightArrow.style.visibility = 'visible';

                        });
                    }

                    function updateArrows() {
                        if (carousel.scrollWidth <= carousel.clientWidth + 1) {
                            leftArrow.style.display = 'none';
                            rightArrow.style.display = 'none';
                        } else {
                            leftArrow.style.display = carousel.scrollLeft <= 0 ? 'none' : '';
                            rightArrow.style.display =
                                carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1 ? 'none' : '';
                        }
                    }
                    leftArrow.style.visibility = 'visible';
                    rightArrow.style.visibility = 'visible';

                    updateArrows();
                    carousel.addEventListener('scroll', updateArrows);
                    leftArrow.addEventListener('click', () => {
                        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                    });
                    rightArrow.addEventListener('click', () => {
                        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                    });
                    window.addEventListener('resize', updateArrows);
                    carouselsLoaded++;
                    if (carouselsLoaded === genres.length) {
                        const loader = document.getElementById('loader');
                        if (loader) loader.remove();
                        booksMessage.textContent = "";
                        const slideshow = document.getElementById('slideshow');
                        if (slideshow) {
                            slideshow.style.boxShadow = '0 8px 32px rgba(255, 255, 255, 0.342)';
                        }
                    }
                });
        });
    });
}


function listfn() {
    const bookForm = document.getElementById("bookForm");
    const statusMsg = document.getElementById("form-message");

    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('q');

    const fields = [
        "title", "author", "genre", "description", "year",
        "publisher", "language", "contact", "address", "imagelink",
        "totalCopies", "rentalPricePerDay"
    ];

    const fillForm = (data) => {
        document.getElementById("title").value = data.title || "";
        document.getElementById("author").value = data.author || "";
        document.getElementById("genre").value = (data.genre || []).join(" ");
        document.getElementById("description").value = data.description || "";
        document.getElementById("year").value = data.publicationYear || "";
        document.getElementById("publisher").value = data.publisher || "";
        document.getElementById("language").value = data.language || "";
        document.getElementById("contact").value = data.contact || "";
        document.getElementById("address").value = data.address || "";
        document.getElementById("imagelink").value = data.image || "";
        document.getElementById("totalCopies").value = data.totalCopies || "";
        document.getElementById("rentalPricePerDay").value = data.rentalPricePerDay || "";
        document.getElementById("dep").value = data.dep || "";
    };

    if (docId) {
        db.collection("books").doc(docId).get().then((doc) => {
            if (doc.exists) {
                fillForm(doc.data());
            } else {
                alert("Book not found.");
            }
        }).catch((err) => {
            console.error("Error fetching book:", err);
        });
    }

    function showCustomAlert(msg) {
        document.getElementById('custom-alert-message').textContent = msg;
        document.getElementById('custom-alert').style.display = 'flex';
    }
    document.getElementById('custom-alert-ok').onclick = function () {
        document.getElementById('custom-alert').style.display = 'none';
        window.location.href = `listed.html`;
    };
    bookForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        const formData = {
            title: document.getElementById("title").value,
            author: document.getElementById("author").value,
            genre: document.getElementById("genre").value.trim().split(/\s+/),
            description: document.getElementById("description").value,
            publicationYear: Number(document.getElementById("year").value),
            publisher: document.getElementById("publisher").value,
            language: document.getElementById("language").value,
            contact: document.getElementById("contact").value,
            address: document.getElementById("address").value,
            image: document.getElementById("imagelink").value,
            totalCopies: Number(document.getElementById("totalCopies").value),
            dep: Number(document.getElementById("dep").value),
            rentalPricePerDay: parseFloat(document.getElementById("rentalPricePerDay").value),
            updatedAt: firebase.firestore.Timestamp.now()
        };

        let bookRef;

        if (docId) {
            bookRef = db.collection("books").doc(docId);
        } else {
            bookRef = db.collection("books").doc();
            formData.id = bookRef.id;
            formData.availableCopies = formData.totalCopies;
            formData.tags = [];
            formData.ownerId = user ? user.uid : null;
            formData.createdAt = firebase.firestore.Timestamp.now();
        }

        try {
            await bookRef.set(formData, { merge: true });
            showCustomAlert(docId ? "Book updated successfully!" : "Book added successfully!");
            if (!docId) bookForm.reset();
            setTimeout(() => { statusMsg.innerText = ""; }, 5000);
        } catch (error) {
            console.error("Error saving book:", error);
            showCustomAlert("Failed to save book!");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

function requestfn() {
    const bookForm = document.getElementById("bookForm");
    const statusMsg = document.getElementById("form-message");

    bookForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("title").value;
        const author = document.getElementById("author").value;
        const publicationYear = Number(document.getElementById("year").value);
        const language = document.getElementById("language").value;
        const image = document.getElementById("imagelink") ? document.getElementById("imagelink").value : "";

        const bookreqData = {
            title,
            author,
            publicationYear,
            language,
            image,
            tags: []
        };

        try {
            await db.collection("booksreq").add(bookreqData);
            statusMsg.innerText = "Book requested successfully!";
            statusMsg.style.color = "green";
            window.scrollTo({ top: 0, behavior: 'smooth' });
            bookForm.reset();
            setTimeout(() => { statusMsg.innerText = ""; }, 3000);
        } catch (error) {
            console.error("Error adding document: ", error);
            statusMsg.innerText = "Failed to add book.";
            statusMsg.style.color = "red";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    const bookRequestsDiv = document.getElementById('bookRequests');
    const addBookBtn = document.getElementById('addBookBtn');

    addBookBtn.onclick = () => {
        window.location.href = 'list.html';
    };

    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {
            bookRequestsDiv.innerHTML = "<p>Please sign in to view your book requests.</p>";
            return;
        }

        firebase.firestore().collection('booksreq')
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    bookRequestsDiv.innerHTML = "<p>No book requests found.</p>";
                    return;
                }

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const card = document.createElement('div');
                    card.className = 'book-request-card';
                    card.innerHTML = `
  <span class="request-label">Title:</span> <span class="request-value">${data.title || '(unknown)'}</span><br>
  <span class="request-label">Author:</span> <span class="request-value">${data.author}</span><br>
  <span class="request-label">Language:</span> <span class="request-value">${data.language}</span><br>
  <span class="request-label">Publication Year:</span> <span class="request-value">${data.publicationYear}</span><br>
`;
                    bookRequestsDiv.appendChild(card);
                });
            })
            .catch(error => {
                console.error("Error fetching requests:", error);
                bookRequestsDiv.innerHTML = "<p>Error loading requests.</p>";
            });
    });
}
function searchfn() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
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
    const booksGrid = document.getElementById('listed-books-grid');
    const booksMessage = document.getElementById('listed-books-message');

    if (!booksGrid || !booksMessage) {
        console.error('Missing #listed-books-grid or #listed-books-message element in HTML.');
        return;
    }

    booksMessage.textContent = "Loading your books...";
    booksMessage.style.color = "#2b5876";
    booksGrid.innerHTML = '';

    auth.onAuthStateChanged(function (user) {
        booksGrid.innerHTML = '';

        if (!user) {
            booksMessage.textContent = "Please log in to see your listed books.";
            booksMessage.style.color = "#b71c1c";
            return;
        }

        booksMessage.textContent = "Loading your books...";
        booksMessage.style.color = "";

        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') ? params.get('q').toLowerCase() : '';

        db.collection('books')
            .get()
            .then(function (snapshot) {
                booksGrid.innerHTML = '';
                let found = false;

                snapshot.forEach(function (doc) {
                    const book = doc.data();
                    const cleanedQuery = query
                        .toLowerCase()
                        .replace(/[^a-z\s]/g, '')
                        .trim();

                    const keywords = cleanedQuery.split(/\s+/).filter(word => word.length > 2);

                    const title = book.title ? book.title.toLowerCase() : "";
                    const author = book.author ? book.author.toLowerCase() : "";
                    const matches = keywords.some(word =>
                        title.includes(word) || author.includes(word)
                    );

                    if (query && !matches) {
                        return;
                    }



                    found = true;
                    const imgSrc = (book.image && book.image.trim() !== "") ? book.image : "https://via.placeholder.com/140x200?text=No+Image";
                    const card = document.createElement('div');
                    card.className = 'listed-book-card';
                    card.innerHTML = `
                    <img src="${imgSrc}" alt="${book.title}" class="listed-book-image" tabindex="0">
                    <div class="listed-book-title-bar" tabindex="0">${book.title}</div>
                    <div class="listed-book-author" tabindex="0">${book.author}</div>
                `;

                    [card.querySelector('.listed-book-image'),
                    card.querySelector('.listed-book-title-bar'),
                    card.querySelector('.listed-book-author')].forEach(function (el) {
                        el.onclick = function () {
                            window.location.href = 'book-detail.html?id=' + doc.id;
                        };
                    });

                    booksGrid.appendChild(card);
                });
                document.getElementById('loader').remove();
                if (!found) {
                    booksMessage.textContent = query
                        ? "No books found matching your search."
                        : "You haven't listed any book";
                    booksMessage.style.color = "#b71c1c";
                } else {
                    booksMessage.textContent = '';
                }
            })
            .catch(function (err) {
                booksMessage.textContent = "Failed to load books.";
                booksMessage.style.color = "red";
            });
    });

}
function showCustomConfirm(message, onYes) {
    document.getElementById('custom-confirm-message').textContent = message;
    document.getElementById('custom-confirm').style.display = 'flex';

    const yesBtnOld = document.getElementById('custom-confirm-yes');
    const noBtnOld = document.getElementById('custom-confirm-no');
    const yesBtnNew = yesBtnOld.cloneNode(true);
    const noBtnNew = noBtnOld.cloneNode(true);

    yesBtnOld.parentNode.replaceChild(yesBtnNew, yesBtnOld);
    noBtnOld.parentNode.replaceChild(noBtnNew, noBtnOld);

    yesBtnNew.onclick = () => {
        document.getElementById('custom-confirm').style.display = 'none';
        if (typeof onYes === 'function') onYes();
    };
    noBtnNew.onclick = () => {
        document.getElementById('custom-confirm').style.display = 'none';
    };
}

function listedfn() {
    const booksGrid = document.getElementById('listed-books-grid');
    const booksMessage = document.getElementById('listed-books-message');

    if (!booksGrid || !booksMessage) {
        console.error('Missing #listed-books-grid or #listed-books-message element in HTML.');
        return;
    }

    booksMessage.textContent = "Loading your books...";
    booksMessage.style.color = "#2b5876";
    booksGrid.innerHTML = '';

    firebase.auth().onAuthStateChanged(function (user) {
        booksGrid.innerHTML = '';
        if (!user) {
            booksMessage.textContent = "Please log in to see your listed books.";
            booksMessage.style.color = "#b71c1c";
            return;
        }

        firebase.firestore().collection('books')
            .where("ownerId", "==", user.uid)
            .get()
            .then(function (snapshot) {
                booksGrid.innerHTML = '';
                const loader = document.getElementById('loader');
                if (loader) loader.remove();

                if (snapshot.empty) {
                    booksMessage.textContent = "You haven't listed any book";
                    booksMessage.style.color = "#b71c1c";
                    return;
                }

                booksMessage.textContent = '';

                snapshot.forEach(function (doc) {
                    const book = doc.data();
                    const bookId = doc.id;
                    const imgSrc = book.image && book.image.trim() !== ""
                        ? book.image
                        : "https://via.placeholder.com/140x200?text=No+Image";

                    const card = document.createElement('div');
                    card.className = 'listed-book-card';
                    const titleLine = book.title.length <= 22 ? `${book.title}<br></br>` : book.title;
                    card.innerHTML = `
                        <img src="${imgSrc}" alt="${book.title}" class="listed-book-image" tabindex="0">
                        <div class="listed-book-title-bar" tabindex="0">${titleLine}</div>
                        <div class="listed-book-author" tabindex="0">${book.author}</div>
                        <div class="listed-book-author" tabindex="0">Price per Month: ₹${book.rentalPricePerDay}</div>
                        <div class="listed-book-author" tabindex="0">Number of Copies: ${book.totalCopies}</div>
                        <div class="listed-book-buttons">
                            <button class="edit-book-btn">Edit Book</button>
                            <button class="remove-book-btn">Remove Book</button>
                        </div>
                    `;
                    card.querySelector('.edit-book-btn').onclick = () => {
                        window.location.href = `list.html?q=${bookId}`;
                    };

                    card.querySelectorAll('.listed-book-image, .listed-book-title-bar, .listed-book-author')
                        .forEach(el => {
                            el.onclick = () => {
                                window.location.href = `book-detail.html?id=${bookId}`;
                            };
                        });

                    card.querySelector('.remove-book-btn').onclick = () => {
                        showCustomConfirm("Are you sure you want to remove this book?", async () => {
                            try {
                                await firebase.firestore().collection('books').doc(bookId).delete();
                                card.remove();

                                if (booksGrid.children.length === 0) {
                                    booksMessage.textContent = "You haven't listed any book";
                                    booksMessage.style.color = "#b71c1c";
                                }
                            } catch (error) {
                                alert("Failed to delete book. Please try again.");
                                console.error(error);
                            }
                        });
                    };

                    booksGrid.appendChild(card);
                });
            })
            .catch(function (err) {
                booksMessage.textContent = "Failed to load books.";
                booksMessage.style.color = "red";
                console.error(err);
            });
    });
}


function getRemainingDays(dateAdded, durationMonths) {
    if (!dateAdded || !durationMonths) return 'Rental info unavailable';
    const startDate = dateAdded.toDate ? dateAdded.toDate() : new Date(dateAdded);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + Number(durationMonths));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return "Rental expired";
    } else if (diffDays === 0) {
        return "Rental ends today";
    } else {
        return `Time until return: ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
}

function borrowedfn() {
    const booksGrid = document.getElementById('listed-books-grid');
    const booksMessage = document.getElementById('listed-books-message');

    if (!booksGrid || !booksMessage) {
        console.error('Missing #listed-books-grid or #listed-books-message element in HTML.');
        return;
    }

    booksMessage.textContent = "Loading your books...";
    booksMessage.style.color = "#2b5876";
    booksGrid.innerHTML = '';
    firebase.auth().onAuthStateChanged(function (user) {
        booksGrid.innerHTML = '';
        if (!user) {
            booksMessage.textContent = "Please log in to see your borrowed books.";
            booksMessage.style.color = "#b71c1c";
            return;
        }
        booksMessage.textContent = "Loading your books...";
        booksMessage.style.color = "";

        firebase.firestore().collection('rent')
            .where("userId", "==", user.uid)
            .get()
            .then(function (rentSnapshot) {
                booksGrid.innerHTML = '';
                document.getElementById('loader').remove();

                if (rentSnapshot.empty) {
                    booksMessage.textContent = "You haven't borrowed any books";
                    booksMessage.style.color = "#b71c1c";
                    return;
                }
                const bookIds = [...new Set(rentSnapshot.docs.map(doc => doc.data().bookId))];
                if (bookIds.length === 0) {
                    booksMessage.textContent = "No books found in your rentals";
                    booksMessage.style.color = "#b71c1c";
                    return;
                }
                firebase.firestore().collection('books')
                    .where(firebase.firestore.FieldPath.documentId(), 'in', bookIds)
                    .get()
                    .then(function (booksSnapshot) {
                        booksMessage.textContent = '';

                        booksSnapshot.forEach(function (bookDoc) {
                            const book = bookDoc.data();
                            ownerId = book.ownerId;
                            title = book.title;
                            const rentDoc = rentSnapshot.docs.find(d => d.data().bookId === bookDoc.id);
                            const rentData = rentDoc?.data();
                            const imgSrc = book.image?.trim() ? book.image : "https://via.placeholder.com/140x200?text=No+Image";

                            const card = document.createElement('div');
                            card.className = 'listed-book-card';
                            const titleLine = book.title.length <= 24 ? `${book.title}<br></br>` : book.title;
                            card.innerHTML = `
        <img src="${imgSrc}" alt="${book.title}" class="listed-book-image" tabindex="0">
        <div class="listed-book-title-bar" tabindex="0">${titleLine}</div>
        <div class="listed-book-author" tabindex="0">${book.author}</div>
        <div class="listed-book-author" tabindex="0">
            ${getRemainingDays(rentData?.dateAdded, rentData?.duration)}
        </div>
        <div class="listed-book-author" tabindex="0">
            Copies Borrowed : ${rentData?.copies || 1}
        </div>
        <div class="listed-book-author" tabindex="0">
            Total Paid : ₹${(rentData?.totalCost || 0).toLocaleString()}
        </div>
        <button class="return-book-btn" data-rentid="${rentDoc?.id || ''}">Return Book</button>
    `;
                            card.querySelectorAll('.listed-book-image, .listed-book-title-bar, .listed-book-author')
                                .forEach(el => {
                                    el.onclick = () => window.location.href = `book-detail.html?id=${bookDoc.id}`;
                                });
                            function showCustomAlert(msg) {
                                document.getElementById('custom-alert-message').textContent = msg;
                                document.getElementById('custom-alert').style.display = 'flex';
                            }
                            document.getElementById('custom-alert-ok').onclick = function () {
                                document.getElementById('custom-alert').style.display = 'none';
                            };
                            function showCustomConfirm(msg, onYes, onNo) {
                                document.getElementById('custom-confirm-message').textContent = msg;
                                document.getElementById('custom-confirm').style.display = 'flex';
                                let yesBtn = document.getElementById('custom-confirm-yes');
                                let noBtn = document.getElementById('custom-confirm-no');
                                let newYesBtn = yesBtn.cloneNode(true);
                                let newNoBtn = noBtn.cloneNode(true);
                                yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
                                noBtn.parentNode.replaceChild(newNoBtn, noBtn);
                                newYesBtn.onclick = function () {
                                    document.getElementById('custom-confirm').style.display = 'none';
                                    if (typeof onYes === 'function') onYes();
                                };
                                newNoBtn.onclick = function () {
                                    document.getElementById('custom-confirm').style.display = 'none';
                                    if (typeof onNo === 'function') onNo();
                                };
                            }
                            const returnBtn = card.querySelector('.return-book-btn');
                            if (returnBtn && rentDoc) {
                                returnBtn.onclick = function () {
                                    showCustomConfirm(
                                        "Are you sure you want to return this book?",
                                        async function onYes() {
                                            try {
                                                const rentData = rentDoc.data();
                                                const bookId = rentData.bookId;
                                                const bookDoc = await firebase.firestore().collection('books').doc(bookId).get();
                                                if (!bookDoc.exists) {
                                                    showCustomAlert("Book not found in books collection.");
                                                    return;
                                                }

                                                const bookData = bookDoc.data();

                                                await firebase.firestore().collection('order').add({
                                                    name: bookData.publisher || "",
                                                    userEmail: bookData.userEmail || "jsaakash22@gmail.com",
                                                    number: bookData.contact || "",
                                                    address: bookData.address || "",
                                                    bookId: bookId,
                                                    dateAdded: firebase.firestore.FieldValue.serverTimestamp(),
                                                    copies: rentData.copies,
                                                    duration: rentData.duration,
                                                    postal: rentData.postal,
                                                    state: rentData.state,
                                                    totalCost: rentData.totalCost
                                                });
                                                await firebase.firestore().collection('rent').doc(rentDoc.id).delete();
                                                card.remove();
                                                const currentUserId = firebase.auth().currentUser.uid;
                                                await firebase.firestore().collection('notifications').add({
                                                    userId: currentUserId,
                                                    message: `"${bookData.title}" is out for return.`,
                                                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                                    read: false,
                                                    bookId: bookId
                                                });

                                                await firebase.firestore().collection('notifications').add({
                                                    userId: bookData.ownerId,
                                                    message: `"${bookData.title}" is out for return.`,
                                                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                                    read: false,
                                                    bookId: bookId
                                                });
                                                if (booksGrid.children.length === 0) {
                                                    booksMessage.textContent = "You haven't rented any books yet";
                                                    booksMessage.style.color = "#b71c1c";
                                                }

                                                showCustomAlert("Book returned and order logged successfully!");

                                            } catch (error) {
                                                console.error("Error returning book:", error);
                                                showCustomAlert("Failed to return the book. Please try again.");
                                            }
                                        },
                                        function onNo() {
                                        }
                                    );
                                };
                            }

                            booksGrid.appendChild(card);
                        });

                    })
                    .catch(function (err) {
                        console.error("Error fetching books:", err);
                        booksMessage.textContent = "Failed to load rented books.";
                        booksMessage.style.color = "red";
                    });
            })
            .catch(function (err) {
                console.error("Error fetching rental history:", err);
                booksMessage.textContent = "Failed to load rental history.";
                booksMessage.style.color = "red";
                document.getElementById('loader').remove();
            });

    });

}
function rentedfn() {
    const booksGrid = document.getElementById('listed-books-grid');
    const booksMessage = document.getElementById('listed-books-message');

    if (!booksGrid || !booksMessage) {
        console.error('Missing #listed-books-grid or #listed-books-message element in HTML.');
        return;
    }

    booksMessage.textContent = "Loading your books...";
    booksMessage.style.color = "#2b5876";
    booksGrid.innerHTML = '';

    firebase.auth().onAuthStateChanged(function (user) {
        booksGrid.innerHTML = '';
        if (!user) {
            booksMessage.textContent = "Please log in to see your rented books.";
            booksMessage.style.color = "#b71c1c";
            return;
        }
        booksMessage.textContent = "Loading your books...";
        booksMessage.style.color = "";

        firebase.firestore().collection('rent')
            .where("ownerId", "==", user.uid)
            .get()
            .then(function (rentSnapshot) {
                booksGrid.innerHTML = '';
                document.getElementById('loader').remove();

                if (rentSnapshot.empty) {
                    booksMessage.textContent = "You haven't rented any books yet";
                    booksMessage.style.color = "#b71c1c";
                    return;
                }

                const bookIds = [...new Set(rentSnapshot.docs.map(doc => doc.data().bookId))];
                if (bookIds.length === 0) {
                    booksMessage.textContent = "No books found in your rentals";
                    booksMessage.style.color = "#b71c1c";
                    return;
                }
                firebase.firestore().collection('books')
                    .where(firebase.firestore.FieldPath.documentId(), 'in', bookIds)
                    .get()
                    .then(function (booksSnapshot) {
                        booksMessage.textContent = '';

                        booksSnapshot.forEach(function (bookDoc) {
                            const book = bookDoc.data();
                            const rentDoc = rentSnapshot.docs.find(d => d.data().bookId === bookDoc.id);
                            const rentData = rentDoc?.data();

                            const imgSrc = book.image?.trim() ? book.image : "https://via.placeholder.com/140x200?text=No+Image";

                            const card = document.createElement('div');
                            card.className = 'listed-book-card';
                            const titleLine = book.title.length <= 22 ? `${book.title}<br></br>` : book.title;
                            card.innerHTML = `
        <img src="${imgSrc}" alt="${book.title}" class="listed-book-image" tabindex="0">
        <div class="listed-book-title-bar" tabindex="0">${titleLine}</div>
        <div class="listed-book-author" tabindex="0">${book.author}</div>
        <div class="listed-book-author" tabindex="0">
            ${getRemainingDays(rentData?.dateAdded, rentData?.duration)}
        </div>
        <div class="listed-book-author" tabindex="0">
            Copies Rented : ${rentData?.copies || 1}
        </div>
        <div class="listed-book-author" tabindex="0">
            Total Received : ₹${(rentData?.totalCost || 0).toLocaleString()}
        </div>
        <button class="return-book-btn" data-rentid="${rentDoc?.id || ''}">View Details</button>
    `;

                            card.querySelectorAll('.listed-book-image, .listed-book-title-bar, .listed-book-author')
                                .forEach(el => {
                                    el.onclick = () => window.location.href = `book-detail.html?id=${bookDoc.id}`;
                                });
                            booksGrid.appendChild(card);
                        });

                    })
                    .catch(function (err) {
                        console.error("Error fetching books:", err);
                        booksMessage.textContent = "Failed to load rented books.";
                        booksMessage.style.color = "red";
                    });
            })
            .catch(function (err) {
                console.error("Error fetching rental history:", err);
                booksMessage.textContent = "Failed to load rental history.";
                booksMessage.style.color = "red";
                document.getElementById('loader').remove();
            });

    });
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('return-book-btn')) {
            const rentId = e.target.dataset.rentid;
            if (!rentId) return;

            try {
                const rentDoc = await firebase.firestore().collection('rent').doc(rentId).get();
                const rentData = rentDoc.data();
                const detailsList = document.getElementById('return-details-list');
                detailsList.innerHTML = `
                <div style="margin-bottom: 12px;">
                    <strong>Name:</strong> ${rentData.name || 'N/A'}
                </div>
                <div style="margin-bottom: 12px;">
                    <strong>Contact:</strong> ${rentData.number || 'N/A'}
                </div>
                <div style="margin-bottom: 12px;">
                    <strong>Address:</strong> ${rentData.address || 'N/A'}
                </div>
            `;
                document.getElementById('return-details-alert').style.display = 'flex';
            } catch (error) {
                console.error('Error fetching return details:', error);
            }
        }
    });

    document.getElementById('return-details-close').onclick = () => {
        document.getElementById('return-details-alert').style.display = 'none';
    };


}
function profilefn() {
    const bookForm = document.getElementById("bookForm");
    const statusMsg = document.getElementById("form-message");
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            const userId = user.uid;

            try {
                const querySnapshot = await db.collection("profile")
                    .where("userId", "==", userId)
                    .get();

                if (!querySnapshot.empty) {
                    const profileData = querySnapshot.docs[0].data();

                    document.getElementById("name").value = profileData.name || "";
                    document.getElementById("number").value = profileData.number || "";
                    document.getElementById("address").value = profileData.address || "";
                    document.getElementById("state").value = profileData.state || "";
                    document.getElementById("postal").value = profileData.postal || "";
                    document.getElementById("rentedno").innerText = profileData.booksRented || 0;
                    document.getElementById("borrowedno").innerText = profileData.booksBorrowed || 0;

                }
            } catch (error) {
                console.error("Error fetching profile data: ", error);
            }
        }
    });

    bookForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const number = Number(document.getElementById("number").value);
        const address = document.getElementById("address").value;
        const state = document.getElementById("state").value;
        const postal = Number(document.getElementById("postal").value);
        const user = firebase.auth().currentUser;

        if (!user) {
            statusMsg.innerText = "User not authenticated.";
            statusMsg.style.color = "red";
            return;
        }

        const userId = user.uid;

        const userData = {
            name,
            userId,
            number,
            address,
            state,
            postal,
            tags: [],
            booksBorrowed: 0,
            booksRented: 0
        };
        function showCustomAlert(msg) {
            document.getElementById('custom-alert-message').textContent = msg;
            document.getElementById('custom-alert').style.display = 'flex';
        }
        document.getElementById('custom-alert-ok').onclick = function () {
            document.getElementById('custom-alert').style.display = 'none';
        };
        try {
            const querySnapshot = await db.collection("profile").where("userId", "==", userId).get();

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                const existingData = querySnapshot.docs[0].data();
                userData.booksBorrowed = existingData.booksBorrowed || 0;
                userData.booksRented = existingData.booksRented || 0;
                await docRef.update(userData);
                showCustomAlert("Profile updated successfully!");
            } else {
                await db.collection("profile").add(userData);
                showCustomAlert("Profile saved successfully!");
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => { statusMsg.innerText = ""; }, 3000);

        } catch (error) {
            console.error("Error adding/updating document: ", error);
            statusMsg.innerText = "Failed to add/update Profile.";
            statusMsg.style.color = "red";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}
function buyfn() {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('id');
    const bookForm = document.getElementById("bookForm");
    const statusMsg = document.getElementById("form-message");
    const copiesInput = document.getElementById("copies");
    const durationInput = document.getElementById("duration");
    const costDiv = document.getElementById("cost");
    const dep = document.getElementById("dep") || 400;

    let rentalPricePerDay = 0;
    let ownerId = "";
    let title = "";
    firebase.firestore().collection('books').doc(bookId).get()
        .then(doc => {
            if (doc.exists) {
                ownerId = doc.data().ownerId;
                rentalPricePerDay = Number(doc.data().rentalPricePerDay) || 0;
                title = doc.data().title;
                const availableCopies = doc.data().totalCopies || 0;
                copiesInput.max = availableCopies;
                updateCost();
            } else {
                costDiv.textContent = "Book not found!";
                costDiv.style.color = "red";
            }
        })
        .catch(error => {
            console.error("Error fetching book:", error);
            costDiv.textContent = "Error fetching book price.";
            costDiv.style.color = "red";
        });
    function updateCost() {
        const copies = parseInt(copiesInput.value) || 0;
        const duration = parseInt(durationInput.value) || 0;
        const totalCost = copies * duration * rentalPricePerDay + dep;
        costDiv.textContent = `Total Cost: ₹${totalCost - dep} + ₹${dep} (Security Deposit)`;
        costDiv.style.color = "#207520";
        return totalCost;
    }

    copiesInput.addEventListener('input', updateCost);
    durationInput.addEventListener('input', updateCost);
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            statusMsg.innerText = "You must be signed in to view your profile.";
            statusMsg.style.color = "red";
            return;
        }

        try {
            const profileSnapshot = await firebase.firestore().collection("profile").where("userId", "==", user.uid).get();

            if (!profileSnapshot.empty) {
                const profile = profileSnapshot.docs[0].data();

                document.getElementById("name").value = profile.name || "";
                document.getElementById("number").value = profile.number || "";
                document.getElementById("address").value = profile.address || "";
                document.getElementById("state").value = profile.state || "";
                document.getElementById("postal").value = profile.postal || "";
            } else {
                statusMsg.innerText = "No profile data found. Please fill the form.";
                statusMsg.style.color = "blue";
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
            statusMsg.innerText = "Failed to load profile data.";
            statusMsg.style.color = "red";
        }
    });
    bookForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const user = firebase.auth().currentUser;
        if (!user) {
            statusMsg.innerText = "You must be signed in to place an order.";
            statusMsg.style.color = "red";
            return;
        }
        const name = document.getElementById("name").value;
        const number = Number(document.getElementById("number").value);
        const address = document.getElementById("address").value;
        const state = document.getElementById("state").value;
        const postal = Number(document.getElementById("postal").value);
        const copies = parseInt(copiesInput.value) || 0;
        const duration = parseInt(durationInput.value) || 0;
        const totalCost = updateCost();
        const bookreqData = {
            userId: user.uid,
            userEmail: user.email,
            name,
            number,
            address,
            state,
            postal,
            bookId,
            copies,
            duration,
            totalCost,
            dateAdded: firebase.firestore.FieldValue.serverTimestamp(),
            ownerId,
            tags: []
        };
        function showCustomAlert(msg) {
            document.getElementById('custom-alert-message').textContent = msg;
            document.getElementById('custom-alert').style.display = 'flex';
        }
        document.getElementById('custom-alert-ok').onclick = function () {
            document.getElementById('custom-alert').style.display = 'none';
            window.location.href = 'book-detail.html?id=' + bookId;
        };
        async function updateCountsOnRent(ownerId, currentUserId) {
            try {
                const ownerQuery = await firebase.firestore().collection("profile").where("userId", "==", ownerId).get();
                const borrowerQuery = await firebase.firestore().collection("profile").where("userId", "==", currentUserId).get();

                if (!ownerQuery.empty) {
                    const ownerDocRef = ownerQuery.docs[0].ref;
                    await ownerDocRef.update({
                        booksRented: firebase.firestore.FieldValue.increment(1)
                    });
                }
                if (!borrowerQuery.empty) {
                    const borrowerDocRef = borrowerQuery.docs[0].ref;
                    await borrowerDocRef.update({
                        booksBorrowed: firebase.firestore.FieldValue.increment(1)
                    });
                }
            } catch (error) {
                console.error("Error updating counts:", error);
            }
        }

        const currentUserId = user.uid;
        const bookRef = firebase.firestore().collection('books').doc(bookId);
        const rentRef = firebase.firestore().collection("rent").doc();

        try {
            await firebase.firestore().runTransaction(async (transaction) => {
                const bookDoc = await transaction.get(bookRef);
                if (!bookDoc.exists) {
                    throw new Error("Book document does not exist!");
                }

                const currentTotalCopies = bookDoc.data().totalCopies || 0;
                var sold = bookDoc.data().sold || 0;
                sold = sold + copies;
                if (copies > currentTotalCopies) {
                    throw new Error(`Only ${currentTotalCopies} copies available.`);
                }
                const updatedCopies = currentTotalCopies - copies;
                transaction.update(bookRef, { availableCopies: updatedCopies });
                transaction.update(bookRef, { totalCopies: updatedCopies });
                transaction.update(bookRef, { sold: sold });
                transaction.set(rentRef, {
                    ...bookreqData
                });
            });
            await firebase.firestore().collection("order").add(bookreqData);
            await firebase.firestore().collection('notifications').add({
                userId: currentUserId,
                message: `Placed order successfully for ${title}`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                read: false,
                bookId
            });

            await firebase.firestore().collection('notifications').add({
                userId: ownerId,
                message: `Someone has ordered your book "${title}".`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                read: false,
                bookId
            });
            const mail = "jsaakash22@gmail.com";
            showCustomAlert("Book ordered successfully!");
            updateCountsOnRent(ownerId, currentUserId);
            emailjs.send("rentandread", "template_vdyehla", {
                user_name: name,
                subtotal: totalCost - 400,
                delivery_fee: 400,
                total: totalCost,
                email: user.email, mail
            }).then(() => {
                console.log("Email sent successfully.");
            }).catch((error) => {
                console.error("Email failed to send:", error);
            });
            bookForm.reset();
            updateCost();
            setTimeout(() => { statusMsg.innerText = ""; }, 3000);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error("Transaction failed:", error);
            showCustomAlert(`Error placing order: ${error.message || error}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

    });
}

function cartfn() {
    const booksGrid = document.getElementById('listed-books-grid');
    const booksMessage = document.getElementById('listed-books-message');

    if (!booksGrid || !booksMessage) {
        console.error('Missing #listed-books-grid or #listed-books-message element in HTML.');
        return;
    }

    booksMessage.textContent = "Loading your books...";
    booksMessage.style.color = "#2b5876";
    booksGrid.innerHTML = '';

    auth.onAuthStateChanged(async function (user) {
        booksGrid.innerHTML = '';
        if (!user) {
            booksMessage.textContent = "Please log in to see your cart.";
            booksMessage.style.color = "#b71c1c";
            return;
        }
        booksMessage.textContent = "Loading your cart...";
        booksMessage.style.color = "";

        try {
            const cartSnapshot = await db.collection('cart')
                .where("userId", "==", user.uid)
                .get();

            booksGrid.innerHTML = '';
            if (cartSnapshot.empty) {
                booksMessage.textContent = "Your cart is empty.";
                booksMessage.style.color = "#b71c1c";
                const loader = document.getElementById('loader');
                if (loader) loader.remove();
                return;
            }

            const cartItems = [];
            cartSnapshot.forEach(function (doc) {
                const cartItem = doc.data();
                if (cartItem.bookId) {
                    cartItems.push({ bookId: cartItem.bookId, cartDocId: doc.id });
                }
            });

            const bookPromises = cartItems.map(item => db.collection('books').doc(item.bookId).get());
            const bookDocs = await Promise.all(bookPromises);
            booksMessage.textContent = '';
            let foundBooks = false;
            bookDocs.forEach(function (bookDoc, idx) {
                if (bookDoc.exists) {
                    foundBooks = true;
                    const book = bookDoc.data();
                    const imgSrc = (book.image && book.image.trim() !== "") ? book.image : "https://via.placeholder.com/140x200?text=No+Image";
                    const card = document.createElement('div');
                    card.className = 'listed-book-card';
                    const titleLine = book.title.length <= 22 ? `${book.title}<br></br>` : book.title;
                    card.innerHTML = `


                        <img src="${imgSrc}" alt="${book.title}" class="listed-book-image" tabindex="0">
                        <div class="listed-book-title-bar" tabindex="0">${titleLine}</div>
                        <div class="listed-book-author" tabindex="0">${book.author}</div>
                        <div class="remove-cart" tabindex="0" style="color:#b71c1c;cursor:pointer;">Remove from Cart</div>
                    `;

                    [card.querySelector('.listed-book-image'),
                    card.querySelector('.listed-book-title-bar'),
                    card.querySelector('.listed-book-author')].forEach(function (el) {
                        el.onclick = function () {
                            window.location.href = 'book-detail.html?id=' + bookDoc.id;
                        };
                    });

                    const removeBtn = card.querySelector('.remove-cart');
                    function showCustomConfirm(message, onYes) {
                        document.getElementById('custom-confirm-message').textContent = message;
                        document.getElementById('custom-confirm').style.display = 'flex';

                        const yesBtnOld = document.getElementById('custom-confirm-yes');
                        const noBtnOld = document.getElementById('custom-confirm-no');

                        const yesBtnNew = yesBtnOld.cloneNode(true);
                        const noBtnNew = noBtnOld.cloneNode(true);

                        yesBtnOld.replaceWith(yesBtnNew);
                        noBtnOld.replaceWith(noBtnNew);

                        yesBtnNew.onclick = () => {
                            document.getElementById('custom-confirm').style.display = 'none';
                            if (typeof onYes === 'function') onYes();
                        };
                        noBtnNew.onclick = () => {
                            document.getElementById('custom-confirm').style.display = 'none';
                        };
                    }

                    removeBtn.onclick = () => {
                        showCustomConfirm("Are you sure you want to remove this book from the cart?", async () => {
                            const cartDocId = cartItems[idx].cartDocId;
                            try {
                                await db.collection('cart').doc(cartDocId).delete();
                                card.remove();

                                if (booksGrid.children.length === 0) {
                                    booksMessage.textContent = "Your cart is empty.";
                                    booksMessage.style.color = "#b71c1c";
                                }
                            } catch (error) {
                                alert("Failed to remove from cart. Please try again.");
                                console.error(error);
                            }
                        });
                    };
                    booksGrid.appendChild(card);
                }
            });

            const loader = document.getElementById('loader');
            if (loader) loader.remove();

            if (!foundBooks) {
                booksMessage.textContent = "No valid books found in your cart.";
                booksMessage.style.color = "#b71c1c";
            }

        } catch (err) {
            booksMessage.textContent = "Failed to load cart.";
            booksMessage.style.color = "red";
        }
    });
}

function bookdetailfn() {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('id');
    let book = null;

    firebase.firestore().collection('books').doc(bookId).get().then(doc => {
        const main = document.getElementById('book-detail-main');
        const loader = document.getElementById('book-detail-loader');
        if (doc.exists) {
            book = doc.data();
            document.getElementById('bookTitle').textContent = book.title;
            document.getElementById('bookAuthor').textContent = "by " + book.author;
            document.getElementById('bookImage').src = book.image || "https://via.placeholder.com/170x220?text=No+Image";
            document.getElementById('bookCopies').textContent = book.totalCopies;
            document.getElementById('bookPrice').textContent = book.rentalPricePerDay;
            document.getElementById('bookGenre').textContent = book.genre || (book.genres && book.genres.join(", "));
            document.getElementById('bookyear').textContent = book.publicationYear || "";
            document.getElementById('bookDescription').textContent = book.description;
            document.getElementById('bookPublisher').textContent = book.publisher;
            document.getElementById('publisherAddress').textContent = book.address;
            document.getElementById('publisherContact').textContent = book.contact;
            document.getElementById('language').textContent = book.language;
        } else {
            document.getElementById('bookTitle').textContent = "Book not found";
        }

        document.getElementById('loader').remove();
        if (loader) loader.style.display = 'none';
        if (main) main.style.display = '';
    }).catch(err => {
        document.getElementById('loader').remove();
        const main = document.getElementById('book-detail-main');
        const loader = document.getElementById('book-detail-loader');
        document.getElementById('bookTitle').textContent = "Error loading book details";
        if (loader) loader.style.display = 'none';
        if (main) main.style.display = '';
    });

    function showCustomAlert(msg) {
        document.getElementById('custom-alert-message').textContent = msg;
        document.getElementById('custom-alert').style.display = 'flex';
    }
    document.getElementById('custom-alert-ok').onclick = function () {
        document.getElementById('custom-alert').style.display = 'none';
    };
    document.querySelectorAll('.add-cart-btn').forEach(function (btn) {
        btn.addEventListener('click', async function () {
            if (!bookId) {
                showCustomAlert("Book ID is not available. Please try again.");
                return;
            }
            const user = auth.currentUser;
            if (!user) {
                showCustomAlert("You must be logged in to add to cart.");
                return;
            }
            const query = await db.collection("cart")
                .where("userId", "==", user.uid)
                .where("bookId", "==", bookId)
                .get();

            if (!query.empty) {
                showCustomAlert("This book is already in your cart.");
                return;
            }
            const newCartRef = db.collection("cart").doc();
            const cartData = {
                bookId: bookId,
                userId: user.uid,
                createdAt: firebase.firestore.Timestamp.now()
            };
            try {
                await newCartRef.set(cartData);
                showCustomAlert("Book added to Cart!");
            } catch (error) {
                showCustomAlert("Failed to add to Cart: " + error.message);
            }
        });
    });
    document.querySelectorAll('.rent-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            window.location.href = 'buy.html?id=' + bookId;
        });
    });

}

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    if (path === "/" || path.includes("index.html")) {
        loginfn();
    } else if (path.includes("home.html")) {
        homefn();
        fetchImages();
    } else if (path.includes("list.html")) {
        listfn();
    } else if (path.includes("request.html")) {
        requestfn();
    } else if (path.includes("listed.html")) {
        listedfn();
    } else if (path.includes("profile.html")) {
        profilefn();
    } else if (path.includes("book-detail.html")) {
        bookdetailfn();
    } else if (path.includes("search.html")) {
        searchfn();
    } else if (path.includes("cart.html")) {
        cartfn();
    } else if (path.includes("buy.html")) {
        buyfn();
    } else if (path.includes("borrowed.html")) {
        borrowedfn();
    } else if (path.includes("rented.html")) {
        rentedfn();
    }
});
