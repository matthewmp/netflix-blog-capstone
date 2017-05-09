// theme http://forumstyle.us/forumus/default-version/viewforum.php?f=41&sid=e0225cc41d6fc61d866ff3cfff1c14aa

var state = {
  movieThreads: []
}

function _GET_AllThreads(){
  $.ajax({
    dataType: "json",
    url: "/threads",
    success: setInitialState,
    type: "GET",
    //crossDomain: true
  })
}  

function _GET_ThreadsRenderInd(){
  $.ajax({
    dataType: "json",
    url: "/threads",
    success: setAndRenderInd,
    type: "GET",
    //crossDomain: true
  })
}  

function setAndRenderInd(data){
  state.movieThreads = data.movieThreads; 
  renderIndThreadView(state.threadId, state)
}

function setInitialState(data){
  state.movieThreads = data.movieThreads; 
  renderMovieThreads(state);
}

function stampDate(){
  let d = new Date();
  let month = d.getMonth();
  let day = d.getDate();
  let year = d.getFullYear();

  return `${month} ${day} ${year}`

}



function addThread(){  
  let title = $('.create-thread-title').val();
  let content = $('.thread-content').val();

  _POST_NewThread(title, content);  
  $('.create-thread-title').val('');
  $('.thread-content').val('');
}

function _POST_NewThread(title, content){
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
}
/*
function _state_NewThreadUpdate(newThread){      
  state.movieThreads.push(newThread);
  setTimeout(function(){
    renderMovieThreads(state);
  }, 300)  
}
*/


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

function editPost(postId, threadId){
  showView('edit-post');
}

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




function renderMovieThreads(state){

  // Clear View
  hideAllViews();
  $('.thread-list-items').empty();
  

  state.movieThreads.reverse().forEach(function(thread, ind){
    $('.thread-list-items').append(`<article class="js-movie-thread" id=${thread._id}>
      <img src="media/film.png">    
      <p class="thread-title">${thread.title}</p>      
      <span class="thread-created">${thread.date},</span>
      <span class="thread-author">${thread.author}</span>      
    </article>`)
  })
  showView('thread-list');
}

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
    type: 'PUT',
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
      url: `/posts/new-post/${post.threadId}`,
      contentType: "application/json"      ,
      type: "PUT",
     // crossDomain: true,
      data: JSON.stringify(post),
      success: _GET_ThreadsRenderInd
    })
}

function _state_NewPostUpdate(id, post){
  //state.movieThreads[index].posts.push(post);
  let index;
  state.movieThreads.forEach(function(elem, ind){
    if(elem.id === id){
      index = ind//elem.posts.push(post);
    }
  })
  state.movieThreads[index].posts.push(post);
  renderIndThreadView(id, state);
}

function renderIndThreadView(id, state){ 
  let thread = getThread(id);
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
  $('.thread-created').text(`${thread[0].date}`);
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

          <div class="post-content-wrapper">
            <div class="post-content-date">
              <p>${post.created}</p>
              <div class="post-user-name">posted by: ${post.user}</div>
            </div>
            <div class="post-content">${post.content}</div>
          </div>

          <div class="post-meta">
            <span class="thumb">&#x1F44D;</span>
            <span class="likes">${post.likes}</span>
            <span class="btn-comment" id="btn-comment">Comment</span>
          </div>`);

        if(post.user === state.user){
          $($('.post-meta')[index]).append(`
              <span class="btn-comment" id="btn-delete">Delete</span>
              <span class="btn-post" id="btn-edit-post">Edit</span>
            `)
        }

        if(post.comments.length){
          post.comments.forEach(function(comment){
              $('.thread-view-title-posts').append(`
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
      url: '/posts',
      dataType: "json",
      contentType: "application/json",
      type: "DELETE",
      data: JSON.stringify(post),
      success: _GET_ThreadsRenderInd  
    })
}



function hideAllViews(){
  $('.view').hide();
}

function showView(screenName, flag){
  hideAllViews();  
  $(`.${screenName}.view`).fadeIn(400);
}



function getThread(id){  
   let thread = $.grep(state.movieThreads, function(elem, ind){      
      return  elem._id == id;    
    });
  return thread;
}


// Login Functions

function createUser(){
  let id = $('#new-user-id').val();
  let pass = $('#new-user-password').val();
  state.user = id;
  login(id);

}

function checkLogin(){
  let id = $('#user-id').val();
  let pass = $('#password').val();

    if(id === 'user' && pass === 'password'){
      $('.wrong-login').hide();
      state.user = id;
      login(state.user);
      
    }
    else{
      $('.wrong-login').fadeIn();
    }
}

function login(id){
  $('.btn-login').hide();
  $('.signup').hide();
  $('.btn-logout').fadeIn();
  $('form').hide();
  $('.login-overlay').hide();
  $('.welcome').text(`Welcome ${state.user}`);
  showView('news');
  
}

// Header Background Pic Slides
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


// Setup
$(function(){ 
/*
  $(function(){
    _GET_AllThreads();
  })
*/
  hideAllViews();
  

  // Listeners

  $('.btn-login').click(function(){
    $('.login-form').show();
    $('.login-overlay').fadeIn();
    showView('login');
  })

  $('.signup').click(function(){
    $('.login-overlay').fadeIn();
    $('.sign-up-form').fadeIn()
    showView('login');
  })

  $('.or-signup').click(function(){
    $('.login-form').hide();
    $('.sign-up-form').fadeIn();
  })

   $('.or-login').click(function(){
    $('.sign-up-form').hide();
    $('.login-form').fadeIn();
  })

   $('.btn-logout').click(function(){
      window.location.reload(true);
   })

  $('.home').click(function(){
    showView('news');
  })

  $('.btn-view-threads').click(function(){
    if(state.user){
      _GET_AllThreads();
    }
    else {
      $('.btn-login').click();      
    }
  })

  $('.login-form').submit(function(e){
    e.preventDefault();
    checkLogin();    
  });

  $('.sign-up-form').submit(function(e){
    e.preventDefault();
    createUser();
  });

  $('.thread-list-items').on('click', '.js-movie-thread', function(){
    if(!(state.user)){
      showView('login');
    }
    else{
      renderIndThreadView($(this).attr('id'), state);
    }    
  });

  $('.thread.view').on('click', '#btn-delete', function(){
    let postId = $(this).closest('article').attr('id');
    let threadId = $(this).closest('.thread.view').attr('id');    
    deletePost(postId, threadId);
  })

  $('.thread.view').on('click', '#btn-edit-post', function(){
    let postId = $(this).closest('article').attr('id');
    $('.edit-post.view').attr('id', postId)
    
    editPost();
  })

  $('.thread-view-header').on('click', '.js-btn-edit-thread', function(){
    let threadId = $('.thread.view').attr('id');
    let content = $('.thread-view-content').text();
    let title = $('.thread-view-title').text();    
    editThread(threadId, content, title);
  })

  $('.thread.view').on('click', '.btn-comment', function(){
    let postId = $(this).closest('article').attr('id');
    addComment(postId);
  })

  $('.btn-add-post').click(function(){
    showView('create-post.view');
  });

  $('.cancel').click(function(){
    showView('news');
  })

  $('.btn-create-post').click(function(){
    addPost();
  })

  $('.btn-add-thread').click(function(){
    if(state.user){
      showView('create-thread');  
    }
    else {
      $('.btn-login').click();      
    }
    
  })



  $('.btn-create-thread').click(function(){
    addThread();
  })

  $('.btn-create-comment').click(function(){
    createComment();
  })

  $('.btn-edit-thread-submit').click(function(){

    _PUT_editThread();
  })

  $('.btn-edit-post-submit').click(function(){    
    _PUT_editPost();
  })

  // If no user is logged in
  $('.thread-list-items').click(function(e){
    if(!(state.user)){
      e.stopPropagation();
      showView('login');
    }
  })

  $('.x-wrapper').click(function(){
    $('form').fadeOut();
    $('.login-overlay').fadeOut();
    showView('news');
  })
  
  
  showView('news');
  headerAnimation();

  //css
  $('.login-overlay').height($(document).height())

});
