// Make Modal visible by removing hidden class when Add Post button clicked
document.getElementById("addPostBtn").addEventListener("click", function () {
  document.getElementById("addPostModal").classList.remove("hidden");
});

// Make Modal invisible by adding hidden class when Close button clicked
document.getElementById("closeModal").addEventListener("click", function () {
  document.getElementById("addPostForm").reset();
  document.getElementById("addPostModal").classList.add("hidden");
});

// Form handling and sending data to backend
document.getElementById("addPostForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // get values of input fields
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const author_name = document.getElementById("author_name").value;

  // need to learn more
  fetch("/forum/posts/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
    },
    body: JSON.stringify({ title, description, author_name }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json(); // Parse JSON if the response is successful
      } else {
        return response.json().then((data) => {
          throw new Error(
            data.detail || "Failed to create the post. Check your input."
          );
        });
      }
    })
    .then((data) => {
      alert("Post created successfully!");
      document.getElementById("addPostForm").reset();
      document.getElementById("addPostModal").classList.add("hidden");
      window.location.reload(); // Reload to show the new post
    })
    .catch((error) => {
      console.error("Error:", error.message);
      alert(error.message); // Show error details in the alert
    });
});

const mainPostDiv = document.getElementById("mainPostDiv");

let debounceTimeout;

searchInput.addEventListener("input", () => {
  const searchInput = document.getElementById("searchInput");
  const searchTerm = searchInput.value;
  const url = `/forum/posts/?&search=${searchTerm}`;
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    mainPostDiv.innerHTML = "";
    fetchData(url);
  }, 800);
});

function fetchData(url) {
  fetch(url, {
    method: "GET",
    headers: {
      "X-Requested-With": "XMLHttpRequest", // Marks it as an AJAX request
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        const data = response.json();
        throw new Error(data.detail || "Error occured!");
      }
    })
    .then((data) => {
      const postCards = document.createElement("div");
      postCards.classList.add(
        "grid",
        "grid-cols-1",
        "sm:grid-cols-2",
        "md:grid-cols-3",
        "lg:grid-cols-4",
        "gap-6"
      );

      const upperPaginationDiv = document.createElement("div");
      upperPaginationDiv.classList.add(
        "flex",
        "justify-center",
        "mt-4",
        "mb-4"
      );

      if (data.pagination.prev) {
        const upperPrev = document.createElement("a");
        upperPrev.classList.add(
          "px-4",
          "py-2",
          "bg-gray-200",
          "hover:bg-gray-300",
          "rounded-md"
        );
        upperPrev.textContent = "Prev";
        upperPrev.onclick = () => {
          event.preventDefault();
          fetchData(data.pagination.prev);
        };
        upperPaginationDiv.appendChild(upperPrev);
      }

      const upperPageNum = document.createElement("span");
      upperPageNum.classList.add("px-4", "py-2", "bg-gray-200", "rounded-md");
      upperPageNum.textContent = `Page ${data.pagination.count} of ${data.pagination.count}`;
      upperPaginationDiv.appendChild(upperPageNum);

      if (data.pagination.next) {
        const upperNext = document.createElement("a");
        upperNext.classList.add(
          "px-4",
          "py-2",
          "bg-gray-200",
          "hover:bg-gray-300",
          "rounded-md"
        );
        upperNext.textContent = "Next";
        upperNext.onclick = () => {
          event.preventDefault();
          fetchData(data.pagination.next);
        };
        upperPaginationDiv.appendChild(upperNext);
      }
      console.log("mainpostdiv: ", mainPostDiv);
      console.log("exists ", !!mainPostDiv);

      // Iterate through fetched posts and create HTML elements
      data.posts.forEach((post) => {
        mainPostDiv.innerHTML = "";
        const card = document.createElement("a");
        card.href = `/forum/posts/${post.id}`;

        const cardContent = document.createElement("div");
        cardContent.classList.add(
          "bg-white",
          "shadow",
          "rounded-lg",
          "p-5",
          "flex",
          "flex-col",
          "h-80"
        );

        const postId = document.createElement("p");
        postId.classList.add("text-sm", "text-gray-400");
        postId.textContent = `Post id: ${post.id}`;

        const postTitle = document.createElement("h2");
        postTitle.classList.add(
          "text-lg",
          "font-semibold",
          "text-gray-800",
          "mb-2"
        );
        postTitle.textContent = post.title;

        const postDescription = document.createElement("p");
        postDescription.classList.add(
          "text-sm",
          "text-gray-600",
          "mb-4",
          "flex-grow"
        );
        postDescription.textContent = `${post.description.slice(0, 180)}...`; // Truncate to 180 characters

        const authorSection = document.createElement("div");
        authorSection.classList.add("text-xs", "text-gray-500", "mt-auto");

        const authorName = document.createElement("p");
        const authorSpan = document.createElement("span");
        authorSpan.classList.add("font-medium", "text-black");
        authorSpan.textContent = post.author_name;
        authorName.textContent = `By ${authorSpan.innerHTML}`;

        const postDate = document.createElement("p");
        postDate.textContent = post.created_at;

        authorSection.appendChild(authorName);
        authorSection.appendChild(postDate);

        cardContent.appendChild(postId);
        cardContent.appendChild(postTitle);
        cardContent.appendChild(postDescription);
        cardContent.appendChild(authorSection);

        card.appendChild(cardContent);
        postCards.appendChild(card);
      });

      mainPostDiv.appendChild(upperPaginationDiv);
      mainPostDiv.appendChild(postCards);
    })
    .catch((error) => {
      console.error("Error fetching posts hello:", error);
      // Handle errors appropriately, e.g., display an error message to the user
    });
}
