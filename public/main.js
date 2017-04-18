// theme http://forumstyle.us/forumus/default-version/viewforum.php?f=41&sid=e0225cc41d6fc61d866ff3cfff1c14aa



  

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
    "id":  90,
    "title": title,
    "date": stampDate(),
    "author": state.user,
    "posts": [
        {
          "id": 91,
          "content": post,
          "user": state.user,
          "created": stampDate(),
          "likes": 0,
          "comments": []
        }
    ]
  }
  MOCK_DATA.movieThreads.unshift(thread);
  // CallBack
  console.log(MOCK_DATA)
  _state_NewThreadUpdate(getThread(thread.id)[0])

}

function _state_NewThreadUpdate(newThread){      
  state.movieThreads.unshift(newThread);

  renderMovieThreads(state)
}

function renderMovieThreads(state){

  // Clear View
  hideAllViews();
  $('.thread-list-items').empty();
  $('.thread-list.view').fadeIn();

  state.movieThreads.forEach(function(thread, ind){
    $('.thread-list-items').append(`<article class="js-movie-thread" id=${thread.id}>
      <img src="https://tse4.mm.bing.net/th?id=OIP.VceLSE-SH0LSQysgDJZ0zgEsEs&pid=15.1&P=0&w=300&h=300" />    
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
    let id = Number($('.thread.view').attr('id'));
    _POST_newPost(id, content);
    // Clear textarea
    $('.post-content').val('');
    
}
  
function _POST_newPost(id, content){  
  let post = {
      id: 200,
      content: content,
      user: state.user,
      created: stampDate(),
      likes: 0,
      comments: []
    }

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
    _state_NewPostUpdate(id, post);
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
  $('.thread.view').attr('id', thread[0].id);

  // Clear Posts
  $('.thread-view-title-posts').empty();

  // Fill in Thread Title Info
  $('.thread-view-title').text(thread[0].title);
  $('.thread-author').text(`Thread Created by: ${thread.author}`);
  $('.thread-created').text(`on ${thread.date}`);

  // Load Thread Posts
  thread[0].posts.forEach(function(post){
    $('.thread-view-title-posts').append(
        `<article class="js-post" id=${post.id}>
          <p class="js-post-content">${post.content}</p>
          </ br>
          <span class="js-post-created">${post.created}</span>
          <span class="js-post-likes">Likes: ${post.likes}</span>
          <span class="js-post-author">Posted By: ${post.user}</span>   
        </article>`        
      );

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
      $('.thread-view-title-posts').append('<button class="js-btn-comment">Comment</button>')
    }
  })
}



function hideAllViews(){
  $('.view').hide();
}

function showView(screenName){
  $(`.${screenName}.view`).fadeIn(400);
}



function getThread(id){  
   let thread = $.grep(MOCK_DATA.movieThreads, function(elem, ind){  //y = $.grep(state.movieThreads, function(elem, ind){          
      return  elem.id === Number(id);    
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
  showView('thread-list.view')
  hideAllViews();
  $('.welcome').text(`Welcome ${state.user}`);
  $('nav').fadeIn();
  //getMovieThreadsAndDisplay();
  renderMovieThreads(state);
}


// Setup
$(function(){ 

  hideAllViews();
  

  // Listeners
  $('.login-form').submit(function(e){
    e.preventDefault();
    checkLogin();    
  });

  $('.sign-up-form').submit(function(e){
    e.preventDefault();
    createUser();
  });

  $('.thread-list-items').on('click', '.js-movie-thread', function(){
    renderIndThreadView($(this).attr('id'), state);
  });
  
  $('.thread-view-go-back').click(function(){
    console.log("CLICK")
    hideAllViews();
    $('.thread-list-items').empty();
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
    $('.create-thread.view').fadeIn();
  })

  $('.btn-create-thread').click(function(){
    addThread();
  })
  
  showView('login');
});





/*--------------  Data -------------*/
const MOCK_DATA = 
{
  movieThreads: 
  [
     {
       "id":  1,
       "title": "Tropic Thunder.. Hilarious",
       "date": "Mar 04 2017",
       "author": "Peter Schmo",
       "posts": [
                      {
                        "id": 2,
                        "content": "THis is my first post",
                        "user": "keedozq12",
                        "created": "Mar 04 2017",
                        "likes": 0,
                        "comments": [
                          {
                            "comment": "Awesom Movie",
                            "id": 3,
                            "user": "Matt Guy",
                            "likes": 3
                          },
                          {
                            "comment": "I dont think so",
                            "id": 4,
                            "user": "Bradley Cooper",
                            "likes": 2
                          }
                        ]
                      },
              
                      {
                        "id": 5,
                        "content": "Yeah I saw this movie, its ok",
                        "user": "Bob Deniro",
                        "created": "Jan 24 2011",
                        "likes": 1,
                        "comments": [
                          {
                            "comment": "Ok, its awesome",
                            "id": 6,
                            "likes": 4
                          },
                          {
                            "comment": "Yeah bob u crazy",
                            "id": 7,
                            "likes": 5
                          }
                        ]
                      }
                    
                 ]
     },
    {
       "id": 8,
       "title": "Captain America Civil War",
       "date": "Mar 04 2017",
       "author": "Vince Schmo",
       "posts": [
                      {
                        "id": 9,
                        "content": "Another Super hero movie... BORING",
                        "user": "Vince Schmo",
                        "created": "Jul 12 2014",
                        "likes": 0,
                        "comments": [
                          {
                            "comment": "Boring? Its sick!",
                            "id": 10,
                            "user": "Rob Lowe",
                            "likes": 2
                          },
                          {
                            "comment": "These movies are over done",
                            "id": 11,
                            "user": "Al Pacino",
                            "likes": 10
                          }
                        ]
                      },
              
                      {
                        "id": 12,
                        "content": "There all the same",
                        "user": "Ralph Cramden",
                        "created": "Feb 21 2013",
                        "likes": 0,
                        "comments": [
                          {
                            "comment": "I dont think so man",
                            "id": 13,
                            "likes": 15
                          },
                          {
                            "comment": "Yeah all pretty similar",
                            "id": 14,
                            "likes": 7
                          }
                        ]
                      }
         
                    
                 ]
     },
    {
       "id": 15,
       "title": "Drunken Master, Jackie Chan",
       "date": "Dec 23 2017",
       "author": "Frank Schmo",
       "posts": [
                      {
                        "id": 16,
                        "content": "Jackie Rocks",
                        "user": "Jet Li",
                        "created": "Mar 04 2017",
                        "likes": 10,
                        "comments": [
                          {
                            "comment": "He'll never be Bruce",
                            "id": 17,
                            "user": "Branon Lee",
                            "likes": 23
                          },
                          {
                            "comment": "They both stink",
                            "id": 18,
                            "user": "Donnie Yen",
                            "likes": 5
                          }
                        ]
                      },
              
                      {
                        "id": 19,
                        "content": "He's getting old",
                        "user": "Suzie Q",
                        "created": "Jun 13 2014",
                        "likes": 0,
                        "comments": [
                          {
                            "comment": "He can still kick your butt",
                            "id": 20,
                            "likes": 32
                          },
                          {
                            "comment": "Barely!",
                            "id": 21,
                            "likes": 23
                          }
                        ]
                      }
         
                    
                 ]
     },
    {
       "id": 22,
       "title": "Armagedon, Bruce Willis",
       "date": "Sep 2 2017",
       "author": "John Wayne",
       "posts": [
                      {
                        "id": 23,
                        "content": "Yippie Kay Yeh MF",
                        "user": "cowboy343",
                        "created": "Oct 04 2017",
                        "likes": 4,
                        "comments": [
                          {
                            "comment": "So cool",
                            "id": 24,
                            "user": "nobody32",
                            "likes": 2
                          },
                          {
                            "comment": "Liked the last one best",
                            "id": 25,
                            "user": "Sam Jackson",
                            "likes": 1
                          }
                        ]
                      },
              
                      {
                        "id": 26,
                        "content": "Fast n Furious is better",
                        "user": "Al Hitchcock",
                        "created": "Mar 04 2017",
                        "likes": 2,
                        "comments": [
                          {
                            "comment": "What?!?!",
                            "id": 27,
                            "likes": 100
                          },
                          {
                            "comment": "I dont think so",
                            "id": 28,
                            "likes": 20
                          }
                        ]
                      }
         
                    
                 ]
     }
  ]
}

const state = 
{
  movieThreads: 
  [
     {
       "id":  1,
       "title": "Tropic Thunder.. Hilarious",
       "date": "Mar 04 2017",
       "author": "Peter Schmo",
       "posts": [
                      {
                        "id": 2,
                        "content": "THis is my first post",
                        "user": "keedozq12",
                        "created": "Mar 04 2017",
                        "likes": 0,
                        "comments": [
                          {
                            "comment": "Awesom Movie",
                            "id": 3,
                            "user": "Matt Guy",
                            "likes": 3
                          },
                          {
                            "comment": "I dont think so",
                            "id": 4,
                            "user": "Bradley Cooper",
                            "likes": 2
                          }
                        ]
                      },
              
                      {
                        "id": 5,
                        "content": "Yeah I saw this movie, its ok",
                        "user": "Bob Deniro",
                        "created": "Jan 24 2011",
                        "likes": 1,
                        "comments": [
                          {
                            "comment": "Ok, its awesome",
                            "id": 6,
                            "likes": 4
                          },
                          {
                            "comment": "Yeah bob u crazy",
                            "id": 7,
                            "likes": 5
                          }
                        ]
                      }
                    
                 ]
     },
    {
       "id": 8,
       "title": "Captain America Civil War",
       "date": "Mar 04 2017",
       "author": "Vince Schmo",
       "posts": [
                      {
                        "id": 9,
                        "content": "Another Super hero movie... BORING",
                        "user": "Vince Schmo",
                        "created": "Jul 12 2014",
                        "likes": 0,
                        "comments": [
                          {
                            "comment": "Boring? Its sick!",
                            "id": 10,
                            "user": "Rob Lowe",
                            "likes": 2
                          },
                          {
                            "comment": "These movies are over done",
                            "id": 11,
                            "user": "Al Pacino",
                            "likes": 10
                          }
                        ]
                      },
              
                      {
                        "id": 12,
                        "content": "There all the same",
                        "user": "Ralph Cramden",
                        "created": "Feb 21 2013",
                        "likes": 0,
                        "comments": [
                          {
                            "comment": "I dont think so man",
                            "id": 13,
                            "likes": 15
                          },
                          {
                            "comment": "Yeah all pretty similar",
                            "id": 14,
                            "likes": 7
                          }
                        ]
                      }
         
                    
                 ]
     },
    {
       "id": 15,
       "title": "Drunken Master, Jackie Chan",
       "date": "Dec 23 2017",
       "author": "Frank Schmo",
       "posts": [
                      {
                        "id": 16,
                        "content": "Jackie Rocks",
                        "user": "Jet Li",
                        "created": "Mar 04 2017",
                        "likes": 10,
                        "comments": [
                          {
                            "comment": "He'll never be Bruce",
                            "id": 17,
                            "user": "Branon Lee",
                            "likes": 23
                          },
                          {
                            "comment": "They both stink",
                            "id": 18,
                            "user": "Donnie Yen",
                            "likes": 5
                          }
                        ]
                      },
              
                      {
                        "id": 19,
                        "content": "He's getting old",
                        "user": "Suzie Q",
                        "created": "Jun 13 2014",
                        "likes": 0,
                        "comments": [
                          {
                            "comment": "He can still kick your butt",
                            "id": 20,
                            "likes": 32
                          },
                          {
                            "comment": "Barely!",
                            "id": 21,
                            "likes": 23
                          }
                        ]
                      }
         
                    
                 ]
     },
    {
       "id": 22,
       "title": "Armagedon, Bruce Willis",
       "date": "Sep 2 2017",
       "author": "John Wayne",
       "posts": [
                      {
                        "id": 23,
                        "content": "Yippie Kay Yeh MF",
                        "user": "cowboy343",
                        "created": "Oct 04 2017",
                        "likes": 4,
                        "comments": [
                          {
                            "comment": "So cool",
                            "id": 24,
                            "user": "nobody32",
                            "likes": 2
                          },
                          {
                            "comment": "Liked the last one best",
                            "id": 25,
                            "user": "Sam Jackson",
                            "likes": 1
                          }
                        ]
                      },
              
                      {
                        "id": 26,
                        "content": "Fast n Furious is better",
                        "user": "Al Hitchcock",
                        "created": "Mar 04 2017",
                        "likes": 2,
                        "comments": [
                          {
                            "comment": "What?!?!",
                            "id": 27,
                            "likes": 100
                          },
                          {
                            "comment": "I dont think so",
                            "id": 28,
                            "likes": 20
                          }
                        ]
                      }
         
                    
                 ]
     }
  ]
}