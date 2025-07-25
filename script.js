
const studentForm = document.getElementById("studentForm");
const studentNameInput = document.getElementById("studentName");
const studentEmailInput = document.getElementById("studentEmail");
const studentSelect = document.getElementById("studentSelect");

const bookForm = document.getElementById("bookForm");
const bookTitleInput = document.getElementById("bookTitle");
const bookAuthorInput = document.getElementById("bookAuthor");
const bookISBNInput = document.getElementById("bookISBN");
const searchBooksInput = document.getElementById("searchBooks");
const bookList = document.getElementById("bookList");
const clearBooksBtn = document.getElementById("clearBooks");

const themeToggleBtn = document.getElementById("themeToggle");


let students = JSON.parse(localStorage.getItem("students")) || [];
let books = JSON.parse(localStorage.getItem("books")) || [];

const footerText = document.getElementById("footerText");
function updateFooter() {
  const year = new Date().getFullYear();
  footerText.textContent = `© ${year} Library App | Total Books: ${books.length} | Total Students: ${students.length}`;
}

studentForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = studentNameInput.value.trim();
  const email = studentEmailInput.value.trim().toLowerCase();

  if (!name || !email) {
    alert("Please fill all student fields");
    return;
  }

  if (students.some(s => s.email === email)) {
    alert("Student with this email already exists");
    return;
  }

  students.push({ name, email });
  localStorage.setItem("students", JSON.stringify(students));
  updateStudentDropdown();
  studentForm.reset();
  updateFooter();
});


function updateStudentDropdown() {
  studentSelect.innerHTML = `<option value="">-- Select Student --</option>`;
  students.forEach(student => {
    studentSelect.innerHTML += `<option value="${student.email}">${student.name} (${student.email})</option>`;
  });
}


bookForm.addEventListener("submit", e => {
  e.preventDefault();
  const title = bookTitleInput.value.trim();
  const author = bookAuthorInput.value.trim();
  const isbn = bookISBNInput.value.trim();

  if (!title || !author || !isbn) {
    alert("Please fill all book fields");
    return;
  }


  if (books.some(b => b.isbn === isbn)) {
    alert("Book with this ISBN already exists");
    return;
  }

  books.push({
    title,
    author,
    isbn,
    status: "Available",
    issuedTo: null,
    issueDate: null,
    durationDays: null
  });

  localStorage.setItem("books", JSON.stringify(books));
  bookForm.reset();
  displayBooks();
  updateFooter();
});


function displayBooks() {
  bookList.innerHTML = "";

  const searchTerm = searchBooksInput.value.trim().toLowerCase();

  books.forEach((book, index) => {

    if (
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.isbn.toLowerCase().includes(searchTerm)
    ) {
      const issuedToName = book.issuedTo
        ? students.find(s => s.email === book.issuedTo)?.name || "Unknown"
        : "";

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.isbn}</td>
        <td>${book.status}</td>
        <td>${issuedToName}</td>
        <td>${book.issueDate || ""}</td>
        <td>${book.durationDays || ""}</td>
        <td>
          ${book.status === "Available"
          ? `<button class="action-btn issue-btn" data-index="${index}">Issue</button>`
          : `<button class="action-btn return-btn" data-index="${index}">Return</button>`
        }
          <button class="action-btn delete-btn" data-index="${index}">Delete</button>
        </td>
      `;

      bookList.appendChild(tr);
    }
  });


  document.querySelectorAll(".issue-btn").forEach(btn =>
    btn.addEventListener("click", () => {
      const idx = btn.getAttribute("data-index");
      issueBook(parseInt(idx));
    })
  );

  document.querySelectorAll(".return-btn").forEach(btn =>
    btn.addEventListener("click", () => {
      const idx = btn.getAttribute("data-index");
      returnBook(parseInt(idx));
    })
  );

  document.querySelectorAll(".delete-btn").forEach(btn =>
    btn.addEventListener("click", () => {
      const idx = btn.getAttribute("data-index");
      deleteBook(parseInt(idx));
    })
  );
}


function issueBook(index) {
  const selectedStudentEmail = studentSelect.value;
  if (!selectedStudentEmail) {
    alert("Please select a student to issue this book");
    return;
  }

  const duration = prompt("Enter duration in days (e.g. 7):", "7");
  const durationNum = parseInt(duration);

  if (!duration || isNaN(durationNum) || durationNum <= 0) {
    alert("Invalid duration");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  books[index].status = "Issued";
  books[index].issuedTo = selectedStudentEmail;
  books[index].issueDate = today;
  books[index].durationDays = durationNum;

  localStorage.setItem("books", JSON.stringify(books));
  displayBooks();
  updateFooter();
}


function returnBook(index) {
  books[index].status = "Available";
  books[index].issuedTo = null;
  books[index].issueDate = null;
  books[index].durationDays = null;

  localStorage.setItem("books", JSON.stringify(books));
  displayBooks();
  updateFooter();
}


function deleteBook(index) {
  if (confirm(`Are you sure you want to delete "${books[index].title}"?`)) {
    books.splice(index, 1);
    localStorage.setItem("books", JSON.stringify(books));
    displayBooks();
    updateFooter();
  }
}


searchBooksInput.addEventListener("input", displayBooks);

clearBooksBtn.addEventListener("click", () => {
  if (confirm("Delete all books?")) {
    books = [];
    localStorage.setItem("books", JSON.stringify(books));
    displayBooks();
    updateFooter();
  }
});


themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});


function init() {
  updateStudentDropdown();
  displayBooks();
  updateFooter();
}
init();
