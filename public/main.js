'use strict';

var state = {
  movieThreads: []

  // attempt to get state in the local storage
};var lsState = localStorage.getItem('state');

if (!lsState) {
  saveToStorage(state);
} else {
  state = JSON.parse(localStorage.getItem('state'));
}

/// Assume that at this stage  of the program, state is logged in.
if (state.user) {
  login();
}

// a utility method to save into localStorage
function saveToStorage(state) {
  localStorage.setItem('state', JSON.stringify(state));
}

function retrieveStateFromStorage() {
  var lsState = localStorage.getItem('state');
  if (lsState) {
    return JSON.parse(lsState);
  } else {
    console.log("Missing!");
    saveToStorage(state); // just set it up
  }
}
//-------------- AJAX Requests------------------

// Get All Threads & Render List of Threads
function _GET_AllThreads() {
  $.ajax({
    dataType: "json",
    headers: { "Authorization": "Basic " + btoa(state.user + ":" + state.password) },
    url: "/threads",
    success: function success(data) {
      state.movieThreads = data.movieThreads;
      saveToStorage(state); // persist
      renderMovieThreads(state);
    },
    type: "GET"
  });
}

// Get All Threads and Render an Individual Thread
function _GET_ThreadsRenderInd() {
  $.ajax({
    dataType: "json",
    headers: { "Authorization": "Basic " + btoa(state.user + ":" + state.password) },
    url: "/threads",
    type: "GET",
    success: function success(data) {

      state.movieThreads = data.movieThreads;
      saveToStorage(state);
      renderIndThreadView(state.threadId, state);
    }

  });
}

function addThread() {
  var title = $('.create-thread-title').val();
  var content = $('.thread-content').val();

  var thread = {
    "title": title,
    "author": state.user,
    "content": content
  };

  $.ajax({
    url: 'threads/new-thread',
    contentType: 'application/json',
    type: 'POST',
    data: JSON.stringify(thread),
    success: _GET_AllThreads()
  });

  $('.create-thread-title').val('');
  $('.thread-content').val('');
}

// Edit the content of existing thread
function _PUT_editThread() {
  var id = $('.edit-thread.view').attr('id');
  var title = $('.edit-thread-title').val();
  var author = state.user;
  var content = $('.edit-thread-content').val();

  var updateThread = {
    id: id,
    title: title,
    author: author,
    content: content
  };

  state.threadId = id;

  $.ajax({
    url: 'threads/' + id,
    contentType: 'application/json',
    type: 'PUT',
    data: JSON.stringify(updateThread),
    success: _GET_ThreadsRenderInd
  });
};

// Edit existing post
function _PUT_editPost() {

  var editPost = {
    postId: $('.edit-post.view').attr('id'),
    user: state.user,
    content: $('.edit-post-content').val()
  };

  state.threadId = $('.thread.view').attr('id');

  $.ajax({
    url: 'posts/' + editPost.postId,
    contentType: 'application/json',
    type: 'PUT',
    data: JSON.stringify(editPost),
    success: _GET_ThreadsRenderInd
  });
};

function createComment() {
  var comment = {
    postId: $('.create-comment.view').attr('id'),
    user: state.user,
    comment: $('.add-comment-content').val()
  };

  state.threadId = $('.thread.view').attr('id');
  $.ajax({
    url: 'comments/' + comment.postId,
    contentType: 'application/json',
    type: 'POST',
    data: JSON.stringify(comment),
    success: _GET_ThreadsRenderInd
  });
}

function _POST_newPost(id, content) {
  var post = {
    threadId: id,
    content: content,
    user: state.user
  };

  state.threadId = id;
  $.ajax({
    url: '/posts/' + post.threadId,
    contentType: "application/json",
    type: "POST",
    // crossDomain: true,
    data: JSON.stringify(post),
    success: _GET_ThreadsRenderInd
  });
}

function deletePost(postId, threadId) {
  console.log('Deleting POst');
  var post = {
    threadId: threadId,
    postId: postId
  };

  state.threadId = threadId;
  $.ajax({
    url: '/posts/' + postId,
    dataType: "json",
    contentType: "application/json",
    type: "DELETE",
    data: JSON.stringify(post),
    success: _GET_ThreadsRenderInd
  });
}

function like(postId, user) {
  var tmpObj = {
    postId: postId,
    user: user
  };

  $.ajax({
    url: '/likes/' + postId,
    dataType: "json",
    contentType: "application/json",
    type: "PUT",
    data: JSON.stringify(tmpObj),
    success: _GET_ThreadsRenderInd
  });
}

// Login AJAX Requests
function createUser() {
  var id = $('#new-user-id').val();
  var pass = $('#new-user-password').val();

  var user = {
    "username": id,
    "firstName": id,
    "lastName": id,
    "password": pass
  };

  $.ajax({
    url: '/users',
    dataType: "json",
    contentType: "application/json",
    type: "POST",
    data: JSON.stringify(user),
    success: function success(data) {
      if (data.username) {
        state.user = data.username;
        state.password = pass;
        // store the user
        saveToStorage(state);
        login(state.user);
      }
    }
  });
}

function checkLogin() {
  var id = $('#user-id').val();
  var pass = $('#password').val();
  var user = {
    "username": id,
    "password": pass
  };

  $.ajax({
    type: "GET",
    headers: { "Authorization": "Basic " + btoa(user.username + ":" + user.password) },
    dataType: 'json',
    data: JSON.stringify(user),
    url: "/users/me",
    success: function success(data) {
      if (data.user.username) {
        var _user = data.user.username;
        state.user = _user;
        state.password = pass;
        saveToStorage(state);
        login(_user);
      }
    }
  });
}

//-----------Set Up Functions for AJAX Requests--------------

function addPost() {
  var content = $('.add-post-content').val();
  var threadId = $('.thread.view').attr('id');

  _POST_newPost(threadId, content);
  // Clear textarea
  $('.add-post-content').val('');
}

function editThread(threadId, content, title) {
  $('.edit-thread-title').val(title);
  $('.edit-thread-content').text(content);
  $('.edit-thread.view').attr('id', threadId);
  showView('edit-thread');
}

function addComment(postId) {
  showView('create-comment');
  $('.create-comment.view').attr('id', postId);
}

//--------------State Management Functions---------------------

// Call back from AJAX Login Request
function login(id) {
  $('.btn-login').hide();
  $('.signup').hide();
  $('.btn-logout').fadeIn();
  $('form').hide();
  $('.login-overlay').hide();
  $('header').fadeOut();
  $('.welcome').text('Welcome ' + state.user);

  if (state.view === 'thread-list') {
    _GET_AllThreads();
    showView('thread-list');
  } else {
     _GET_AllThreads();
    showView('thread-list');
  }
}

// Return a list of threads that match users search
function searchThreads(str) {
  console.log(str);
  var rg = new RegExp(str, 'i');
  var threadList = [];

  state.movieThreads.forEach(function (thread) {
    if (thread.content) {
      if (thread.content.match(rg) || thread.title.match(rg)) {
        threadList.push(thread);
        console.log('Str: ' + str + ', Rg: ' + rg);
      } else {
        thread.posts.forEach(function (post) {
          if (post.content.match(rg)) {
            threadList.push(thread);
          }
        });
      }
    } else {
      console.log('No Results Found ');
    }
  });
  renderMovieThreads(state, threadList);
}

//---------------Render Functions-------------------

// Header Background Pic Slider
function headerAnimation() {
  var picArr = ['luke-cage-bullets.gif', 'hoc2.jpg', 'ironfist.jpeg', 'bb.jpg', 'dd.jpg'];
  var count = 0;
  var interval = setInterval(function () {
    if (count >= picArr.length) {
      count = 0;
    }
    // $('header').css('background', `linear-gradient(rgba(255,0,0,0.4),rgba(255,0,0,0.4)),url("media/${picArr[count]}") no-repeat`)
    $('header').css('background-size', 'cover');
    count++;
  }, 2500);
}

function hideAllViews() {
  $('.view').hide();
}

function showView(screenName, flag) {
  hideAllViews();
  $('.hb-items').removeClass('hb-items-hide');
  $('.' + screenName + '.view').fadeIn(400);
  state.view = screenName;
  //$('footer').css({top: $(document).height() - $('footer').height()})
}

// Show All Threads When 'View Threads' is clicked on nav bar 
function renderMovieThreads(state, threadList) {
  // Clear View
  hideAllViews();
  $('.thread-list-items').empty();
  var list = [];
  if (threadList) {
    list = threadList;
  } else {
    list = state.movieThreads;
  }

  list.reverse().forEach(function (thread, ind) {
    $('.thread-list-items').append('<article class="js-movie-thread" id=' + thread._id + '>      \n      <p class="thread-title">' + thread.title + '</p>      \n      <span class="thread-created">' + new Date(thread.date).toLocaleString() + ',</span>\n      <span class="thread-author">' + thread.author + '</span>      \n    </article>');
  });
  showView('thread-list');
}

// Render Individual Thread When Selected By User
function renderIndThreadView(id, state) {
  var postIdArr = [];

  var thread = $.grep(state.movieThreads, function (elem, ind) {
    return elem._id == id;
  });

  hideAllViews();
  $('.js-btn-edit-thread').remove();

  // Add Thread ID to Section id
  $('.thread.view').attr('id', thread[0]._id);

  // Clear Posts
  $('.thread-view-title-posts').empty();

  // Fill in Thread Title Info
  $('.thread-view-title').text(thread[0].title);
  $('.thread-view-content').text(thread[0].content);
  $('.thread-creator').html('Thread Created by: <span class="js-thread-title-author">' + thread[0].author + '</span>');
  $('.thread-created').text('' + new Date(thread[0].date).toLocaleString());
  if (thread[0].author === state.user) {
    $('.add-post-wrapper').append('<button type="button" class="btn-add-post js-btn-edit-thread">Edit</button>');
  } else {
    //
  }
  showView('thread');
  // Load Thread Posts
  thread[0].posts.forEach(function (post, index) {
    $('.thread-view-title-posts').append('<article class="post-wrapper" id=' + post._id + '>\n\n          <span class="post-content-date"><span class="js-pc-user">' + post.user.slice(0, 1) + '</span>    <span class="js-pc-full-user">' + post.user + '</span>  ' + new Date(post.created).toLocaleString() + '</span>\n          <div class="post-content-wrapper">\n            \n            <div class="post-content">' + post.content + '</div>\n\n            <div class="post-meta">\n              <button class="likes"> <span class="thumb">&#x1F44D;</span> </button>\n              <span class="likes">' + post.likes.count + '</span>\n              <span class="btn-comment" id="btn-comment">Comment</span>            \n            </div>  \n          </div> \n        </article>               \n          ');

    // Add divider between Posts
    $('.thread-view-title-posts').append('<div class="js-separate"></div>');

    // Check to see if current user liked post then change thumbs up class.
    var match = false;
    post.likes.users.forEach(function (user) {
      if (user.trim() === state.user.trim()) {
        $('#' + post._id).find('.thumb').addClass('thumb-liked');
      }
    });

    if (post.user === state.user) {
      var btn_render = '<span class="btn-comment" id="btn-delete">Delete</span><span class="btn-post" id="btn-edit-post">Edit</span>';
      console.log($('.post-meta')[index]);
      $('.post-meta')[index].innerHTML += btn_render;
    }

    if (post.comments.length) {
      post.comments.forEach(function (comment) {
        console.log(comment);
        $('#' + post._id).append('\n            \n            \n            \n\n            \n\n          <div class="js-comment">\n          ' + comment.comment + '\n            <p class="js-comment-user"><span class="by">by:</span> ' + comment.user + '</p>\n          </div>\n        ');
      });
    }
  });
  // End Posts
}

//----------------Setup & Event Listeners----------------
$(function () {
  hideAllViews();

  //----- Login Buttons ------

  // Header Login Button
  $('.btn-login').click(function () {
    $('.login-form').show();
    $('.login-overlay').fadeIn();
    showView('login');
  }

  // Header Sign Up Button
  );$('.signup').click(function () {
    $('.login-overlay').fadeIn();
    $('.sign-up-form').fadeIn();
    showView('login');
  }

  // Switch between Login & Sign Up Forms When In Login View
  );$('.or-signup').click(function () {
    $('.login-form').hide();
    $('.sign-up-form').fadeIn();
  }

  // Switch between Login & Sign Up Forms When In Login View
  );$('.or-login').click(function () {
    $('.sign-up-form').hide();
    $('.login-form').fadeIn();
  }

  // Log Out Button
  );$('.btn-logout').click(function () {
    // lets remove the state from local storage, it will be created fresh after refresh
    localStorage.removeItem('state');
    window.location.reload(true);
  }

  // Submit Login Form
  );$('.login-form').submit(function (e) {
    e.preventDefault();
    checkLogin();
  });

  // Submit Logout 
  $('.sign-up-form').submit(function (e) {
    e.preventDefault();
    createUser();
  });

  // Home Nav Button
  $('.home').click(function () {
    showView('news');
  }

  // View Threads Nav Button
  );$('.btn-view-threads').click(function () {
    $('.search-wrapper').show();
    if (state.user) {
      _GET_AllThreads();
    } else {
      $('.btn-login').click();
      state.view = 'threadList';
    }
  }

  //--- Event Delegation Listeners ----

  // Render Indivual Thread if User is Logged In
  );$('.thread-list-items').on('click', '.js-movie-thread', function () {
    if (!state.user) {
      showView('login');
    } else {
      renderIndThreadView($(this).attr('id'), state);
      state.threadView = $(this).attr('id');
    }
  });

  // Delet Post Button
  $('.thread.view').on('click', '#btn-delete', function () {
    var postId = $(this).closest('article').attr('id');
    var threadId = $(this).closest('.thread.view').attr('id');
    deletePost(postId, threadId);
  }

  // Post Butotn to show 'create-post view'
  );$('.btn-add-post').click(function () {
    showView('create-post.view');
  });

  // Submit New Post Button
  $('.btn-create-post').click(function () {
    addPost();
  }

  // Edit Post Button
  );$('.thread.view').on('click', '#btn-edit-post', function () {
    var postId = $(this).closest('article').attr('id');
    $('.edit-post.view').attr('id', postId);

    showView('edit-post');
  }

  // Like (thumbs up) Post
  );$('.thread.view').on('click', '.likes', function (e) {
    var threadId = $('.thread.view').attr('id');
    var postId = $(this).closest('article').attr('id');
    var user = state.user;
    console.log(threadId, postId, user);
    state.threadId = threadId;
    like(postId, user);
  }

  // Edit Existing Thread Button
  );$('.thread-view-header').on('click', '.js-btn-edit-thread', function () {
    var threadId = $('.thread.view').attr('id');
    var content = $('.thread-view-content').text();
    var title = $('.thread-view-title').text();
    editThread(threadId, content, title);
  }

  // Add Comment Button
  );$('.thread.view').on('click', '.btn-comment', function () {
    var postId = $(this).closest('article').attr('id');
    addComment(postId);
  }

  // Cancel Adding/Editing Posts, Threads, & Comments Button
  );$('.cancel').click(function () {
    if (state.threadView) {
      renderIndThreadView('' + state.threadView, state);
    } else {
      _GET_AllThreads();
    }
  }

  //----- Add/Edit Buttons ------

  // New Thread Button in Nav
  );$('.btn-add-thread').click(function () {
    if (state.user) {
      showView('create-thread');
    } else {
      $('.btn-login').click();
    }
  }

  // Submit New Thread Button
  );$('.btn-create-thread').click(function () {
    addThread();
  }

  // Submit New Comment Button
  );$('.btn-create-comment').click(function () {
    createComment();
  }

  // Submit Edit to Thread Button
  );$('.btn-edit-thread-submit').click(function () {
    _PUT_editThread();
  }

  // Submit Edit to Post Button
  );$('.btn-edit-post-submit').click(function () {
    _PUT_editPost();
  }

  //----- Other Buttons -------

  // Show Hamburger nav Menu
  );$('.hb-menu').on('click', function (e) {
    $('.hb-items').toggleClass('hb-items-hide');
    e.preventDefault();
  }

  // View Threads Button in Nav if No User is Logged In
  );$('.thread-list-items').click(function (e) {
    if (!state.user) {
      e.stopPropagation();
      showView('login');
    }
  }

  // X Button to Close Login/Sign Up Form
  );$('.x-wrapper').click(function () {
    $('form').fadeOut();
    $('.login-overlay').fadeOut();
    showView('news');
  }

  // Search Button
  );$('.btn-search').click(function () {
    var str = $('.inp-search').val();
    searchThreads(str);
  }

  // Search Button Hamburger Menu
  );$('.hb-btn-search').click(function () {
    var str = $('.hb-inp-search').val();
    console.log('Search Str: ' + str);
    searchThreads(str);
  }

  // Setup Initial View
  );showView('news');
  headerAnimation();

  // Position Login Overlay
  $('.login-overlay').height($(document).height()

  // Set Initial View
  );state.view = 'news';
});