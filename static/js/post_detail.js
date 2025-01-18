// Global variables
const commentInput = document.getElementById("commentInput");
const authorNameInput = document.getElementById("authorName");
const postId = commentInput.dataset.postId;
const url = `/forum/comments/?post_id=${postId}`;

const mainCommentsDiv = document.getElementById("mainCommentsDiv");

document.getElementById("back-btn").addEventListener("click", function () {
    window.location.href = "/forum/posts/";
});

document.getElementById("delete-btn").addEventListener("click", function () {
    deleteRequest();
});

document.addEventListener("DOMContentLoaded", () => {
    getRequest(url);
});

function postRequest(body_json) {
    fetch("/forum/comments/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: body_json,
    })
        .then((response) => {
            if (response.ok) {
                getRequest(url);
                return response.json();
            } else {
                return response.json().then((data) => {
                    throw new Error(
                        data.detail ||
                            "Failed to add a comment. Check your input."
                    );
                });
            }
        })
        .catch((error) => {
            console.error("Error:", error.message);
            alert(error.message);
        });
}

function getRequest(url) {
    fetch(url, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
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
            mainCommentsDiv.innerHTML = ""; // clear the existing data to insert new
            data.comments.sort((a, b) => (a.parent ? 1 : -1));
            data.comments.forEach((comment) => {
                if (!comment.parent) {
                    appendComment(comment);
                } else {
                    appendReply(comment);
                }
            });
        })
        .catch((error) => {
            console.error("Error fetching comments:", error.message);
        });
}

function deleteRequest() {
    fetch(`/forum/posts/${postId}/`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (response.ok) {
                alert("Post deleted successfully");
                window.location.href = "/forum/posts/";
            } else {
                throw new Error(
                    data.detail || "Post did not deleted. Error occured!"
                );
            }
        })
        .catch((error) => console.error("Error:", error));
}

function appendComment(comment) {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("p-4", "bg-gray-50", "border", "rounded-lg");

    const commentId = document.createElement("p");
    commentId.classList.add("text-gray-400");
    commentId.textContent = `Comment ID:${comment.id}`;

    const commentDesciprion = document.createElement("p");
    commentDesciprion.classList.add("text-gray-700");
    commentDesciprion.textContent = `${comment.description}`;

    const author = document.createElement("p");
    author.classList.add("text-gray-500", "text-sm", "mt-2");
    author.textContent = `Posted by: `;

    const authorName = document.createElement("span");
    authorName.classList.add("font-medium", "text-black");
    authorName.textContent = `${comment.author_name}`;

    const replyButton = document.createElement("button");
    replyButton.textContent = "Reply";
    replyButton.classList.add(
        "mt-3",
        "px-4",
        "py-2",
        "bg-blue-500",
        "text-white",
        "rounded-lg",
        "hover:bg-blue-600"
    );

    replyButton.addEventListener("click", () => {
        replyButton.classList.add("hidden");
        generateReplyInput(commentDiv, comment.id);
    });

    const mainRepliesDiv = document.createElement("div");
    mainRepliesDiv.classList.add("main-replies-div");
    mainRepliesDiv.dataset.comment = comment.id;

    author.appendChild(authorName);
    commentDiv.appendChild(commentId);
    commentDiv.appendChild(commentDesciprion);
    commentDiv.appendChild(author);
    commentDiv.appendChild(replyButton);
    commentDiv.appendChild(mainRepliesDiv);

    // Get first child of the mainCommentsDiv
    const firstChild = mainCommentsDiv.firstChild;

    // Insert new comment at the top of the div using insertBefore function
    mainCommentsDiv.insertBefore(commentDiv, firstChild);
}

function appendReply(reply) {
    const replyDiv = document.createElement("div");
    replyDiv.classList.add("p-4", "bg-gray-50", "border", "rounded-lg");

    const replyId = document.createElement("p");
    replyId.classList.add("text-gray-400");
    replyId.textContent = `Comment ID:${reply.id}`;

    const replyDesciprion = document.createElement("p");
    replyDesciprion.classList.add("text-gray-700");
    replyDesciprion.textContent = `${reply.description}`;

    const author = document.createElement("p");
    author.classList.add("text-gray-500", "text-sm", "mt-2");
    author.textContent = `Posted by: `;
    const authorName = document.createElement("span");
    authorName.classList.add("font-medium", "text-black");
    authorName.textContent = `${reply.author_name}`;

    author.appendChild(authorName);
    replyDiv.appendChild(replyId);
    replyDiv.appendChild(replyDesciprion);
    replyDiv.appendChild(author);

    const mainRepliesDiv = document.querySelector(
        `.main-replies-div[data-comment="${reply.parent}"]`
    );
    mainRepliesDiv.classList.add(
        "m-4",
        "p-4",
        "bg-gray-",
        "border",
        "rounded-lg"
    );
    // Get first child of the mainCommentsDiv
    const firstChild = mainRepliesDiv.firstChild;

    // Insert new comment at the top of the div using insertBefore function
    mainRepliesDiv.insertBefore(replyDiv, firstChild);
}

function generateReplyInput(commentDiv, comment_id) {
    const replyDiv = document.createElement("div");
    const replyContentInput = document.createElement("textarea");
    const authorNameInput = document.createElement("input");
    const submitReplyButton = document.createElement("button");
    const cancelButton = document.createElement("button");
    replyDiv.classList.add("mt-4", "pl-10");

    replyContentInput.placeholder = "Enter your reply here...";
    replyContentInput.classList.add(
        "h-32",
        "w-full",
        "p-3",
        "border",
        "rounded-lg",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:outline-none"
    );
    authorNameInput.placeholder = "Enter author name here...";
    authorNameInput.classList.add(
        "h-12",
        "w-full",
        "p-3",
        "border",
        "rounded-lg",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:outline-none"
    );

    submitReplyButton.textContent = "Submit Reply";
    submitReplyButton.classList.add(
        "mt-3",
        "px-4",
        "py-2",
        "bg-blue-500",
        "text-white",
        "rounded-lg",
        "hover:bg-blue-600"
    );

    replyDiv.appendChild(replyContentInput);
    replyDiv.appendChild(authorNameInput);
    replyDiv.appendChild(submitReplyButton);
    // replyDiv.appendChild(cancelButton);

    submitReplyButton.addEventListener("click", () => {
        let body_json = JSON.stringify({
            description: replyContentInput.value,
            author_name: authorNameInput.value,
            post: postId,
            parent: comment_id,
        });
        postRequest(body_json);
    });

    commentDiv.appendChild(replyDiv);
}

addCommentBtn.addEventListener("click", function (e) {
    e.preventDefault();
    // Retrieve data from user
    const commentTerm = commentInput.value;
    const authorName = authorNameInput.value;

    if (commentTerm == "") {
        document.getElementById("commentRequired").classList.remove("hidden");
    }

    if (authorName == "") {
        document.getElementById("authorRequired").classList.remove("hidden");
    }
    let body_json = JSON.stringify({
        description: commentTerm,
        author_name: authorName,
        post: postId,
    });
    postRequest(body_json);
    commentInput.value = "";
    authorNameInput.value = "";
});
