let toTop = document.getElementById("toTop");
let toTopIcon = document.querySelector("#toTop i");

let currentPage = 1;
let lastPage = 1;

window.onscroll = () => {
  if (document.documentElement.scrollTop >= 300) {
    toTop.style.setProperty("right", "2rem", "important")
  } else {
    toTop.style.setProperty("right", "-4rem", "important")
  }
  toTop.addEventListener("click", function () {
    toTopIcon.style.transform = "translateY(-35px)"
    document.documentElement.scrollTop = 0;
    setTimeout(() => {
      toTopIcon.style.transform = "translateY(0)"
    }, 1000);
  })
}

function getUserInfo() {
  let user = null;
  if (localStorage.getItem("user-info") != "") {
    user = JSON.parse(localStorage.getItem("user-info"))
  }
  return user
}

function getPosts(reload = true, page = 1) {
  loaderToggler(true)
  axios.get(`https://tarmeezacademy.com/api/v1/posts?limit=10&page=${page}`)
  .then(response => {
    let posts = response.data.data;
    lastPage = response.data.meta.last_page;

    if (reload && document.getElementById("posts")) {
      document.getElementById("posts").innerHTML = '';
    }

    for (let i = 0; i < posts.length; i++) {
      let user = getUserInfo();
      let isMyPost = user != null && posts[i].author.id == user.id;

      let postTitle = ""

      if (posts[i].title != null) {
        postTitle = posts[i].title
      }

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
        <div class="card mb-3">
          <div class="card-header d-flex align-items-center" style="border-radius: 15px 15px 0 0;">
            <img onclick="userClicked(${posts[i].author.id})" style="cursor: pointer; width: 30px;height: 30px;" class="rounded-circle me-2" src="${posts[i].author.profile_image}">
            <div class="w-100 d-flex justify-content-between align-items-center">
              <b onclick="userClicked(${posts[i].author.id})" style="cursor: pointer;">${posts[i].author.username}</b>
              ${editControl}
            </div>
          </div>
          <div class="card-body" style='cursor: pointer;'>
            <div onclick='postClicked(${posts[i].id})'>
            <img class="w-100 rounded" src="${posts[i].image}">
            <span class="text-secondary" style="font-size: 12px;">${posts[i].created_at}</span>
            <h4 class="mt-2 fw-bold">${postTitle}</h4>
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
    `;
      if (document.getElementById("posts")) {
        document.getElementById("posts").innerHTML += postContent;
        document.getElementById(`post-tags-${posts[i].id}`).innerHTML = '';
      }
      if (posts[i].tags != '') {
        for (let j = 0; j < posts.length; j++) {
          let tagsContent = `<span class="badge bg-secondary">${posts[i].tags.name}</span>`;
          document.getElementById(`post-tags-${posts[i].id}`).innerHTML += tagsContent;
        }
      }
    }
  }).finally(() => {
    loaderToggler(false)
  })
}
getPosts()

function loginBtn() {
  let username = document.getElementById("username-input").value;
  let password = document.getElementById("password-input").value;
  const params = {
    "username": username,
    "password": password
  }
  loaderToggler(true)
  axios.post("https://tarmeezacademy.com/api/v1/login", params)
    .then(response => {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user-info", JSON.stringify(response.data.user))
      // hide bootstrap modal //
      bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();
      showAlert("You logged in successfully");
      changeUI()
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

function registerBtn() {
  let username = document.getElementById("register-username-input").value;
  let name = document.getElementById("register-name-input").value;
  let password = document.getElementById("register-password-input").value;
  let image = document.getElementById("register-image-input").files[0];

  let formData = new FormData()
  formData.append("name", name)
  formData.append("image", image)
  formData.append("username", username)
  formData.append("password", password)

  loaderToggler(true)
  axios.post("https://tarmeezacademy.com/api/v1/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    }
  })
  .then(response => {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user-info", JSON.stringify(response.data.user))
    // hide bootstrap modal //
    bootstrap.Modal.getInstance(document.getElementById("registerModal")).hide();
    showAlert(`Welcome, ${name} ❤`);
    changeUI()
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

function logoutBtn() {
  localStorage.removeItem("token")
  localStorage.removeItem("user-info")
  changeUI()
  showAlert("You logged out successfully")
}

function showAlert(msg) {
  document.querySelector(`.toast-body`).textContent = msg;
  bootstrap.Toast.getOrCreateInstance(document.getElementById("login-success")).show()
  setTimeout(() => {
    bootstrap.Toast.getOrCreateInstance(document.getElementById("login-success")).hide()
  }, 3000);
}

function changeUI() {
  let token = localStorage.getItem("token");
  if (token) { // user found
    document.getElementById("login-access").style.setProperty("display", "none", "important");
    document.getElementById("logout-access").style.setProperty("display", "block", "important");
    let user = getUserInfo();
    document.getElementById("header-username").innerHTML = user.username;
    document.getElementById("header-user-image").src = user.profile_image;
    if (document.getElementById("main-profile-pic")) {
      document.getElementById("main-profile-pic").src = user.profile_image;
    }
    if (document.getElementById("addPost")) {
      document.getElementById("addPost").style.display = "block";
    }
    if (document.getElementById("addPostCard")) {
      document.getElementById("addPostCard").style.display = "block";
    }
    if (document.getElementById("addNewComment")) {
      document.getElementById("addNewComment").style.setProperty("display", "flex", "important");
    }
    if (document.getElementById("profile-info")) {
      document.getElementById("profile-info").style.setProperty("display", "block", "important")
    }
  } else { // no user
    document.getElementById("login-access").style.setProperty("display", "block", "important");
    document.getElementById("logout-access").style.setProperty("display", "none", "important");
    if (document.getElementById("addPost")) {
      document.getElementById("addPost").style.display = "none";
    }
    if (document.getElementById("addPostCard")) {
      document.getElementById("addPostCard").style.display = "none";
    }
    if (document.getElementById("addNewComment")) {
      document.getElementById("addNewComment").style.setProperty("display", "none", "important");
    }
    if (document.getElementById("profile-info")) {
      document.getElementById("profile-info").style.setProperty("display", "none", "important")
    }
  }
}
changeUI()

function createPost() {
  let postId = document.getElementById("post-id-input").value;
  let isCreate = postId == null || postId == "";

  let title = document.getElementById("newPost-title").value;
  let body = document.getElementById("newPost-body").value;
  let image = document.getElementById("newPost-image").files[0];
  let token = localStorage.getItem("token");

  let formData = new FormData()
  formData.append("title", title)
  formData.append("body", body)
  formData.append("image", image)

  let url = `https://tarmeezacademy.com/api/v1/posts`

  if (isCreate) { // Creating New Post
    url = `https://tarmeezacademy.com/api/v1/posts`
  } else { // Editing current Post
    url = `https://tarmeezacademy.com/api/v1/posts/${postId}`
    formData.append("_method", "put")
  }
  loaderToggler(true)
  axios.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "authorization": `Bearer ${token}`
    }
  })
  .then(response => {
    // console.log(response);
    // hide bootstrap modal //
    bootstrap.Modal.getInstance(document.getElementById("createPostModal")).hide();
    showAlert("Post has been created");
    getPosts()
  })
  .catch(error => {
    document.getElementById("login-success").classList.add("text-bg-danger")
    showAlert(error.response.data.message)
    setTimeout(() => {
      document.getElementById("login-success").classList.remove("text-bg-danger")
    }, 3500);
  }).finally(() => {
    loaderToggler(false)
  })
}

function postClicked(id) {
  window.location = `post_details.html?postId=${id}`
}

function userClicked(userId) {
  window.location = `profile.html?userid=${userId}`
}

function profileClicked() {
  if (localStorage.getItem("token")) {
    let userId = getUserInfo().id
    window.location = `profile.html?userid=${userId}`
  } else {
    document.getElementById("login-success").classList.add("text-bg-danger")
    showAlert("You have to login first")
    setTimeout(() => {
      document.getElementById("login-success").classList.remove("text-bg-danger")
    }, 3500);
  }
}

function controlToggler(theTarget) {
  theTarget.classList.toggle("show");
}

function loaderToggler(show = true) {
  if (show) {
    document.getElementById("spinner-loader").style.visibility = "visible"
  } else {
    document.getElementById("spinner-loader").style.visibility = "hidden"
  }
}

function editThePost(post) {
  let myPost = JSON.parse(decodeURIComponent(post))
  document.getElementById("postSubmitBtn").textContent = "Update"
  document.getElementById("post-id-input").value = myPost.id
  document.getElementById("newPost-title").value = myPost.title;
  document.getElementById("newPost-body").value = myPost.body;
  document.getElementById("createPostTitle").textContent = "Edit Post";
  let editPostModal = new bootstrap.Modal(document.getElementById("createPostModal"));
  editPostModal.toggle()
}

function deleteThePost(post) {
  let editPostModal = new bootstrap.Modal(document.getElementById("deletePostModal"));
  editPostModal.toggle()
  document.getElementById("delete-post-id-input").value = post
}

function deleteBtnClicked() {
  let postId = document.getElementById("delete-post-id-input").value;
  let token = localStorage.getItem("token");
  loaderToggler(true)
  axios.delete(`https://tarmeezacademy.com/api/v1/posts/${postId}`, {
    headers: {
      "authorization": `Bearer ${token}`
    }
  })
  .then(response => {
    bootstrap.Modal.getInstance(document.getElementById("deletePostModal")).hide();
    getPosts()
    changeUI()
  })
  .catch(error => {
    bootstrap.Modal.getInstance(document.getElementById("deletePostModal")).hide();
    document.getElementById("login-success").classList.add("text-bg-danger")
    showAlert("Failed To Delete the post")
    setTimeout(() => {
      document.getElementById("login-success").classList.remove("text-bg-danger")
    }, 3500);
  })
  .finally(() => {
    loaderToggler(false)
  })
}

function addBtnClicked() {
  document.getElementById("postSubmitBtn").textContent = "Create"
  document.getElementById("post-id-input").value = ""
  document.getElementById("newPost-title").value = "";
  document.getElementById("newPost-body").value = "";
  document.getElementById("createPostTitle").textContent = "Create a New Post";
  let editPostModal = new bootstrap.Modal(document.getElementById("createPostModal"));
  editPostModal.toggle()
}