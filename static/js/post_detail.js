document.getElementById("back-btn").addEventListener("click", function () {
  window.location.href = "/forum/posts/";
});

addCommentBtn.addEventListener("click", function (e) {
  e.preventDefault();
  // Retrieve data from user
  const commentInput = document.getElementById("commentInput");
  const commentTerm = commentInput.value;
  const authorNameInput = document.getElementById("authorName");
  const authorName = authorNameInput.value;
  const postId = commentInput.dataset.postId;

  const url = `/forum/comments/`;

  if (commentTerm == "") {
    document.getElementById("commentRequired").classList.remove("hidden");
  }
  
  if (authorName == "") {
    document.getElementById("authorRequired").classList.remove("hidden");
  }
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description: commentTerm,
      author_name: authorName,
      post: postId,
    }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return response.json().then((data) => {
          throw new Error(
            data.detail || "Failed to add a comment. Check your input."
          );
        });
      }
    })
    .then((data) => {
      commentInput.value = "";
      authorNameInput.value = "";
      window.location.reload();
    })
    .catch((error) => {
      console.error("Error:", error.message);
      alert(error.message);
    });
});

const replyButtons = document.querySelectorAll('button[data-comment-id]')

replyButtons.forEach((btn) => btn.addEventListener('click', (event) => {
  console.log(event.target.dataset.commentId);
  
}) )
