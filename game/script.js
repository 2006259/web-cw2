var game = {}
game.targetRing = [0,1,0,0,0,1,0,0,1,0,1,0]
game.rings = []
game.rings[0] = [1,0,0,1,0,0,2,0,0,0,0,0] //cercle interne
game.rings[1] = [0,0,0,1,0,1,0,0,0,0,0,0]
game.rings[2] = [1,0,0,2,0,2,0,0,1,0,0,0] //cercle externe

let nbPoints = game.targetRing.length	

function cycleRingRight(ring){
	lastCase = ring[ring.length-1]
	for(let i=ring.length-1;i>=0;i--){
		ring[i] = ring[i-1]
	}
	ring[0] = lastCase
}

function cycleRingLeft(ring){
	firstCase = ring[0]
	for(let i=0;i<ring.length-1;i++){
		ring[i] = ring[i+1]
	}
	ring[ring.length-1] = firstCase
}

function opposite(i){
	i+=game.targetRing.length/2
	i%=game.targetRing.length
	return i
}

function targetIsHit(t){
	let hit = false
	for(let i=2;i>=0;i--){		
		if(game.rings[i][t]){
			return false
		}
		if(game.rings[i][opposite(t)]==1){
			for(let j=i;j>=0;j--){
				if(game.rings[j][opposite(t)]){
					hit = false
				} else {
					hit = true
				}
			}
		}
	}	
	return hit
}

function rotateRing(r, cc){
	if(cc){
		cycleRingLeft(game.rings[r-1])
	} else {
		cycleRingRight(game.rings[r-1])
	}
	drawGame()
}

function laserHitsTarget(l, r){
	for(let k=r-1;k>=0;k--){
		if(game.rings[k][l]){
			return false
		}
	}
	for(let k=0;k<3;k++){
		if(game.rings[k][opposite(l)]){
			return false
		}
	}
	if(!game.targetRing[opposite(l)]){
		return false
	}
	return true
}

function isWin(){
	for(let i=0;i<nbPoints;i++){
		if(game.targetRing[i]){
			if(!targetIsHit(i)){
				return false
			}
		}
	}
	return true
}

function drawGame(){
	
	let rayon = 300	
	
	let centerX = rayon
	let centerY = rayon
	let string = "<svg height=\""+rayon*2+"\" width=\""+rayon*2+"\">"
	let rayon2
	let theta = (Math.PI*2)/nbPoints
	let angle = 0;
	let hitItem
	
	//dessin outer ring
	
	string+="<circle cx=\""+rayon+"\" cy=\""+rayon+"\" r=\""+rayon+"\" stroke=\"black\" stroke-width=\"3\" fill-opacity=\"0\"/>"
	
	for(let i=0;i<nbPoints;i++){
		
		//set couleur de la cible
		
		if(game.targetRing[i]){
			if(targetIsHit(i)){
				string+="<g stroke=\"green\" stroke-width=\"3\" fill=\"green\">"
			} else {
				string+="<g stroke=\"red\" stroke-width=\"3\" fill=\"red\">"
			}
		} else {
			string+="<g stroke=\"gray\" stroke-width=\"3\" fill=\"gray\">"
		}	
		
		//tracer la cible
		
		angle = theta*i
		x = (rayon * Math.cos(angle))+centerX
		y = (rayon * Math.sin(angle))+centerY
		string+= "<rect x=\""+(x-2.5)+"\" y=\""+(y-7.5)+"\" width=\"5\" height=\"15\" transform=\"rotate("+i*(360/nbPoints)+","+x+","+y+")\"/></g>"
	}
	
	//dessin inner rings 
	
	for(let i=0;i<game.rings.length;i++){
		rayon = (i+1)*75
		
		string+="<circle cx=\""+300+"\" cy=\""+300+"\" r=\""+rayon+"\" stroke=\"yellow\" stroke-width=\"1\" fill-opacity=\"0\"/>"
		
		for(let j=0;j<nbPoints;j++){
					
			hitItem = false
			
			if(game.rings[i][j]!=0){
				
				//tracer lasers
				
				if(game.rings[i][j]==1){
					
					//si il touche qqchose mm coté
					
					for(let k=i-1;k>=0;k--){
						if(game.rings[k][j]){
							rayon2 = (k+1)*75
							angle = theta*j
							x1 = (rayon * Math.cos(angle))+centerX
							y1 = (rayon * Math.sin(angle))+centerY
							x2 = (rayon2 * Math.cos(angle))+centerX
							y2 = (rayon2 * Math.sin(angle))+centerY
							string+="<line x1=\""+x1+"\" y1=\""+y1+"\" x2=\""+x2+"\" y2=\""+y2+"\" style=\"stroke:rgb(255,0,0);stroke-width:2\" />"
							hitItem = true
						}
					}
					
					//si il touche qqchose à l'opposé
					
					if(!hitItem){
						for(let k=0;k<3;k++){
							if(game.rings[k][opposite(j)]){
								rayon2 = (k+1)*75
								angle = theta*j
								angle2 = theta*opposite(j)
								x1 = (rayon * Math.cos(angle))+centerX
								y1 = (rayon * Math.sin(angle))+centerY
								x2 = (rayon2 * Math.cos(angle2))+centerX
								y2 = (rayon2 * Math.sin(angle2))+centerY
								string+="<line x1=\""+x1+"\" y1=\""+y1+"\" x2=\""+x2+"\" y2=\""+y2+"\" style=\"stroke:rgb(255,0,0);stroke-width:2\" />"
								hitItem = true
							}
						}
					}
					
					//sinon
					
					if(!hitItem){
						let color = "rgb(255,255,0)"
						if(game.targetRing[opposite(j)]){
							color = "rgb(0,255,0)"
						}
						angle = theta*j
						angle2 = theta*opposite(j)
						x1 = (rayon * Math.cos(angle))+centerX
						y1 = (rayon * Math.sin(angle))+centerY
						x2 = (300 * Math.cos(angle2))+centerX
						y2 = (300 * Math.sin(angle2))+centerY
						string+="<line x1=\""+x1+"\" y1=\""+y1+"\" x2=\""+x2+"\" y2=\""+y2+"\" style=\"stroke:"+color+";stroke-width:2\" />"
					}							
				}					
				
				//tracer objets
				
				angle = theta*j
				switch(game.rings[i][j]){
					case 1:					
						x = (rayon * Math.cos(angle))+centerX
						y = (rayon * Math.sin(angle))+centerY
						let color
						if(laserHitsTarget(j,i)){
							color = "green"
						} else {
							color = "red"
						}
						string+= "<rect x=\""+(x-1.5)+"\" y=\""+(y-4)+"\" width=\"3\" height=\"8\" stroke=\""+color+"\" stroke-width=\"3\" fill=\""+color+"\" transform=\"rotate("+j*(360/nbPoints)+","+x+","+y+")\"/>"
						break
					case 2:
						x = (rayon * Math.cos(angle))+centerX
						y = (rayon * Math.sin(angle))+centerY
						string+= "<rect x=\""+(x-2.5)+"\" y=\""+(y-2.5)+"\" width=\"5\" height=\"5\" stroke=\"blue\" stroke-width=\"3\" fill=\"blue\" transform=\"rotate("+j*(360/nbPoints)+","+x+","+y+")\"/>"
						break
					default :
						break				
				}
			}
		}		
	}		
	
	//finish
	
	string+="</svg>"
	let div = document.getElementById("test")
	
	if(isWin()){
		string+=("congrations, yuo are smart")
	}
	div.innerHTML = string;
}