// theme http://forumstyle.us/forumus/default-version/viewforum.php?f=41&sid=e0225cc41d6fc61d866ff3cfff1c14aa


function getMovieThreads(callbackFn){
  setTimeout(function(){callbackFn(state)}, 100);
}

// Render Functions

function hideAllViews(){
  $('.view').hide();
}

function showView(screenName){
  $(`.${screenName}.view`).fadeIn(400);
}



function renderMovieThreads(state){

  // Clear View
  
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
  

function renderIndThreadView(threadID, state){ 
  hideAllViews();
  $('.thread.view').fadeIn(1000);

  let thread = grabThread(Number(threadID));
  console.log(thread)

  // Clear Posts
   $('.thread-view-title-posts').empty();

  $('.thread-view-title').text(thread[0].title);
  $('.thread-author').text(`Thread Created by: ${thread[0].author}`);
  $('.thread-created').text(`on ${thread[0].date}`);

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

    if(post.comments){
      post.comments.forEach(function(comm){
        $(`#${post.id}`).append(
            `<article class="js-post-comments" id=${comm.id}>
                <p>${comm.comment}</p>
                <span class="js-post-likes">Likes: ${comm.likes}</span>
             </article>`
          );
      })
      $('.thread-view-title-posts').append('<button class="btn-comment">Comment</button>')
    }
  })
}


hideAllViews();
  
function grabThread(threadID){  
   var y = $.grep(state.movieThreads, function(elem, ind){          
      return  elem.id == threadID;        
    });
   return y;
}

function getMovieThreadsAndDisplay(){
  getMovieThreads(renderMovieThreads);
}

// Login Functions

function createUser(){
  let id = $('#new-user-id').val();
  let pass = $('#new-user-password').val();
  login(id);

}

// Just for mock-data-client
var USER;
function checkLogin(){
  let id = $('#user-id').val();
  let pass = $('#password').val();

    if(id === 'user' && pass === 'password'){
      $('.wrong-login').hide();
      login(id)
    }
    else{
      $('.wrong-login').fadeIn();
    }
}

function login(id){
  showView('thread-list.view')
  hideAllViews();
  $('.welcome').text(`Welcome ${id}`);
  $('.welcome').fadeIn();
  getMovieThreadsAndDisplay();
}

$(function(){
  

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
  })

  
  showView('login');

  
});



const state = 
{
  movieThreads: 
  [
     {
       "id":  Math.floor(Math.random() * 999999999),
       "title": "Tropic Thunder.. Hilarious",
       "date": "Mar 04 2017",
       "author": "Peter Schmo",
       "posts": [
                      {
                        "id": Math.floor(Math.random() * 999999999),
                        "content": "THis is my first post",
                        "user": "keedozq12",
                        "created": "Mar 04 2017",
                        "likes": 0,
                        "comments": [
                          {
                            "comment": "Awesom Movie",
                            "id": Math.floor(Math.random() * 999999999),
                            "user": "Matt Guy",
                            "likes": 3
                          },
                          {
                            "comment": "I dont think so",
                            "id": Math.floor(Math.random() * 999999999),
                            "user": "Bradley Cooper",
                            "likes": 2
                          }
                        ]
                      },
              
                      {
                        "id": Math.floor(Math.random() * 999999999),
                        "content": "Yeah I saw this movie, its ok",
                        "user": "Bob Deniro",
                        "created": "Jan 24 2011",
                        "likes": 1,
                        "comments": [
                          {
                            "comment": "Ok, its awesome",
                            "id": Math.floor(Math.random() * 999999999),
                            "likes": 4
                          },
                          {
                            "comment": "Yeah bob u crazy",
                            "id": Math.floor(Math.random() * 999999999),
                            "likes": 5
                          }
                        ]
                      }
                    
                 ]
     },
    {
       "id": Math.floor(Math.random() * 999999999),
       "title": "Captain America Civil War",
       "date": "Mar 04 2017",
       "author": "Vince Schmo",
       "posts": [
                      {
                        "id": Math.floor(Math.random() * 999999999),
                        "content": "Another Super hero movie... BORING",
                        "user": "Vince Schmo",
                        "created": "Jul 12 2014",
                        "likes": 0,
                        "comments": [
                          {
                            "comment": "Boring? Its sick!",
                            "id": Math.floor(Math.random() * 999999999),
                            "user": "Rob Lowe",
                            "likes": 2
                          },
                          {
                            "comment": "These movies are over done",
                            "id": Math.floor(Math.random() * 999999999),
                            "user": "Al Pacino",
                            "likes": 10
                          }
                        ]
                      },
              
                      {
                        "id": Math.floor(Math.random() * 999999999),
                        "content": "There all the same",
                        "user": "Ralph Cramden",
                        "created": "Feb 21 2013",
                        "likes": 0,
                        "comments": [
                          {
                            "comment": "I dont think so man",
                            "id": Math.floor(Math.random() * 999999999),
                            "likes": 15
                          },
                          {
                            "comment": "Yeah all pretty similar",
                            "id": Math.floor(Math.random() * 999999999),
                            "likes": 7
                          }
                        ]
                      }
         
                    
                 ]
     },
    {
       "id": Math.floor(Math.random() * 999999999),
       "title": "Drunken Master, Jackie Chan",
       "date": "Dec 23 2017",
       "author": "Frank Schmo",
       "posts": [
                      {
                        "id": Math.floor(Math.random() * 999999999),
                        "content": "Jackie Rocks",
                        "user": "Jet Li",
                        "created": "Mar 04 2017",
                        "likes": 10,
                        "comments": [
                          {
                            "comment": "He'll never be Bruce",
                            "id": Math.floor(Math.random() * 999999999),
                            "user": "Branon Lee",
                            "likes": 23
                          },
                          {
                            "comment": "They both stink",
                            "id": Math.floor(Math.random() * 999999999),
                            "user": "Donnie Yen",
                            "likes": 5
                          }
                        ]
                      },
              
                      {
                        "id": Math.floor(Math.random() * 999999999),
                        "content": "He's getting old",
                        "user": "Suzie Q",
                        "created": "Jun 13 2014",
                        "likes": 0,
                        "comments": [
                          {
                            "comment": "He can still kick your butt",
                            "id": Math.floor(Math.random() * 999999999),
                            "likes": 32
                          },
                          {
                            "comment": "Barely!",
                            "id": Math.floor(Math.random() * 999999999),
                            "likes": 23
                          }
                        ]
                      }
         
                    
                 ]
     },
    {
       "id": Math.floor(Math.random() * 999999999),
       "title": "Armagedon, Bruce Willis",
       "date": "Sep 2 2017",
       "author": "John Wayne",
       "posts": [
                      {
                        "id": Math.floor(Math.random() * 999999999),
                        "content": "Yippie Kay Yeh MF",
                        "user": "cowboy343",
                        "created": "Oct 04 2017",
                        "likes": 4,
                        "comments": [
                          {
                            "comment": "So cool",
                            "id": Math.floor(Math.random() * 999999999),
                            "user": "nobody32",
                            "likes": 2
                          },
                          {
                            "comment": "Liked the last one best",
                            "id": Math.floor(Math.random() * 999999999),
                            "user": "Sam Jackson",
                            "likes": 1
                          }
                        ]
                      },
              
                      {
                        "id": Math.floor(Math.random() * 999999999),
                        "content": "Fast n Furious is better",
                        "user": "Al Hitchcock",
                        "created": "Mar 04 2017",
                        "likes": 2,
                        "comments": [
                          {
                            "comment": "What?!?!",
                            "id": Math.floor(Math.random() * 999999999),
                            "likes": 100
                          },
                          {
                            "comment": "I dont think so",
                            "id": Math.floor(Math.random() * 999999999),
                            "likes": 20
                          }
                        ]
                      }
         
                    
                 ]
     }
  ]
}