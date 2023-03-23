function getUserDetails() {
  let profileId = getUserId()
  loaderToggler(true)
  axios.get(`https://tarmeezacademy.com/api/v1/users/${profileId}`)
  .then(response => {
    let userProfile = response.data.data
    document.getElementById("profile-page-image").src = userProfile.profile_image;
    document.getElementById("profile-page-name").textContent = userProfile.name;
    document.getElementById("profile-page-username").textContent = userProfile.username;
    // document.getElementById("profile-page-email").textContent = userProfile.email;
    document.getElementById("profile-posts-count").textContent = userProfile.posts_count;
    document.getElementById("profile-comments-count").textContent = userProfile.comments_count;
    document.getElementById("profile-title-name").textContent = userProfile.username;
  })
  .catch(error => {
    document.getElementById("login-success").classList.add("text-bg-danger")
    showAlert(error.response.data.message)
    setTimeout(() => {
      document.getElementById("login-success").classList.remove("text-bg-danger")
    }, 3500);
  })
  .finally(() => {
    loaderToggler(false)
  })
}

function getUserId(){
  let postId = new URLSearchParams(window.location.search);
  id = postId.get("userid")
  return id
}
getUserDetails()

function getPosts() {
  let userId = getUserId()
  loaderToggler(true)

  axios.get(`https://tarmeezacademy.com/api/v1/users/${userId}/posts`)
  .then(response => {
    let posts = response.data.data;
    document.getElementById("profile-posts").innerHTML = '';
    
    for (let i = 0; i < posts.length; i++) {
      let user = getUserInfo();
      let isMyPost = user != null && posts[i].author.id == user.id;
      let editControl = ``;
      if (isMyPost) {
        editControl = `
          <div id="control-toggler" role="button" onclick='controlToggler(this.children[1])' class="control-toggler position-relative">
            <i class="fa-solid fa-ellipsis"></i>
            <ul id="control-list" class="list-group position-absolute control" style="display: none;">
              <li id='editMyPost' onclick="editThePost('${encodeURIComponent(JSON.stringify(posts[i]))}')" class="list-group-item d-flex gap-2 align-items-center"><i class="fa-solid fa-pen-to-square"></i> Edit</li>
              <li id='deleteMyPost' onclick="deleteThePost(${posts[i].id})" class="list-group-item d-flex gap-2 align-items-center text-bg-danger"><i class="fa-solid fa-trash"></i> Delete</li>
            </ul>
          </div>
        `
      }
      let postContent = `
        <!-- Post -->
        <div class="card mb-3">
          <div class="card-header d-flex align-items-center" style="border-radius: 15px 15px 0 0;">
            <img style="width: 30px;height: 30px;" class="rounded-circle me-2" src="${posts[i].author.profile_image}">
            <div class="w-100 d-flex justify-content-between align-items-center">
              <b>${posts[i].author.username}</b>
              ${editControl}
            </div>
          </div>
          <div class="card-body" style='cursor: pointer;'>
            <div onclick='postClicked(${posts[i].id})'>
            <img class="w-100 rounded" src="${posts[i].image}">
            <span class="text-secondary" style="font-size: 12px;">${posts[i].created_at}</span>
            <h4 class="mt-2 fw-bold">${posts[i].title}</h4>
            <p class="description text-secondary">${posts[i].body}</p>
            <div id="post-tags-${posts[i].id}">
              <span class="badge bg-secondary">Policy</span>
            </div>
            <hr>
            </div>
            <div class="d-flex gap-2 justify-content-around">
              <div onclick="this.classList.toggle('text-danger')" class="flex-grow-1 text-center fs-6 p-2 rounded react">
                <i class="fa-solid fa-heart me-1"></i>Love
              </div>
              <div onclick='postClicked(${posts[i].id})' class="flex-grow-1 text-center fs-6 p-2 rounded react">
                <i class="fa-solid fa-comments me-1"></i>Comment (${posts[i].comments_count})
              </div>
              <div class="flex-grow-1 text-center fs-6 p-2 rounded react">
                <i class="fa-solid fa-share me-1"></i>Share
              </div>
            </div>
          </div>
        </div>
        <!--// Post //-->
    `;
      if (document.getElementById("profile-posts")) {
        document.getElementById("profile-posts").innerHTML += postContent;
        document.getElementById(`post-tags-${posts[i].id}`).innerHTML = '';
      }
      if (posts[i].tags != '') {
        for (let j = 0; j < posts.length; j++) {
          let tagsContent = `
          <span class="badge bg-secondary">${posts[i].tags.name}</span>
        `
          document.getElementById(`post-tags-${posts[i].id}`).innerHTML += tagsContent;
        }
      }
    }
  }).finally(() => {
    loaderToggler(false)
  })
}
getPosts()