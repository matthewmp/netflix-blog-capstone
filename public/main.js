// theme http://forumstyle.us/forumus/default-version/viewforum.php?f=41&sid=e0225cc41d6fc61d866ff3cfff1c14aa

var state = {

}

function _GET_AllThreads(){
  $.ajax({
    dataType: "json",
    url: "http://localhost:8080/threads",
    success: setInitialState,
    type: "GET",
    crossDomain: true
  })
}  

function setInitialState(data){
  state.movieThreads = data.movieThreads;
  console.log(data);
  if(state.user !== undefined){
     renderMovieThreads(state);
  }
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
  let post = $('.thread-content').val();

  _POST_NewThread(title, post);  
}

function _POST_NewThread(title, post){
  let thread = {    
    "title": title,
    "author": state.user,
    "posts": [
        {
          "content": post,
          "user": state.user,
          "likes": 0,
        }
    ]
  }

  $.ajax({
    url: 'threads/new-thread',
    contentType: 'application/json',
    type: 'POST',
    crossDomain: true,
    data: JSON.stringify(thread),    
    success: _state_NewThreadUpdate
  })

  /*
  MOCK_DATA.movieThreads.unshift(thread);
  // CallBack
  console.log(MOCK_DATA)
  _state_NewThreadUpdate(getThread(thread.id)[0])
*/
}

function _state_NewThreadUpdate(newThread){      
  state.movieThreads.push(newThread);
  setTimeout(function(){
    renderMovieThreads(state);
  }, 300)  
}

function renderMovieThreads(state){

  // Clear View
  hideAllViews();
  $('.thread-list-items').empty();
  $('.thread-list.view').fadeIn();

  state.movieThreads.reverse().forEach(function(thread, ind){
    $('.thread-list-items').append(`<article class="js-movie-thread" id=${thread._id}>
      <img src="media/film.png">    
      <p class="thread-title">${thread.title}</p>      
      <span class="thread-created">${thread.date},</span>
      <span class="thread-author">${thread.author}</span>      
    </article>`)
  })
}

function addPost(content){
    if(content === undefined) {
      content = $('.post-content').val()
    }
    let id = $('.thread.view').attr('id');
    console.log(`ADD POST: Id: ${id}, Content: ${content}`)
    _POST_newPost(id, content);
    // Clear textarea
    $('.post-content').val('');
    
}
  
function _POST_newPost(id, content){  
  let post = {
      id: id,
      content: content,
      user: state.user,      
    }
    console.log(post);

  $.ajax({
      url: `/threads/new-post/${id}`,
      contentType: "application/json"      ,
      type: "PUT",
      crossDomain: true,
      data: JSON.stringify(post),
      success: function(data){
        _GET_AllThreads();         
      }    
    })
  /*
    let index;
    MOCK_DATA.movieThreads.forEach(function(elem, ind){      
      if(elem.id === id){ 
        index = ind;       
        //elem.posts.push(post) 
        //console.log("PUSHED")
      }      
    })
    MOCK_DATA.movieThreads[index].posts.push(post)
    //CallBack
    */
    
    //_state_NewPostUpdate(id, post);
    setTimeout(function(){
      renderIndThreadView(id, state);
    }, 300)
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
  $('.thread.view').fadeIn(1000);

  // Add Thread ID to Section id
  $('.thread.view').attr('id', thread[0]._id);

  // Clear Posts
  $('.thread-view-title-posts').empty();

  // Fill in Thread Title Info
  $('.thread-view-title').text(thread[0].title);
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

function showView(screenName){
  $(`.${screenName}.view`).fadeIn(400);
}



function getThread(id){  
  console.log(id);
   let thread = $.grep(state.movieThreads, function(elem, ind){
      console.log(`Elem: ${typeof elem._id}, ID: ${id}, ${typeof id}`)
      return  elem._id === id;    
    });
   console.log(thread);
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
  $('.welcome').text(`Welcome ${state.user}`);
  $('nav').fadeIn();  
   _GET_AllThreads();
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

  $('.btn-header').click(function(){
    showView('login');
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
      console.log("DSF: ")
      console.log($(this).attr('class'));
      renderIndThreadView($(this).attr('id'), state);
    }    
  });
  
  $('.thread-view-go-back').click(function(){
    console.log("CLICK")
    hideAllViews();
    $('.thread-list-items').empty();
    renderMovieThreads(state);
    renderMovieThreads(state);
  });

  $('.btn-add-post').click(function(){
    showView('create-post.view');
  });

  $('.cancel').click(function(){
    $('.create-post.view').fadeOut();
    $('.create-thread.view').fadeOut();
  })

  $('.btn-create-post').click(function(){
    addPost();
  })

  $('.btn-add-thread').click(function(){
    if(state.user){
      $('.create-thread.view').fadeIn();  
    }
    else {
      showView('login');
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
    $('.signup.view').hide();
    $('.login.view').hide();
  })
  
  
  showView('news');
  headerAnimation();
});
