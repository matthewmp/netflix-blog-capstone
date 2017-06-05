
var state = {
  movieThreads: []
}


//-------------- AJAX Requests------------------

// Get All Threads & Render List of Threads
function _GET_AllThreads(){
  $.ajax({
    dataType: "json",
    url: "/threads",
    success: function(data){
      state.movieThreads = data.movieThreads; 
      renderMovieThreads(state);
    },
    type: "GET",    
  })
}  

// Get All Threads and Render an Individual Thread
function _GET_ThreadsRenderInd(){
  $.ajax({
    dataType: "json",
    url: "/threads",
    type: "GET", 
    success: function(data){
      state.movieThreads = data.movieThreads; 
      renderIndThreadView(state.threadId, state)
    }
       
  })
}  

function addThread(){  
  let title = $('.create-thread-title').val();
  let content = $('.thread-content').val();

  let thread = {    
    "title": title,
    "author": state.user,
    "content": content
  }

  $.ajax({
    url: 'threads/new-thread',
    contentType: 'application/json',
    type: 'POST',
    data: JSON.stringify(thread),
    success: _GET_AllThreads()
  })

  $('.create-thread-title').val('');
  $('.thread-content').val('');
}

// Edit the content of existing thread
function _PUT_editThread(){
  let id = $('.edit-thread.view').attr('id');
  let title = $('.edit-thread-title').val();
  let author = state.user;
  let content = $('.edit-thread-content').val();

  let updateThread = {
    id: id,
    title: title,
    author: author,
    content: content
  };

  state.threadId = id;

  $.ajax({
    url: `threads/${id}`,
    contentType: 'application/json',
    type: 'PUT',
    data: JSON.stringify(updateThread),
    success: _GET_ThreadsRenderInd
  })
};

// Edit existing post
function _PUT_editPost(){

    let editPost = {
      postId: $('.edit-post.view').attr('id'),
      user: state.user,
      content: $('.edit-post-content').val()
    }

    state.threadId = $('.thread.view').attr('id');

    $.ajax({
    url: `posts/${editPost.postId}`,
    contentType: 'application/json',
    type: 'PUT',
    data: JSON.stringify(editPost),
    success: _GET_ThreadsRenderInd
  })
};


function createComment(){
  let comment = {
    postId: $('.create-comment.view').attr('id'),
    user: state.user,
    comment: $('.add-comment-content').val()
  }

  state.threadId = $('.thread.view').attr('id');
  $.ajax({
    url: `comments/${comment.postId}`,
    contentType: 'application/json',
    type: 'POST',
    data: JSON.stringify(comment),
    success: _GET_ThreadsRenderInd
  })
}
  
function _POST_newPost(id, content){  
  let post = {
      threadId: id,
      content: content,
      user: state.user     
    }        

  state.threadId = id;  
  $.ajax({
      url: `/posts/${post.threadId}`,
      contentType: "application/json"      ,
      type: "POST",
     // crossDomain: true,
      data: JSON.stringify(post),
      success: _GET_ThreadsRenderInd
    })
}

function deletePost(postId, threadId){
  console.log('Deleting POst')
  let post = {
    threadId: threadId,
    postId: postId
  }

  state.threadId = threadId;
  $.ajax({
      url: `/posts/${postId}`,
      dataType: "json",
      contentType: "application/json",
      type: "DELETE",
      data: JSON.stringify(post),
      success: _GET_ThreadsRenderInd  
    })
}

function like(postId, user){
  let tmpObj = {
    postId: postId,
    user: user
  };

  $.ajax({
    url: `/likes/${postId}`,
    dataType: "json",
    contentType: "application/json",
    type: "PUT",
    data: JSON.stringify(tmpObj),
    success: _GET_ThreadsRenderInd
  })
}

// Login AJAX Requests
function createUser(){
  let id = $('#new-user-id').val();
  let pass = $('#new-user-password').val();

  let user = {
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
    success: function(data){     
      if(data.username){
        state.user = data.username;
        login(state.user)
      }
    },
  })

}

function checkLogin(){
  let id = $('#user-id').val();
  let pass = $('#password').val();
  let user = {
    "username": id,
    "password": pass
  }; 

    $.ajax({
        type: "GET",
        headers: { "Authorization": "Basic " + btoa(user.username + ":" + user.password) },
        dataType: 'json',
        data: JSON.stringify(user),
        url: "/users/me",
        success: function (data) {
            if(data.user.username){
              let user = data.user.username;
              state.user = user;
              login(user);
            }
        }
    });
}



//-----------Set Up Functions for AJAX Requests--------------

function addPost(){
    let content = $('.add-post-content').val()
    let threadId = $('.thread.view').attr('id');    

    _POST_newPost(threadId, content);
    // Clear textarea
    $('.add-post-content').val('');   
}

function editThread(threadId, content, title){  
  $('.edit-thread-title').val(title);
  $('.edit-thread-content').text(content);
  $('.edit-thread.view').attr('id', threadId)
  showView('edit-thread')  
}

function addComment(postId){
  showView('create-comment');
  $('.create-comment.view').attr('id', postId)
}


//--------------State Management Functions---------------------

// Call back from AJAX Login Request
function login(id){
  $('.btn-login').hide();
  $('.signup').hide();
  $('.btn-logout').fadeIn();
  $('form').hide();
  $('.login-overlay').hide();
  $('.welcome').text(`Welcome ${state.user}`);

  if(state.view){
    _GET_AllThreads();
    showView('thread-list')
  } else {
    showView('news');
  }
}


// Return a list of threads that match users search
function searchThreads(str){
  let threadList = [];

  state.movieThreads.forEach((thread) => {
    if(thread.content){
      if(thread.content.indexOf(str) >= 0 || thread.title.indexOf(str) >= 0){
        threadList.push(thread);
      } else {
        thread.posts.forEach((post) => {
          if(post.content.indexOf(str) >= 0){
            threadList.push(thread);
          }
        })
      }
    }
    else if(!thread.content){
      console.log('MISS');
    }
  })
  renderMovieThreads(state, threadList);
}

//---------------Render Functions-------------------

// Header Background Pic Slider
function headerAnimation(){
  let picArr = ['luke-cage-bullets.gif', 'hoc2.jpg', 'ironfist.jpeg', 'bb.jpg', 'dd.jpg'];
  let count = 0;
  var interval = setInterval(function(){
    if(count >= picArr.length){
      count = 0;
    }
    $('header').css('background', `linear-gradient(rgba(255,0,0,0.4),rgba(255,0,0,0.4)),url("media/${picArr[count]}") no-repeat`)
    $('header').css('background-size', 'cover');    
    count++;
  }, 2500)  
}


function hideAllViews(){
  $('.view').hide();
}

function showView(screenName, flag){
  hideAllViews();  
  $(`.${screenName}.view`).fadeIn(400);
}

// Show All Threads When 'View Threads' is clicked on nav bar 
function renderMovieThreads(state, threadList){  
  // Clear View
  hideAllViews();
  $('.thread-list-items').empty();
  let list = [];
  if(threadList){
    list = threadList;
  } else {
    list = state.movieThreads;
  }

  list.reverse().forEach(function(thread, ind){    
    $('.thread-list-items').append(`<article class="js-movie-thread" id=${thread._id}>      
      <p class="thread-title">${thread.title}</p>      
      <span class="thread-created">${new Date(thread.date).toLocaleString()},</span>
      <span class="thread-author">${thread.author}</span>      
    </article>`)
  })
  showView('thread-list');
}


// Render Individual Thread When Selected By User
function renderIndThreadView(id, state){ 
  let postIdArr = [];

  let thread = $.grep(state.movieThreads, function(elem, ind){      
      return  elem._id == id;    
    });

  hideAllViews();
  $('.js-btn-edit-thread').remove();
  

  // Add Thread ID to Section id
  $('.thread.view').attr('id', thread[0]._id);

  // Clear Posts
  $('.thread-view-title-posts').empty();

  // Fill in Thread Title Info
  $('.thread-view-title').text(thread[0].title);
  $('.thread-view-content').text(thread[0].content)
  $('.thread-creator').html(`Thread Created by: <span class="js-thread-title-author">${thread[0].author}</span>`);
  $('.thread-created').text(`${new Date(thread[0].date).toLocaleString()}`);
  if(thread[0].author === state.user){
      $('.add-post-wrapper').append(`<button type="button" class="btn-add-post js-btn-edit-thread">Edit</button>`)
    }
    else {
      //
    }
  showView('thread');
  // Load Thread Posts
  thread[0].posts.forEach(function(post, index){  
    $('.thread-view-title-posts').append(
        `<article class="post-wrapper" id=${post._id}>

          <span class="post-content-date"><span class="js-pc-user">${post.user.slice(0,1)}</span>    <span class="js-pc-full-user">${post.user}</span>  ${new Date(post.created).toLocaleString()}</span>
          <div class="post-content-wrapper">
            
            <div class="post-content">${post.content}</div>

            <div class="post-meta">
              <button class="likes"> <span class="thumb">&#x1F44D;</span> </button>
              <span class="likes">${post.likes.count}</span>
              <span class="btn-comment" id="btn-comment">Comment</span>            
            </div>  
          </div> 
        </article>               
          `);

    // Add divider between Posts
    $('.thread-view-title-posts').append(
      `<div class="js-separate"></div>`
    );
    
    // Check to see if current user liked post then change thumbs up class.
    let match = false;
    post.likes.users.forEach(function(user){
      if(user.trim() === state.user.trim()){
       $(`#${post._id}`).find('.thumb').addClass('thumb-liked');
      }
    })
  
    if(post.user === state.user){ 
      let btn_render =  '<span class="btn-comment" id="btn-delete">Delete</span><span class="btn-post" id="btn-edit-post">Edit</span>'   
      console.log($('.post-meta')[index])
      $('.post-meta')[index].innerHTML += btn_render;
    }

    if(post.comments.length){
      post.comments.forEach(function(comment){
        console.log(comment);
          $(`#${post._id}`).append(`
            \n            
            \n
            \n
          <div class="js-comment">
          ${comment.comment}
            <p class="js-comment-user"><span class="by">by:</span> ${comment.user}</p>
          </div>
        `)
        });          
    }



  });
  // End Posts
}



//----------------Setup & Event Listeners----------------
$(function(){ 

  hideAllViews();

  //----- Login Buttons ------

  // Header Login Button
  $('.btn-login').click(function(){
    $('.login-form').show();
    $('.login-overlay').fadeIn();
    showView('login');
  })

  // Header Sign Up Button
  $('.signup').click(function(){
    $('.login-overlay').fadeIn();
    $('.sign-up-form').fadeIn()
    showView('login');
  })

  // Switch between Login & Sign Up Forms When In Login View
  $('.or-signup').click(function(){
    $('.login-form').hide();
    $('.sign-up-form').fadeIn();
  })

  // Switch between Login & Sign Up Forms When In Login View
   $('.or-login').click(function(){
    $('.sign-up-form').hide();
    $('.login-form').fadeIn();
  })

  // Log Out Button
  $('.btn-logout').click(function(){
      window.location.reload(true);
  })

  // Submit Login Form
  $('.login-form').submit(function(e){
    e.preventDefault();
    checkLogin();    
  });

  // Submit Logout 
  $('.sign-up-form').submit(function(e){
    e.preventDefault();
    createUser();
  });

  // Home Nav Button
  $('.home').click(function(){
    showView('news');
  })

  // View Threads Nav Button
  $('.btn-view-threads').click(function(){
    $('.search-wrapper').show();
    if(state.user){
      _GET_AllThreads();
    }
    else {
      $('.btn-login').click(); 
      state.view = 'threadList';     
    }
  })


  //--- Event Delegation Listeners ----

  // Render Indivual Thread if User is Logged In
  $('.thread-list-items').on('click', '.js-movie-thread', function(){
    if(!(state.user)){
      showView('login');
    }
    else{
      renderIndThreadView($(this).attr('id'), state);
    }    
  });

  // Delet Post Button
  $('.thread.view').on('click', '#btn-delete', function(){
    let postId = $(this).closest('article').attr('id');
    let threadId = $(this).closest('.thread.view').attr('id');    
    deletePost(postId, threadId);
  })

  // Post Butotn to show 'create-post view'
  $('.btn-add-post').click(function(){
    showView('create-post.view');
  });

  // Submit New Post Button
  $('.btn-create-post').click(function(){
    addPost();
  })

  // Edit Post Button
  $('.thread.view').on('click', '#btn-edit-post', function(){
    let postId = $(this).closest('article').attr('id');
    $('.edit-post.view').attr('id', postId)
    
    showView('edit-post');
  })

  // Like (thumbs up) Post
  $('.thread.view').on('click', '.thumb', function(e){    
    let threadId = $('.thread.view').attr('id');
    let postId = $(this).closest('article').attr('id');    
    let user = state.user;

    state.threadId = threadId;
    like(postId, user);
  })

  // Unlike Post
  $('.thread.view').on('click', '.thumb-liked', function(e){      
    let threadId = $('.thread.view').attr('id');
    let postId = $(this).closest('article').attr('id');    
    let user = state.user;

    state.threadId = threadId;
    like(postId, user);
  })

  
  // Edit Existing Thread Button
  $('.thread-view-header').on('click', '.js-btn-edit-thread', function(){
    let threadId = $('.thread.view').attr('id');
    let content = $('.thread-view-content').text();
    let title = $('.thread-view-title').text();    
    editThread(threadId, content, title);
  })

  // Add Comment Button
  $('.thread.view').on('click', '.btn-comment', function(){
    let postId = $(this).closest('article').attr('id');
    addComment(postId);
  })

  // Cancel Adding/Editing Posts, Threads, & Comments Button
  $('.cancel').click(function(){
    showView('news');
  })

 
  //----- Add/Edit Buttons ------

  // New Thread Button in Nav
  $('.btn-add-thread').click(function(){
    if(state.user){
      showView('create-thread');  
    }
    else {
      $('.btn-login').click();      
    }
    
  })

  // Submit New Thread Button
  $('.btn-create-thread').click(function(){
    addThread();
  })

  // Submit New Comment Button
  $('.btn-create-comment').click(function(){
    createComment();
  })

  // Submit Edit to Thread Button
  $('.btn-edit-thread-submit').click(function(){
    _PUT_editThread();
  })

  // Submit Edit to Post Button
  $('.btn-edit-post-submit').click(function(){    
    _PUT_editPost();
  })

  //----- Other Buttons -------

  // View Threads Button in Nav if No User is Logged In
  $('.thread-list-items').click(function(e){
    if(!(state.user)){
      e.stopPropagation();
      showView('login');
    }
  })

  // X Button to Close Login/Sign Up Form
  $('.x-wrapper').click(function(){
    $('form').fadeOut();
    $('.login-overlay').fadeOut();
    showView('news');
  })
  
  // Search Button
  $('.btn-search').click(function(){
    let str = $('.inp-search').val();
    searchThreads(str);
  })

  // Setup Initial View
  showView('news');
  headerAnimation();

  // Position Login Overlay
  $('.login-overlay').height($(document).height())

});
