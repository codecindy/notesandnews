
var Message = new ParseObjectType('Message');
var $mashable = $("#Mashable")
var $main = $("#main")

$(document).ready(function() {
  $('#message-form').submit(function(event) {
    // by default a form submit reloads the DOM which will subsequently reload all our JS
    // to avoid this we preventDefault()
    event.preventDefault();
    // grab user message input
    var message = $('#message').val();

    // clear message input (for UX purposes)
    $('#message').val('');

    // create a section for messages data in your db
    var messageObj = {
      text: message,
      upVotes: 0
    };

    Message.create({ text: message, upVotes: 0, downVotes: 0 }, function(err, result) {
      if (err) {
        console.error(err);
      } else {
        messageObj.objectId = result.objectId;
        renderMessage(messageObj);
      }
    });
  });

  // on initialization of app (when document is ready) get fan messages
  getFanMessages();

  function getFanMessages() {

    $mashable.on("click", function(e){
      e.preventDefault()

      $main.hide()

      $.ajax ({
        type: "GET",
        url: "http://feedr-api.wdidc.org/mashable.json",
        success: function(response){
          response.new.forEach(function(i){
            content.articles.push(
              {title: i.display_title,
              topic: i.channel_label,
              url: i.link}
              )
          })
        formatTemplate(content);
        }
      })
    })

    $('.message-board').on('click', '.fa', function(e) {
      var $this = $(this);
      if ($this.hasClass('vote-up')) {
        updateVote($this.closest('.message'));
      } else if ($this.hasClass('delete')) {
        removePost($this.closest('.message'));
      // } else if ($this.hasClass('strike-through')) {
      //   markAsDone($this.closest('.message'));
      } else {
        console.error('IDK');
      }
    });

    // function markAsDone($messageEl) {
    //   var messageId = $messageEl.data('id');
      
    // }

    function removePost($messageEl) {
      var messageId = $messageEl.data('id');

      Message.remove(messageId, function(err) {
        if (err) {
          console.error(err);
        } else {
          $('[data-id="' + messageId + '"]').remove();
        }
      });
    }

    function updateVote($messageEl) {
      var messageId = $messageEl.data('id');
      var upVotes = $messageEl.data('upvotes');

      upVotes += 1;

      Message.update(messageId, { upVotes: upVotes }, function(err, result) {
        if (err) {
          console.error(err);
        } else {
          var messageObj = {
            objectId: messageId,
            text: $messageEl.find('.message__text').html(),
            upVotes: upVotes
          };
          var html = compile(messageObj);
          $('[data-id="' + messageId + '"]').html(html);
        }
      });
    }

    Message.getAll(function(err, messages) {
      if (err) {
        console.error(err);
      } else {
        console.log(messages)
        messages.forEach(renderMessage);
      }
    });
  }

  function renderMessage(messageData) {
    var html = compile(messageData);
    $('.message-board').append(html);
  }

  function compile(messageData) {
    var source = $("#message-template").html();
    var template = Handlebars.compile(source);
    var html = template(messageData);
    return html;
  }

  var content = {articles: []}
  var testContent = {articles: [
  {  
    image: "#",
    title: "First Article Title",
    topic: "First Article Topic",
    impressions: 687
  },
  {
    image: "#",
    title: "Second Article Title",
    topic: "Second Article Topic",
    impressions: 967
  }
  ]}

  function formatTemplate(data) {
    var source = $("#article-template").html()
    var templater = Handlebars.compile(source)
    $main.append(templater(data))
    $main.css("display","inline");
  }

});
