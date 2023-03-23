let postId = new URLSearchParams(window.location.search).get("postId");

function getThePost() {
  loaderToggler(true)
  axios.get(`https://tarmeezacademy.com/api/v1/posts/${postId}`)
  .then(response => {
    let thePost = response.data.data;
    let comments = response.data.data.comments;
    let commentContent = ``
    for (let i = 0; i < comments.length; i++){
      commentContent += `
      <div class="card-footer">
        <div class="d-flex gap-2">
          <img src="${comments[i].author.profile_image}" class="rounded-circle" style="width: 30px; height: 30px;">
          <strong>${comments[i].author.username}</strong>
        </div>
        <p class='m-0 my-1'>${comments[i].body}</p>
      </div>
      `
    }
    let postTitle = ""

    if (thePost.title != null) {
      postTitle = thePost.title
    }
    let user = getUserInfo();
    let isMyPost = user != null && thePost.author.id == user.id;
    let editControl = ``;
    if (isMyPost) {
      editControl = `
      <div id="control-toggler" role="button" onclick='controlToggler(this.children[1])' class="position-relative">
        <i class="fa-solid fa-ellipsis"></i>
        <ul id="control-list" class="list-group position-absolute control" style="display: none;">
          <li id='editMyPost' onclick="editThePost('${encodeURIComponent(JSON.stringify(thePost))}')" class="list-group-item d-flex gap-2 align-items-center"><i class="fa-solid fa-pen-to-square"></i> Edit</li>
          <li id='deleteMyPost' onclick="deleteThePost(${thePost.id})" class="list-group-item d-flex gap-2 align-items-center text-bg-danger"><i class="fa-solid fa-trash"></i> Delete</li>
        </ul>
      </div>
      `
    }
    let content = `
      <div class="card mb-3">
      <div class="card-header d-flex align-items-center" style="border-radius: 15px 15px 0 0;">
        <img style="width: 30px;height: 30px;" class="rounded-circle me-2" src="${thePost.author.profile_image}">
        <div class="w-100 d-flex justify-content-between align-items-center">
          <b>${thePost.author.username}</b>
          ${editControl}
        </div>
      </div>
      <div class="card-body">
        <img class="w-100 rounded" src="${thePost.image}">
        <span class="text-secondary" style="font-size: 12px;">${thePost.created_at}</span>
        <h4 class="mt-2 fw-bold">${postTitle}</h4>
        <p class="description text-secondary">${thePost.body}</p>
        <div id="post-tags-${thePost.id}">
          <span class="badge bg-secondary"></span>
        </div>
        <hr>
        <div class="d-flex gap-2 justify-content-around">
          <div onclick="this.classList.toggle('text-danger')" class="flex-grow-1 text-center fs-6 p-2 rounded react">
            <i class="fa-solid fa-heart me-1"></i>Love
          </div>
          <div onclick="commentFocus()" class="flex-grow-1 text-center fs-6 p-2 rounded react">
            <i class="fa-solid fa-comments me-1"></i>Comment (${thePost.comments_count})
          </div>
          <div class="flex-grow-1 text-center fs-6 p-2 rounded react">
            <i class="fa-solid fa-share me-1"></i>Share
          </div>
        </div>
      </div>
      <div id="comments">
        ${commentContent}
      </div>
      <div id='addNewComment'>
        <div class="input-group mb-3 card-body">
          <input id="comment-input" type="text" placeholder="Type a comment" class="form-control">
          <button onclick="createNewComment()" class="btn btn-outline-primary" type="button"><i class="fa-regular fa-paper-plane"></i></button>
        </div>
      </div>
    </div>
    `
    document.getElementById("thePost").innerHTML = content;
  }).finally(() => {
    loaderToggler(false)
  })
}
getThePost()
function commentFocus() {
  document.getElementById("comment-input").focus()
}

function createNewComment() {
  let token = localStorage.getItem("token");
  let comment_body = document.getElementById("comment-input").value;
  const params = {
    "body": comment_body
  }
  loaderToggler(true)
  axios.post(`https://tarmeezacademy.com/api/v1/posts/${postId}/comments`, params, {
    headers: {
      "authorization" : `Bearer ${token}`
    }
  }).then(response => {
    document.getElementById("comment-input").value = '';
    getThePost()
    showAlert("New Comment has been Created")
  }).catch(error => {
    document.getElementById("login-success").classList.add("text-bg-danger")
    showAlert(`${error.response.data.message}, Please login first`)
    setTimeout(() => {
      document.getElementById("login-success").classList.remove("text-bg-danger")
    }, 3500);
  }).finally(() => {
    loaderToggler(false)
  })
}