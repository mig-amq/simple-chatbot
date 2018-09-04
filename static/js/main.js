$(document).ready(function (){
    var writing = false;
     $('[data-toggle="tooltip"]').tooltip();

    var i = 0;
    var speed = 30;
    var resp = $("#response");
    var message = "";

    var curr_sessID = "", curr_name = "";
    $("#modi-text").keypress(function (event) {
        if (!writing) {
            message = $(this).val();
            if (curr_sessID !== "") {
                $(this).attr("data-session", curr_sessID);
            } else {
                curr_sessID = $(this).attr("data-session");
            }

           if (curr_name !== "") {
                $(this).attr("data-name", curr_name);
           } else {
                 curr_name = $(this).attr("data-name");
           }

            if (event.keyCode === 13) {

                event.preventDefault();
                $(this).val('');

                resp.empty(); // clear response feed
                resp.html("<p class='small'><i>Modi</i> Says:</p>");
                i = 0;

                // save current session to database
                if(message.toLowerCase().indexOf("remember me") !== -1) {
                    if (curr_sessID) {
                        $.ajax({
                            url: "send_chat/",
                            data: {
                                message: "remember me",
                                name: curr_name,
                                session: curr_sessID
                            },method: "GET",
                            success: function (data) {
                                if (data === "success") {
                                    message = "Done! Your code is : " + curr_sessID;
                                    write();
                                } else {
                                    message = "Uh Oh! I can't do that.";
                                    write();
                                }
                            }
                        });
                    } else {
                        message = "We haven't even started talking yet!";
                        write();
                    }
                } else if (message.split(" ")[0] === "load") { // load old session from db
                    message = message.split(" ")[0] + " " + message.split(" ")[1];
                    $.ajax({
                        url: 'send_chat/',
                        dataType: "json",
                        data: {
                            message: message
                        },method: "GET",
                        success: function (data) {
                            if (data.success === "false") {
                                message = "Oops! I can't find our session.";
                                write();
                            } else {
                                if (data.user)
                                    message = "Hello, " + data.user;
                                else
                                    message = "It's good to see you again!";

                                $("#modi-text").attr("data-session", data.session);
                                $("#modi-text").attr("data-name", data.user);

                                curr_sessID = $("#modi-text").attr("data-session");
                                curr_name = $("#modi-text").attr("data-name");

                                write();
                            }
                        }
                    })
                } else { // normal chat
                    $.ajax({
                        url: "send_chat/",
                        // async: false,
                        data: {
                            message: message,
                            name: curr_name,
                            session: curr_sessID
                        },method: "GET",
                        dataType: "json",
                        success: function (data) {
                            console.log(data);
                            if (data === "fail") {
                                message = "Darn! I think something bad happened.";
                                write();
                            } else {
                                message = data.result.fulfillment.speech;

                                if (curr_sessID === ""){
                                    curr_sessID = data.sessionId;
                                    $(this).attr("data-session", curr_sessID);
                                }

                                if (data.result.actionIncomplete === false && data.result.metadata.intentName === "Get My Name") {
                                    curr_name = data.user_name;
                                    $(this).attr("data-name", curr_name);
                                }

                                write();
                            }
                        }
                    });
                }
            }
        }
    });

    function write () {
        if (i < message.length) {
            writing = true;
            console.log(message.charAt(i));
            resp.html(resp.html() + message.charAt(i));
            i++;
            setTimeout(write, speed);
        } else {
            writing = false;
        }
    }
});