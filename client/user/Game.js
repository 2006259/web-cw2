import React, {useEffect, useState} from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import { makeStyles } from '@material-ui/core/styles'
import {create} from './api-user.js'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import auth from './../auth/auth-helper'
import DialogTitle from '@material-ui/core/DialogTitle'
import {Link, Redirect} from 'react-router-dom'
import {read} from "./api-user";

const useStyles = makeStyles(theme => ({
    card: {
        maxWidth: 600,
        margin: 'auto',
        textAlign: 'center',
        marginTop: theme.spacing(5),
        paddingBottom: theme.spacing(2)
    },
    error: {
        verticalAlign: 'middle'
    },
    title: {
        marginTop: theme.spacing(2),
        color: theme.palette.openTitle
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300
    },
    submit: {
        margin: 'auto',
        marginBottom: theme.spacing(2)
    }
}))

var game = {}
game.targetRing = [0,1,0,0,0,1,0,0,1,0,1,0]
game.rings = []
game.rings[0] = [1,0,0,1,0,0,2,0,0,0,0,0] //cercle interne
game.rings[1] = [0,0,0,1,0,1,0,0,0,0,0,0]
game.rings[2] = [1,0,0,2,0,2,0,0,1,0,0,0] //cercle externe

let nbPoints = game.targetRing.length
let nbRotations = 0

function cycleRingRight(ring){
    var lastCase = ring[ring.length-1]
    for(let i=ring.length-1;i>=0;i--){
        ring[i] = ring[i-1]
    }
    ring[0] = lastCase
}

function cycleRingLeft(ring){
    var firstCase = ring[0]
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
    nbRotations++
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
        let x = (rayon * Math.cos(angle))+centerX
        let y = (rayon * Math.sin(angle))+centerY
        string+= "<rect x=\""+(x-2.5)+"\" y=\""+(y-7.5)+"\" width=\"5\" height=\"15\" transform=\"rotate("+i*(360/nbPoints)+","+x+","+y+")\"/></g>"
    }

    //dessin inner rings

    for(let i=0; i<game.rings.length; i++){
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
                            let x1 = (rayon * Math.cos(angle))+centerX
                            let y1 = (rayon * Math.sin(angle))+centerY
                            let x2 = (rayon2 * Math.cos(angle))+centerX
                            let y2 = (rayon2 * Math.sin(angle))+centerY
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
                                let angle2 = theta*opposite(j)
                                let x1 = (rayon * Math.cos(angle))+centerX
                                let y1 = (rayon * Math.sin(angle))+centerY
                                let x2 = (rayon2 * Math.cos(angle2))+centerX
                                let y2 = (rayon2 * Math.sin(angle2))+centerY
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
                        let angle2 = theta*opposite(j)
                        let x1 = (rayon * Math.cos(angle))+centerX
                        let y1 = (rayon * Math.sin(angle))+centerY
                        let x2 = (300 * Math.cos(angle2))+centerX
                        let y2 = (300 * Math.sin(angle2))+centerY
                        string+="<line x1=\""+x1+"\" y1=\""+y1+"\" x2=\""+x2+"\" y2=\""+y2+"\" style=\"stroke:"+color+";stroke-width:2\" />"
                    }
                }

                //tracer objets

                angle = theta*j
                let x = 0
                let y = 0
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
    document.getElementById("test").innerHTML = string;
}

function resetGame(){
    console.log('resetting game')
    game.targetRing = [0,1,0,0,0,1,0,0,1,0,1,0]
    game.rings[0] = [1,0,0,1,0,0,2,0,0,0,0,0] //cercle interne
    game.rings[1] = [0,0,0,1,0,1,0,0,0,0,0,0]
    game.rings[2] = [1,0,0,2,0,2,0,0,1,0,0,0] //cercle externe.
    nbRotations = 0;
}

export default function Game({ match }) {
    const classes = useStyles()
    const [user, setUser] = useState({})
    const [redirectToSignin, setRedirectToSignin] = useState(false)
    const jwt = auth.isAuthenticated()

    useEffect(() => {
        const abortController = new AbortController()
        const signal = abortController.signal

        read({
            userId: match.params.userId
        }, {t: jwt.token}, signal).then((data) => {
            if (data && data.error) {
                setRedirectToSignin(true)
            } else {
                setUser(data)
            }
        })

        return function cleanup(){
            abortController.abort()
        }

    }, [match.params.userId])

    const [values, setValues] = useState({
        won: false
    })

    if (redirectToSignin) {
        return <Redirect to='/signin'/>
    }

    var highScoreString = '';

    function redraw(r, cc){
        rotateRing(r,cc)
        console.log("rotations : "+nbRotations)
        drawGame()
        if(isWin()){
            setValues({won: true})
            if(user.score !== undefined) {
                if (nbRotations < user.score) {
                    setUser({...user, score: nbRotations })
                    highScoreString = "New High Score!"
                    resetGame()
                }
            } else {
                console.log('replacing undefined high score')
                setUser({...user, score: nbRotations })
                highScoreString = "New High Score!"
                resetGame()
            }
        }
    }

    return (<div>
            <Card className={classes.card}>
                <CardContent>
                    <Typography variant="h6" className={classes.title}>
                        Line up the ugly animals with their new owners, but don't let the pretty ones block them!
                    </Typography>
                </CardContent>
                <div>
                    <CardActions>
                        <button color="primary" variant="contained" onClick={() => redraw(3,0)}>R3 to the right</button> <br></br>
                        <button color="primary" variant="contained" onClick={() => redraw(2,0)}>R2 to the right</button> <br></br>
                        <button color="primary" variant="contained" onClick={() => redraw(1,0)}>R1 to the right</button> <br></br>

                        <button color="primary" variant="contained" onClick={() => redraw(3,1)}>R3 to the left</button> <br></br>
                        <button color="primary" variant="contained" onClick={() => redraw(2,1)}>R2 to the left</button> <br></br>
                        <button color="primary" variant="contained" onClick={() => redraw(1,1)}>R1 to the left</button> <br></br>
                    </CardActions>
                </div>
                <div id="test" onLoad={() => drawGame()}></div>
            </Card>
            <Dialog open={values.won} disableBackdropClick={false}>
                <DialogTitle>Congratulations</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You won in {nbRotations} rotations! {highScoreString}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Link to="/usersscore">
                        <Button color="primary" autoFocus="autoFocus" variant="contained">
                            Go see other scores
                        </Button>
                    </Link>
                </DialogActions>
            </Dialog>
        </div>
    )
}