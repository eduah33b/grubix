$(document).ready(function(){
    function get_css() {
        //Create a 'script' element    
          var csstyle = document.createElement("link");

          // Set it's 'type' attribute  
          csstyle.setAttribute("type", "text/css");

          csstyle.setAttribute("class", "game_style");

          // Set it's 'language' attribute
          csstyle.setAttribute("rel", "stylesheet");

          // Set it's 'src' attribute
          csstyle.setAttribute("href", "g_modules/" + gametype.srp[pdata.bid] + "/index.css");

          // Now add this new element to the head tag
          $('head').append(csstyle);
    }
    get_css();

	function game_init(){
		if(iam == 0)
			s_sock_msg('to some one', {channel: 'Start gameplay', did: players.sid[1], msg: {p: players, d: deck}});
		build_k_Board();
	}
    start_game_now =  game_init;

	function build_k_Board(){
		$('.gbd').html('<div class="kfran"></div>');
        var lev = ['t', 'c', 'b'];
        var sid = ['l', 'm', 'r'];
        var id = 0;

        for (var i = 0; i <= 2; i++) {
            for(var a = 0; a <= 2; a++){
                $('.kfran').append('<div class="kpt ' + lev[i] + ' ' + sid[a] + '" id="' + id + '" onclick="pass(this, \'' + iam + '\')"></div>');
                id++;
            }
        }
        $('.kfran').append('<div class="ln h ht"></div><div class="ln h hc"></div><div class="ln h hb"></div><div class="ln v vl"></div><div class="ln v vm"></div><div class="ln v vr"></div><div class="ln v vm bd"></div><div class="ln v vm fd"></div>');
        reset_diagonal();
        set_heading(players.tag[pstates.turn] + '\'s turn');
        if(iam == pstates.turn)
            set_heading('Your turn');
    }
    function init_k_Deck(){
        deck = ['', '', '', '', '', '', '', '', ''];
        players.place[0] = 'bg-crimson';
        players.place[1] = 'bg-yellow';

        return true;
    }
    init_Deck = init_k_Deck;

    function reset_diagonal(){
        var op = $('.v.vl').height();
        var adj = $('.h.ht').width();
        var hyp = Math.sqrt(Math.pow(op, 2) + Math.pow(adj, 2));
        var angl = 90 - (Math.atan(op/adj) * 180/Math.PI);
        var newtop = ((($('.kfran').height() - hyp) * 100) / $('.kfran').height()) / 2;

        $('.bd').css('top', newtop + '%');
        $('.bd').css('bottom', newtop + '%');
        $('.fd').css('top', newtop + '%');
        $('.fd').css('bottom', newtop + '%');

        $('.bd').css({'transform': 'rotate(-' + angl+ 'deg)', '-moz-transform': 'rotate(-' + angl+ 'deg)', '-webkit-transform': 'rotate(-' + angl+ 'deg)', '-o-transform': 'rotate(-' + angl+ 'deg)'});
        
        $('.fd').css({'transform': 'rotate(' + angl+ 'deg)', '-moz-transform': 'rotate(' + angl+ 'deg)', '-webkit-transform': 'rotate(' + angl+ 'deg)', '-o-transform': 'rotate(' + angl+ 'deg)'});
    }



    function nextPlayer(){
        pstates.turn++;
        if(pstates.turn >= players.tag.length)
            pstates.turn = 0;
    }
    
    
    function allow_move(oplc, plc){
        if ((plc == 2 && oplc == 3) || (plc == 3 && oplc == 2) || (plc == 5 && oplc == 6) || (plc == 6 && oplc == 5))
         {
             return false;
         }
         if ((plc + 1) == (oplc - 2) || (plc + 1) == (oplc + 4) || (plc + 1) == (oplc + 2) || (plc + 1) == oplc || plc == 4 || oplc == 4)
         {
            return true;
        }
        return false;
    }
    function placePiece(pt, pl) {
        if(pstates.turn == pl){
            if(deck[parseInt(pt.id)] === ''){
                if(players.drawn[pstates.turn] < 3){
                    deck[parseInt(pt.id)] = pstates.turn;

                    players.drawn[pstates.turn]++;

                    $(pt).addClass(players.place[pstates.turn]);

    				
                    if(check_pk_win()){
                         win_celeb(pstates.turn);
                    }
                    nextPlayer();
                    for(var i = 0; i < players.sid.length; i++){
                        if(iam != i && pl == iam)
                            s_sock_msg('to some one' , {channel: 'play move', did: players.sid[i], msg: {arg: pt.id, dk: pl}});
                    }
                    set_heading(players.tag[pstates.turn] + '\'s turn');
                    if(iam == pstates.turn)
                        set_heading('Your turn');
                }else{
                    if(pstates.leadingpl === pstates.turn && pstates.leadingcard != ''){
                        if(allow_move(parseInt(pstates.leadingcard.id), parseInt(pt.id))){
                            $(pstates.leadingcard).removeClass('bg-gray');
                            deck[parseInt(pstates.leadingcard.id)] = '';

                            deck[parseInt(pt.id)] = pstates.turn;
                            $(pt).addClass(players.place[pstates.turn]);

                            if(check_pk_win()){
                                 win_celeb(pstates.turn);
                            }                                                    
                            nextPlayer();
                            for(var i = 0; i < players.sid.length; i++){
                                if(iam != i && pl == iam)
                                    s_sock_msg('to some one' , {channel: 'play move', did: players.sid[i], msg: {arg: pt.id, dk: pl}});
                            }
                            set_heading(players.tag[pstates.turn] + '\'s turn');
                            if(iam == pstates.turn)
                                set_heading('Your turn');
                        }

                    }
                }
            }else{
                if(deck[parseInt(pt.id)] === pstates.turn && players.drawn[pstates.turn] == 3){
                    if(pstates.leadingpl == pstates.turn)
                        $('.bg-gray').removeClass('bg-gray').addClass(players.place[pstates.turn]);
                    $(pt).removeClass(players.place[pstates.turn]).addClass('bg-gray');
                    pstates.leadingpl = pstates.turn;
                    pstates.leadingcard = pt;
                    for(var i = 0; i < players.sid.length; i++){
                        if(iam != i && pl == iam)
                            s_sock_msg('to some one' , {channel: 'play move', did: players.sid[i], msg: {arg: pt.id, dk: pl}});
                    }
                }
            }

        }
    }
    pass = placePiece;

    function accept_move(gdata){
    	placePiece(document.getElementById(gdata.arg), gdata.dk);
    }
    acceptMove = accept_move;

    function check_pk_win(){
        if (deck[0] === pstates.turn && deck[1] === pstates.turn && deck[2] === pstates.turn)
        {
            return true;
        }
        
        if (deck[3] === pstates.turn && deck[4] === pstates.turn && deck[5] === pstates.turn)
        {
            return true;
        }
        
        if (deck[6] === pstates.turn && deck[7] === pstates.turn && deck[8] === pstates.turn)
        {
            return true;
        }
        
        if (deck[0] === pstates.turn && deck[4] === pstates.turn && deck[8] === pstates.turn)
        {
            return true;
        }
        
        if (deck[0] === pstates.turn && deck[3] === pstates.turn && deck[6] === pstates.turn)
        {
            return true;
        }
        
        if (deck[1] === pstates.turn && deck[4] === pstates.turn && deck[7] === pstates.turn)
        {
            return true;
        }
        
        if (deck[2] === pstates.turn && deck[5] === pstates.turn && deck[8] === pstates.turn)
        {
            return true;
        }
        
        if (deck[2] === pstates.turn && deck[4] === pstates.turn && deck[6] === pstates.turn)
        {
            return true;
        }
        
        return false;
    }

    function reset_game_board(){
        $.ui.loadContent("gameb", null, null, "down");
        pstates = {turn: 0, leadingcard: '', leadingpl: '0', firstpl: 0};

        for(var i =0;i < players.sid.length;i++){
            players.drawn[i] = 0;
            players.played[i] = 0;
            players.cards[i] = [];
        }
        init_k_Deck();
        start_game_now();
        for(var i = 0; i < players.sid.length; i++){
            if(i != iam)
                s_sock_msg('to some one', {channel: 'Start gameplay', did: players.sid[i], msg: {p: players, d: deck}});
        }
    }
    resetGame = reset_game_board;

    $(window).resize(function(){
        if($('.kfran').html() != undefined)
            reset_diagonal();
    });
});
