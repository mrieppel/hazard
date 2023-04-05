/* 
Hazard: a javascript implementation of the dice game

Copyright (C) 2023  Michael Rieppel <mrieppel at gmail dot com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var GAME1 = new Game;
var GAME2 = new Game;

function taketurn(r,n) { // r is a pair with the values of the two dice, n is 1 for GAME1 and 2 for GAME2
	var game = n== 1 ? GAME1 : GAME2;
	game.rolls.push(r);
	var value = game.rolls[game.rolls.length-1].reduce((a,c) => a+c,0);
	
	if(game.main==0) {
		if([5,6,7,8,9].indexOf(value)>=0) {
			game.main = value;
			document.getElementById('rollmessage'+n.toString()).innerHTML = "You rolled "+value+". This is now your Main point.";
			document.getElementById('mainpoint'+n.toString()).innerHTML += game.main.toString();
			return;
		} else {
			document.getElementById('rollmessage'+n.toString()).innerHTML = "You rolled "+value+". Roll again!";
			return;
		}
	}
	
	if(game.main!=0 && game.chance==0) {
		var wl = findwinlose(game.main);
		var win = wl[0];
		var loses = wl[1];
		
		if(win.indexOf(value)>=0) {
			changecolor("win",n);
			document.getElementById('rollmessage'+n.toString()).innerHTML = "You rolled "+value+". You win! Start a new game...<br><br>";
			newgame(n);
			return;
		}
		if(loses.indexOf(value)>=0){
			changecolor("lose",n);
			document.getElementById('rollmessage'+n.toString()).innerHTML = "You rolled "+value+". You lose! Start a new game...<br><br>";
			newgame(n);
			return;
		} else {
			game.chance = value;
			document.getElementById('rollmessage'+n.toString()).innerHTML = "You rolled "+value+". This is now your Chance point.";
			document.getElementById('chancepoint'+n.toString()).innerHTML += game.chance.toString();
			return;
		}
	}
	
	if(game.chance!=0) {
		if(value==game.main) {
			changecolor("lose",n);
			document.getElementById('rollmessage'+n.toString()).innerHTML = "You rolled "+value+". This is your Main point, so you lose! Start a new game...";
			newgame(n);
			return;
		}
		if(value==game.chance){
			changecolor("win",n);
			document.getElementById('rollmessage'+n.toString()).innerHTML = "You rolled "+value+". This is your Chance point, so you win! Start a new game...";
			newgame(n);
			return;
		} else {
			document.getElementById('rollmessage'+n.toString()).innerHTML = "You rolled "+value+". Roll again...<br>";
			return;
		
		}
	}
}

function findwinlose(main) {
	switch(main) {
		case 5 : return [[5],[2,3,11,12]];
		case 6 : return [[6,12],[2,3,11]];
		case 7 : return [[7,11],[2,3,12]];
		case 8 : return [[8,12],[2,3,11]];
		case 9 : return [[9],[2,3,11,12]];
		default : return [];
	}
}

function Game() {
	this.rolls = [];
	this.main = 0;
	this.chance = 0;
	this.rolling = false;
}

function newgame(n) {
	if(n==1) { 
		GAME1 = new Game();	
	} else {
		GAME2 = new Game();
		document.getElementById('pickmain').style.display = "inline";	
	}
}

function clearmessages(n) {
	document.getElementById('rollmessage'+n.toString()).innerHTML = "";
	document.getElementById('mainpoint'+n.toString()).innerHTML = "Main: ";
	document.getElementById('chancepoint'+n.toString()).innerHTML = "Chance: ";
}

function changecolor(s,n) { // s is for the window state (win, lose, blue) n is 1 for GAME1 and 2 for GAME2
	var el = document.getElementById("gamecontainer"+n.toString());
	if(s=="win"){ // show green
		el.style.border = 'solid 1px #87D51C';
		el.style.backgroundColor = '#E3FFB8';
	} else if (s=="lose") { // show red
		el.style.border = 'solid 1px #FF0000';
		el.style.backgroundColor = '#FF9999';
	} else if (s=="blue") {
		el.style.border = 'thin lightsteelblue solid';
		el.style.backgroundColor = 'aliceblue';
	}
}


// DICE SVG CODE BELOW

function rolldice(n) { // n is 1 for GAME1 and 2 for GAME2
	var game = n==1 ? GAME1 : GAME2;
	if(game.rolling) {return null;} // prevents user from rolling dice while previous roll still going via timeout
	
	
	if(game.rolls.length==0) { // first roll of a game; reset messages, gamecontainer color, and set selected Main if in GAME2
		clearmessages(n);
		changecolor("blue",n);
		if(n==2) {
			game.main = parseInt(document.getElementById('mainselect').value);
			document.getElementById('mainpoint'+n.toString()).innerHTML += game.main.toString();
			document.getElementById('pickmain').style.display = "none";
		}
	}
		
	var dsuf = n==1 ? 1 : 3;
	var die1 = "die"+dsuf.toString();
	var die2 = "die"+((dsuf+1).toString());
	var d1vals = roll(18);
	var d2vals = roll(18);
	
	for (var i=0; i<18; i++) {
		setTimeout(rotDie, i*50, i,die1,die2,d1vals,d2vals,n);
	}
	
	function rotDie(x,d1,d2,d1v,d2v,g) {
		var svg2 = document.getElementById(d1);
		var degree = ((x*20)+20)%360;
		showpips(d1v[x],d1);
		svg2.setAttribute('transform','rotate('+degree+',45,45)');
		
		var svg = document.getElementById(d2);
		var degree = ((x*20)+20)%360;
		showpips(d2v[x],d2);
		svg.setAttribute('transform','rotate('+degree+',125,45)');
		
		game.rolling =  x==17 ? false : true; 
		if(x==17) {taketurn([d1v[d1v.length-1],d2v[d2v.length-1]],g);} // dice rotation is complete, take turn with the two dice values
	}
}

function roll(n) {
	var out = [];
	for(var i=0;i<n;i++) {
		out.push(Math.floor(Math.random() * 6)+1);
	}
	return out;
}
	
function showpips(n,d) {
	var pre = d=="die1" ? "q" : (d=="die2" ? "p" : (d=="die3" ? "r" : "s"));
	switch (n) {
		case 1: return setpips([5]);
		case 2: return setpips([3,7]);
		case 3: return setpips([1,5,9]);
		case 4: return setpips([1,3,7,9]);
		case 5: return setpips([1,3,5,7,9]);
		case 6: return setpips([1,2,3,7,8,9]);	
		default: return setpips([]);
	}
		
	function setpips(a) {
		var mkblk = a;
		var mkwht = [1,2,3,4,5,6,7,8,9].filter(e => a.indexOf(e)<0);
		mkblk.map(e => document.getElementById(pre+e.toString()).style.fill = "black");
		mkblk.map(e => document.getElementById(pre+e.toString()).style.stroke = "black");
		mkwht.map(e => document.getElementById(pre+e.toString()).style.fill = "white");
		mkwht.map(e => document.getElementById(pre+e.toString()).style.stroke = "white");
	}
}