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

	var num = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
	var sy = ['♠', '♣', '♦', '♥'];
	var sycl = ['spades', 'clubs', 'diams', 'hearts'];
	var rtimer = '';
 
/* game build and initalisation */
	function game_init(){
		buildDeck();
        shuffleDeck();
        serveCds();        

        for(var i = 0; i < players.sid.length; i++){							
			if(i != iam)
				s_sock_msg('to some one', {channel: 'Start gameplay', did: players.sid[i], msg: {p: players, d: deck}});
		}
		return true;
	}        	

	function buildDeck(){
	    deck = [];
	    for(a = 0; a < 4; a++){
	      for(b = 0; b < 13; b++){
	        deck[deck.length] = {s: a, r: b};
	      }           
	    }
	}
	init_Deck = game_init;

	function shuffleDeck(){
		    var tmpv = "";
		    var tmpi = "";
		    for(i = 51; i >= 0 ; i--){
		      tmpi = parseInt(Math.random() * deck.length);
		      tmpv = deck[tmpi];
		      deck[tmpi] = deck[i];
		      deck[i] = tmpv;
		    }
	}
	function serveCd(){
		    var a = 0;
		    while(deck[a] == "")
		      a++;
		    return a;
	}
	function serveCds(){
	    for(p = 0; p < players.cards.length; p++){
		    for (i = 0; i < 8; i++) {
		        a = serveCd();
		        players.cards[p][players.cards[p].length] = deck[a];
		        players.drawn[p]++;
		        deck[a] = "";
		    };
		}
	}
	function dspDeck(){
		$('.gbd').html('<div class="gcards"></div>');
        $('.gbd .gcards').append('<div class="myhand list inset playingCards fourColours faceImages rotateHand material-button color3 hover"><ul class="hand"></ul></div>');
        $('.gbd .gcards').append('<div class="stats list inset playingCards faceImages fourColours material-button color2 hover"><div class="card"><span class="rank"></span><span class="suit"></span></div><p>leading card on board played by <span id="nm" class="fg-green">no one<span></p><p id="note"></p></div>');
        $('.gbd .gcards').append('<div class="played list inset playingCards faceImages fourColours material-button color1 hover"><ul class="deck"></ul></div>');


		for (i = 0; i < players.cards[iam].length; i++) {			
			$('.gbd .gcards .myhand ul.hand').append('<li onclick="playC(\'' + i + '\', \'' + iam + '\', this)"><div class="card rank-' + num[players.cards[iam][i].r] + ' ' + sycl[players.cards[iam][i].s] + '"><span class="rank">' + num[players.cards[iam][i].r] + '</span><span class="suit">&' + sycl[players.cards[iam][i].s] + ';</span></div></li>');
		};
		set_placemet('.gbd .gcards .myhand');
		set_heading(players.tag[pstates.turn] + '\'s turn');
		if(iam == pstates.turn)
            set_heading('Your turn');

	}
	start_game_now = dspDeck;

	function set_placemet(arg){
		var elm = $(arg + ' ul.hand li');
		var sqn = elm.length;
		var wid = $(arg).width();

		for (var i = 0; i < sqn; i++) {
			v = get_card_lt(i, wid);		
			$(elm[i]).css('cssText', 'margin-left:' + v.l + 'px !important; margin-top: ' + v.t + 'px!important;');
		};

		$(arg).height(v.h + 'px');
	}

	function get_card_lt(n, w){
		var l = 25, t = 40, h = 270;
		l = 25 + (100 * Math.trunc(n / 13));

		if(w < 612){
			t = 30 + (220 * Math.trunc(n / 13));
			if(Math.trunc(n / 13) != 0)
				l = (25 - (100 * (Math.trunc(n / 13) * 2))) + (Math.trunc(n / 13) * 10);
			h = 60 + (415 * Math.trunc(n / 13)) - (4.5 *  Math.pow(Math.trunc(n / 13), 4));
		}else if(w < 883){
			t = 30 + (220 * Math.trunc(Math.trunc(n / 26)));
			if(Math.trunc(n / 26) != 0){
				l = (25 - (200 * (Math.trunc(n / 26) * 2))) + (Math.trunc(n / 26) * 10);
			}
			if(Math.trunc(n / 39) != 0){
				l = (25 - (134* (Math.trunc(n / 26) * 2)));	
			}
			h = 60 + (415 * Math.trunc(n / 26))
		}else if(w < 1135){
			t = 30 + (220 * Math.trunc(n / 39));
			if(Math.trunc(n / 39) != 0)
				l = (25 - (290 * (Math.trunc(n / 39) * 2))) + (Math.trunc(n / 39) * 10);
			h = 60 + (415 * Math.trunc(n / 39));
		}
		return {l , t , h};
	}

	$(window).resize(function(){
        if($('.gbd .gcards').html() != undefined){
        	if(rtimer != '')
				clearTimeout(rtimer);

			rtimer = setTimeout(function(){set_placemet('.gbd .gcards .myhand');}, 2000);            
        }
    });
	
	function accept_move(gdata){
		play_card(gdata.arg, gdata.dk, null);
    }
    acceptMove = accept_move;


/* Game play mechanics */	
	function play_card(arg, dk, card){
		if(dk == pstates.turn && ((pstates.leadingcard == "" || pstates.leadingcard.s == players.cards[dk][arg].s) || pstates.leadingpl == pstates.turn))  {
			if(dk == iam){
				for(var i = 0; i < players.sid.length;i++)
				{
					if(i != iam)
        				s_sock_msg('to some one' , {channel: 'play move', did: players.sid[i], msg: {arg: arg, dk: dk}});
				}
				$(card).remove();
				set_placemet('.gbd .gcards .myhand');
			}
			send_note('');

			players.played[pstates.turn]++;

	  		if(pstates.leadingcard == ""){
	  			 pstates.leadingcard = players.cards[dk][arg];
	  		}

			$('.gbd .gcards .played ul.deck').append('<li><div class="card rank-' + num[players.cards[dk][arg].r] + ' ' + sycl[players.cards[dk][arg].s] + '"><span class="rank">' + num[players.cards[dk][arg].r] + '</span><span class="suit">&' + sycl[players.cards[dk][arg].s] + ';</span></div></li>');				

			nextPlayer();

			if(parseInt(pstates.leadingcard.r) < parseInt(players.cards[dk][arg].r)) {
				pstates.leadingpl = dk;
				pstates.leadingcard = players.cards[dk][arg];				
			}

			check_full_round();
			
			if(pstates.leadingpl == dk)
				pstates.leadingcard = players.cards[dk][arg];

			set_heading(players.tag[pstates.turn] + '\'s turn');
			if(iam == pstates.turn)
            	set_heading('Your turn');

			$('.gbd .gcards .stats #nm').html(players.tag[pstates.leadingpl]);
			if(pstates.leadingpl == iam)
				$('.gbd .gcards .stats #nm').html('<i>you<i>');
			$('.gbd .gcards .stats div').removeAttr('class');
			$('.gbd .gcards .stats div').addClass('card rank-' + num[pstates.leadingcard.r] + ' ' + sycl[pstates.leadingcard.s]);
			$('.gbd .gcards .stats .rank').html(num[pstates.leadingcard.r]);
			$('.gbd .gcards .stats .suit').html(sy[pstates.leadingcard.s]);


			players.cards[dk][arg] = "";
			
			keeping_em_honest();
			check_win(0);
		}else if(pstates.leadingcard.s != players.cards[dk][arg].s && dk == pstates.turn){
			send_note('<p><i class="fg-red">Oops, You have to match the card type leading the board</i><p>');
		}else if(dk != pstates.turn){
			send_note('<p><i class="fg-red">It is not your turn. It is <span class="fg-green">' + players.tag[pstates.turn] + '</span>\'s turn </i><p>');
		}
	}
	playC = play_card;

	function nextPlayer(){
        pstates.turn++;
        if(pstates.turn >= players.tag.length)
            pstates.turn = 0;
    }    
    function check_full_round(){
    	if(pstates.firstpl == pstates.turn){
			pstates.turn = pstates.leadingpl;
			pstates.firstpl = pstates.leadingpl;
		}
    }

    function go_fish_card(){
		
			a = serveCd();
			players.cards[pstates.turn][players.cards[pstates.turn].length] = deck[a];
			if(pstates.turn == iam){
				$('.gbd .gcards .myhand ul.hand').append('<li onclick="playC(\'' + (players.cards[pstates.turn].length - 1) + '\', \'' + iam + '\', this)"><div class="card rank-' + num[deck[a].r] + ' ' + sycl[deck[a].s] + '"><span class="rank">' + num[deck[a].r] + '</span><span class="suit">&' + sycl[deck[a].s] + ';</span></div></li>');
				set_placemet('.gbd .gcards .myhand');
			}
			deck[a] = "";
			players.drawn[pstates.turn]++;
			keeping_em_honest();
		
	}
	gfish = go_fish_card;

	function keeping_em_honest(){
		if(pstates.leadingpl != pstates.turn){
			for(i = 0; i < players.cards[pstates.turn].length; i ++){
				if(pstates.leadingcard.s == players.cards[pstates.turn][i].s){
					return false;
				}
			}
			var sum = 0;
			for(var i = 0; i < players.sid.length;i++)
			{
				sum += players.drawn[i];
			}

			if(sum < 52){
				go_fish_card();
			}else{
				if(pdata.bid > 5 && pdata.bid < 11){
					check_win(1);					
				}else{					
                    send_note($('.gbd .gcards .stats #note').html() + '<br>Skipping <i class="fg-green">' + players.tag[pstates.turn] + '</i>. Does not have a matching card');

					nextPlayer();
					check_full_round();
					set_heading(players.tag[pstates.turn] + '\'s turn');
					if(iam == pstates.turn)
            			set_heading('Your turn');
            		keeping_em_honest();                    
				}
			}
		}else{
			if(pstates.leadingpl == iam)
				send_note('<p class="fg-green">You are leading the table. Set a new leading card.</p>');
			$('.gbd .gcards .stats div').removeAttr('class');
			$('.gbd .gcards .stats .rank').html('');
			$('.gbd .gcards .stats .suit').html('');
		}
	}

	function send_note(arg){
		$('.gbd .gcards .stats #note').html(arg);
	}

    function check_win(arg) {
        switch (arg) {
        	case 0:
	            for(var i = 0; i < players.drawn.length; i++){
                    if(players.drawn[i] == players.played[i]){
                    	win_celeb(i);
                    }
                };
                break;
            case 1:
                var winner = '';
                var winnern = 52;
                for(var i = 0; i < players.drawn.length; i++){
                    if((players.drawn[i] - players.played[i]) < winnern){
                        winnern = (players.drawn[i] - players.played[i]);
                        winner = i;
                    }
                }
                win_celeb(winner);
                break;
            default:
                alert('IF YOU ARE SEEING THIS\n YOU ARE DOING SOMTHING YOU SHOULDING BE DOING. THIS IS JUST A GAME');
                break;
        }
    }

    function reset_game_board(){
    	$.ui.loadContent("gameb", null, null, "down");
        pstates = {turn: 0, leadingcard: '', leadingpl: '0', firstpl: 0};

        for(var i =0;i < players.sid.length;i++){
            players.drawn[i] = 0;
            players.played[i] = 0;
            players.cards[i] = [];
        }
        game_init();
        start_game_now();
    }
    resetGame = reset_game_board;
});
