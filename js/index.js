var pdata = {tag: '', sid: '', bid: 0};
var gametype = {room: ['kfran', 'gofish2', 'gofish3', 'gofish4','gofish5', 'gofish6', 'gofish2f', 'gofish3f', 'gofish4f','gofish5f', 'gofish6f'], players:['2', '2', '3', '4', '5', '6', '2', '3', '4', '5', '6'], srp: ['1', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2']};
var players_connected = 1;
var player_connecting = {tag: '', sid: ''};
var pstates = {turn: 0, leadingcard: '', leadingpl: '0', firstpl: 0};
var tcont = 0;
var callback = function(){};
var players = {tag: [], sid: [], place: [], cards: [[] , []], drawn: [0, 0], played: [0, 0]};
var deck = [];
var iam = 0;

$(document).ready(function(){
    $('#afui').removeAttr('class').addClass('ios7');	

    $(window).resize(function(){
        if(players.tag.length == 0){
            if(!$.os.ios &&! $.os.android){
                stroll.bind('#home ul');
            }
        }else{
            set_chat_win_height();
        }
    });
    $.ui.loadContent("home", null, null, "fade");

    stroll.bind('#home ul');
    $.ui.setRightSideMenuWidth(270);
    $.ui.setLeftSideMenuWidth(270);
/* vars */
    var socket = io('https://eduah-sock-server.herokuapp.com');
    function timer(){
        callback();
    }
    setInterval(timer, 1000);

/* init functions */
    function restart_every_thing(){
        $("script[class='game_script']").remove();
        $("link[class='game_style']").remove();
        $.ui.loadContent("home", null, null, "flip");
        socket.emit('leave room', gametype.room[pdata.bid]);
        socket.emit('all in room', {channel: 'someone left', room: gametype.room[pdata.bid], msg: pdata.sid});
        pdata.bid = '';
        socket.emit('get room stats', gametype.room);
        $('.playlist').html('');
    }
    re_l = restart_every_thing;
    function set_board_id(id) {
        pdata.bid = id;
        //Create a 'script' element    
        var scrptE = document.createElement("script");

        // Set it's 'type' attribute  
        scrptE.setAttribute("type", "text/javascript");

        scrptE.setAttribute("class", "game_script");

        // Set it's 'language' attribute
        scrptE.setAttribute("language", "JavaScript");

        // Set it's 'src' attribute
        scrptE.setAttribute("src", "g_modules/" + gametype.srp[pdata.bid] + "/index.js");

        // Now add this new element to the head tag
        $('head').append(scrptE);
        $.ui.loadContent("page1", null, null, "flip");
        if(pdata.tag != ''){
            $.ui.loadContent("page2", 'page1', null, "right");
            socket.emit('join room', gametype.room[pdata.bid]);

            socket.emit('all in room', {channel: 'user list', room: gametype.room[pdata.bid], msg:{ tag: pdata.tag, sid: pdata.sid, rep: 1}});

            players.tag[iam] = pdata.tag;
            players.sid[iam] = pdata.sid;
            players.drawn[iam] = 0;
            players.played[iam] = 0;
            players.cards[iam] = [];
        }
    }
    game_s = set_board_id;
    function lets_start(){
        
        $('input[name=clid]').val($('input[name=clid]').val().replace(/[^a-zA-Z0-9]+/g,""));

        if($('input[name=clid]').val() == ""){
            $.ui.popup( {
                title:"Gamer tag Required!",
                message:'<input name="clida" type="text" placeholder="Please Enter a valid user name here"/>',
                cancelText:"Choose Playmate",
                cancelCallback: function(){
                    $('input[name=clid]').val($('input[name=clida]').val().replace(/[^a-zA-Z0-9]+/g,""));
                    lets_start();
                },
                cancelOnly:true
            });
            return false;
        }
        $.ui.loadContent("page2", null, null, "right");

        pdata.tag = $('input[name=clid]').val();
        
        socket.emit('join room', gametype.room[pdata.bid]);

        socket.emit('all in room', {channel: 'user list', room: gametype.room[pdata.bid], msg:{ tag: pdata.tag, sid: pdata.sid, rep: 1}});

        players.tag[iam] = pdata.tag;
        players.sid[iam] = pdata.sid;
        players.drawn[iam] = 0;
        players.played[iam] = 0;
        players.cards[iam] = [];

    }
    init_b = lets_start;

/* send play connection negotiation request and recive approve */
    function sendPlayRequest(sid){
        if(player_connecting.sid == '' && players_connected < gametype.players[pdata.bid]) {

            player_connecting.sid = sid;
            player_connecting.tag = $('.' + sid.replace(/[^a-zA-Z]+/g,"")).html();

            socket.emit('to some one', {channel: 'receive play request', did: sid, msg:{ tag: pdata.tag, sid: pdata.sid}});
            tcnt = 0;
            callback = conectionTimer1;
            $.ui.popup( {
                title:"Waiting",
                message:'for play request aproval from ' + player_connecting.tag,
                cancelText:"Cancel Request",
                cancelCallback: function(){
                    callback = function (){};
                    player_connecting = {tag: '', sid: ''};
                },
                cancelOnly:true
            });
        }       
    }
    send_pr = sendPlayRequest;
    socket.on('receive play approve', function(userdata){
        if(player_connecting.sid == userdata.sid){

            callback = function (){};
            $('.afPopup').trigger("close");
            players_connected++;
            player_connecting = {tag: '', sid: ''};
            
            socket.emit('to some one', {channel: 'connection finished', did: userdata.sid, msg: players_connected});

            $('.playlist #' + userdata.sid.replace(/[^a-zA-Z]+/g,"")).remove();

            players.tag[players_connected - 1] = userdata.tag;
            players.sid[players_connected - 1] = userdata.sid;
            players.drawn[players_connected - 1] = 0;
            players.played[players_connected - 1] = 0;
            players.cards[players_connected - 1] = [];
            players.place[players_connected - 1] = userdata.sid.replace(/[^a-zA-Z\.]+/g,"");

            if(players_connected == gametype.players[pdata.bid]){

                socket.emit('leave room', gametype.room[pdata.bid]);

                socket.emit('all in room', {channel: 'someone left', room: gametype.room[pdata.bid], msg: pdata.sid});
                
                $.ui.loadContent("gameb", null, null, "down");
				$('.list.chatm li').html('');
                if(init_Deck()){
                    start_game_now();
                }
            }else{
                callback = conectionTimer4;
                $.ui.popup({
                    title:"Play request accepted",
                    message:'Please connect to ' + (gametype.players[pdata.bid] - players_connected) + ' more player(s) to start game.',
                    cancelText:"OK",                    
                    cancelOnly:true
                });
            }
        }
    });

    function send_sock_msg(c, d){
        socket.emit(c, d);
    }
    s_sock_msg = send_sock_msg;

/* recieve request and approve*/
    socket.on('receive play request', function(userdata){
        if(player_connecting.sid == '' && players_connected == 1) {
            socket.emit('leave room', gametype.room[pdata.bid]);

            player_connecting.sid = userdata.sid;
            player_connecting.tag = userdata.tag;
            tcnt = 0;
            callback = conectionTimer2;

            $.ui.popup({
                title:"Approve gameplay Request",
                message:'Approve play requset from ' + userdata.tag,
                cancelText:"No",
                cancelCallback: function(){
                    callback = function (){};
                    player_connecting = {tag: '', sid: ''};
                    socket.emit('join room', gametype.room[pdata.bid]);
                },
                doneText:"Yes",
                doneCallback: function(){
                    tcnt = 0;
                    callback = conectionTimer3;
                    socket.emit('to some one', {channel: 'receive play approve', did: player_connecting.sid, msg:{ tag: pdata.tag, sid: pdata.sid}});
                },
                cancelOnly:false
            });
        }
    });

    socket.on('connection finished', function(pconn){   
        tcnt = 0;
        callback = conectionTimer4;
        iam = pconn - 1;        
        players_connected = pconn;

        players.sid[0] = player_connecting.sid;
        players.tag[0] = player_connecting.tag;
        $('.playlist #' + player_connecting.sid.replace(/[^a-zA-Z]+/g,"")).remove();
        player_connecting = {tag: '', sid: ''};
    });

    socket.on('Start gameplay', function(boardvar){
        callback = function (){};       
        socket.emit('all in room', {channel: 'someone left', room: gametype.room[pdata.bid], msg: pdata.sid});

        players = boardvar.p;
        deck = boardvar.d;
        pstates = {turn: 0, leadingcard: '', leadingpl: '0', firstpl: 0};

        $.ui.loadContent("gameb", 'page1', null, "up");
		$('.list.chatm li').html('');

        start_game_now();
    });

/* Socket init */
    socket.on('user id', function(sid){
        pdata.sid = sid;
        socket.emit('get room stats', gametype.room);
    });
     socket.on('set room stats', function(room_s){
        for (var i = room_s.length - 1; i >= 0; i--) {
            $("#home #" + room_s[i].room + ' .oncn').html(room_s[i].num + ' players online')
        };
    });
    socket.on('user list', function(userdata){
        $('.status_pl').html('Please Select a player to play with');
        $('#page2 .playlist').append('<li id="' + userdata.sid.replace(/[^a-zA-Z]+/g,"") + '"><a onclick="send_pr(\'' + userdata.sid + '\')" class="icon user ' + userdata.sid.replace(/[^a-zA-Z]+/g,"") + '" style="text-align:center" title="Click to send play request">' + userdata.tag + '</a></li>');         
        if(userdata.rep == 1 && pdata.sid != '')
            socket.emit('to some one', {channel: 'user list', did: userdata.sid, msg:{ tag: pdata.tag, sid: pdata.sid, rep: 0}});
    });

    socket.on('someone left', function(sid){
        $('.playlist #' + sid.replace(/[^a-zA-Z]+/g,"")).remove();

        for(var i = 0; i < players.sid.length; i++){

            if(sid == players.sid[i]){
                $.ui.popup( {
                    title:":( Oops",
                    message:'Seems your playmate, ' + players.tag[i] + ' just went left you',
                    cancelText:"Ok",
                    cancelOnly:true
                });
                reset_game_environment();
            }
        }
    });
    socket.on('disconnect', function(){
    	 $.ui.popup( {
            title:":( Oops",
            message:'Seems you lost internet conection. Please check you connection and reload app.',
            cancelText:"Ok",
            cancelOnly:true
        });
        $.ui.loadContent("home", null, null, "fade");
    });

    socket.on('play move', function(gamedata){
        acceptMove(gamedata);        
    });

/* Timers */    
    var conectionTimer1 = function(){
        $('.afPopup #cancel').html("Cancel (" + (15 - tcnt)+ ")")
        if(tcnt == 15){
            callback = function (){};
            player_connecting = {tag: '', sid: ''};
            socket.emit('join room', gametype.room[pdata.bid]);
            $('.afPopup').trigger("close");
        }
        tcnt++;
    }
    var conectionTimer2 = function(){
        $('.afPopup #cancel').html("Cancel (" + (10 - tcnt)+ ")");
        if(tcnt == 10){
            callback = function (){};
            player_connecting = {tag: '', sid: ''};
            $('.afPopup').trigger("close");
        }
        tcnt++;
    }
    var conectionTimer3 = function(){
        if(tcnt == 5){
            callback = function (){};
            $.ui.popup({
                title:":( Oops",
                message:'Seems ' + player_connecting.tag + ' canceled play request before response.',
                cancelText:"Ok",
                cancelCallback: function(){
                    callback = function (){};
                    player_connecting = {tag: '', sid: ''};
                },
                cancelOnly:true
            });
            player_connecting = {tag: '', sid: ''};
        }
        tcnt++;
    }

    var conectionTimer4 = function(){
        $.ui.setTitle(((10  * gametype.players[pdata.bid]) - tcnt)+ "s left to fill board");
        if(tcnt == 10 * gametype.players[pdata.bid]){
            callback = function (){};
            $.ui.popup({
                title:":( Oops",
                message: 'Seems ' + players.tag[0] +' did not fill up the gameboard in time.',
                cancelText:"Ok",
                cancelCallback: function(){
                    callback = function (){};
                    player_connecting = {tag: '', sid: ''};
                },
                cancelOnly:true
            });
            send_resets();
            reset_game_environment();

        }
        tcnt++;
    }    

/* reset functions*/    
    function send_resets()  {
        for(var i = 0; i < players.sid.length; i++){
            if(players.sid[i] != pdata.sid){
                socket.emit('to some one', {channel: 'someone left', did: players.sid[i], msg: pdata.sid});
            }                                   
        }
    }
    srests = send_resets;    
    function reset_game_environment(){  
        $('.playlist').html('');

        players = {tag: [], sid: [], place: [], cards: [[] , []], drawn: [0, 0], played: [0, 0]};
        callback = function (){};
        iam = 0;

        players_connected = 1;
        player_connecting = {tag: '', sid: ''};
        pstates = {turn: 0, leadingcard: '', leadingpl: '0', firstpl: 0};               

        players.tag[0] = pdata.tag;
        players.sid[0] = pdata.sid;
        players.drawn[0] = 0;
        players.played[0] = 0;
        players.cards[0] = [];
        socket.emit('join room', gametype.room[pdata.bid]);

        socket.emit('all in room', {channel: 'user list', room: gametype.room[pdata.bid], msg:{ tag: pdata.tag, sid: pdata.sid, rep: 1}});
                
        $.ui.loadContent("page2", null, null, "down");

    }
    resetEnv = reset_game_environment;

    function set_gameboard_head(arg){
        $('#header_text').html(arg);
    }
    set_heading = set_gameboard_head;

/* Chat messanging*/
    function send_chat_message(e, t){
        var txt = $(t).val().trim().replace(/[^a-zA-Z0-9 ^@]/g,"");
        if(e.keyCode == 13 && txt != ''){
            for(var i = players.sid.length - 1 ; i >= 0 ; i--){
                if(players.sid[i] != pdata.sid){
                    socket.emit('to some one', {channel: 'gaming chat', did: players.sid[i], msg: {s: iam, t: txt}});
                }
            };
            $('.list.chatm li').append('<p><span>You said,</span></p><p class="mtext">' +  txt + '</p><br><br>');
            $(t).val('');
            document.getElementById('li_scroll_id').scrollTop = document.getElementById('li_scroll_id').scrollHeight;
        }
    }
    send_chat_m  = send_chat_message;

    socket.on('gaming chat', function(data){
        $('.list.chatm li').append('<p><span>' + players.tag[data.s]+ ' says,</span></p><p class="mtext">' + data.t + '</p><br><br>');

        document.getElementById('li_scroll_id').scrollTop = document.getElementById('li_scroll_id').scrollHeight;

        $.ui.updateBadge("#gameb","<i class='get_attention' onclick='$.ui.toggleRightSideMenu(); $.ui.removeBadge(\"#gameb\");set_s_w_h();'>New message from " + players.tag[data.s] + "</i>","tr","#FFF");

        //setTimeout(function(){$.ui.removeBadge("#gameb");}, 9000);
    });
    function set_chat_win_height(){
        $('aside ul.list.chatm').css('height', (window.innerHeight - 60) + 'px');
        document.getElementById('li_scroll_id').scrollTop = document.getElementById('li_scroll_id').scrollHeight;
    }
    set_s_w_h = set_chat_win_height;

/* Game win celebrations */
    function win_celebrate(winner){
         if(winner == iam){
            $.ui.loadContent("fun", null, null, "slide");
        }else{
            $.ui.popup({
                title:"Oooooh ): Game Over",
                message: '<center><h2>' + players.tag[winner] + ' wins the game</h1></center>',
                cancelText: 'Ok',                
                cancelOnly:true
            });
        }
    }
    win_celeb = win_celebrate;
});
