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
/*
function reviewPost(id){
  $.ajax({
    dataType: "json",
    url: "http://localhost:8080/threads",
    success: showUpdatedPost,
    type: "GET"
  })

  function showUpdatedPost(data){
    setInitialState(data, 'ind', id)
  }
} 
*/
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
function renderMovieThreads(state){

  // Clear View
  hideAllViews();
  $('.thread-list-items').empty();
  showView('thread-list');

  state.movieThreads.reverse().forEach(function(thread, ind){
    $('.thread-list-items').append(`<article class="js-movie-thread" id=${thread._id}>
      <img src="media/film.png">    
      <p class="thread-title">${thread.title}</p>      
      <span class="thread-created">${thread.date},</span>
      <span class="thread-author">${thread.author}</span>      
    </article>`)
  })
}

function addPost(){
  
    let content = $('.add-post-content').val()
    
    let threadId = $('.thread.view').attr('id');    
    _POST_newPost(threadId, content);
    // Clear textarea
    $('.add-post-content').val('');
    
}
  
function _POST_newPost(id, content){  
  let post = {
      threadId: id,
      content: content,
      user: state.user     
    }   
    console.log(post) 

  $.ajax({
      url: `/posts/new-post/${post.threadId}`,
      contentType: "application/json"      ,
      type: "PUT",
     // crossDomain: true,
      data: JSON.stringify(post),
      success: _GET_AllThreads
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
  showView('thread');

  // Add Thread ID to Section id
  $('.thread.view').attr('id', thread[0]._id);

  // Clear Posts
  $('.thread-view-title-posts').empty();

  // Fill in Thread Title Info
  $('.thread-view-title').text(thread[0].title);
  $('.thread-view-content').text(thread[0].content)
  $('.thread-creator').html(`Thread Created by: <span class="js-thread-title-author">${thread[0].author}</span>`);
  $('.thread-created').text(`${thread[0].date}`);

  // Load Thread Posts
  thread[0].posts.forEach(function(post){
    $('.thread-view-title-posts').append(
        `<article class="post-wrapper" id=${post.id}>
          <div class="post-user-info">
            <div class="user-info-name">
              <p> ${post.user} </p>
            </div>
            <div class="user-img-wrapper">
              <img class="user-img" src="http://santetotal.com/wp-content/uploads/2014/05/default-user.png" />
            </div>  
          </div>

          <div class="post-content-wrapper">
            <div class="post-content-date">
              <p>${post.created}</p>
            </div>
            <div class="post-content">${post.content}</div>
          </div>

          <div class="post-meta">
            <span class="thumb">&#x1F44D;</span>
            <span class="likes">${post.likes}</span>
            <span class="btn-comment">Comment</span>
          </div>`);

        if(post.comments.length){
          post.comments.forEach(function(comment){
              $('.thread-view-title-posts').append(`
                \n            
                \n
                <span class="js-comment-user"><span class="by">by:</span> ${comment.user}</span>
                \n
              <div class="js-comment">${comment.comment}</div>
            `)
            });
          
        }

        /*`<article class="js-post" id=${post.id}>
          <p class="js-post-content">${post.content}</p>
          </ br>
          <span class="js-post-created">${post.created}</span>
          <span class="js-post-likes">Likes: ${post.likes}</span>
          <span class="js-post-author">Posted By: ${post.user}</span>   
        </article>`        
      );*/

    



  
      /*
    // Load Thread Post Comments
    if(post.comments){
      post.comments.forEach(function(comm){
        $(`#${post.id}`).append(
            `<article class="js-post-comments" id=${comm.id}>
                <p>${comm.comment}</p>
                <span class="js-post-likes">Likes: ${comm.likes}</span>
             </article>`
          );
      })
     // $('.thread-view-title-posts').append('<button class="js-btn-comment">Comment</button>')
    }*/
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
  //showView('thread-list.view')
  //hideAllViews();
  $('form').hide();
  $('.login-overlay').hide();
  $('.welcome').text(`Welcome ${state.user}`);
  showView('news');
  // _GET_AllThreads();
  //renderMovieThreads(state);
  //renderMovieThreads(state);
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
