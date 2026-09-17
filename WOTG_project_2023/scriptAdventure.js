const soundFileAOT = new Audio("sounds/Attack on TItan.m4a");

let positionOffSet = 0;

let intervalRight = setInterval(movePictureLeftRight, 20);

let rightKey = false;
let leftKey = false;

document.addEventListener("keydown" , keyDownListener)
document.addEventListener("keyup" , keyUpListener)

function keyDownListener(event) {

    if (event.keyCode == 68){

        rightKey = true;

    }

    if (event.keyCode == 65){

        leftKey = true;

    }
   
    if (event.keyCode == 32){

        window.alert("Hey, whatre you doin there??? :)");

    }

}

function keyUpListener(event){

    if (event.keyCode == 68){

        rightKey = false;

    }

    if (event.keyCode == 65){

        leftKey = false;

    }

}

function peopleAppear() {

    document.getElementById("rainbow").style.display = "block";

}

function textChange() {

    let swap =  document.getElementById("stepping").innerHTML;
    document.getElementById("stepping").innerHTML= "<a href = 'WOTG Meeting Fiona.html'> Gather your strength and reach into the portal... </a>";

}

function movePictureLeftRight() {

    document.getElementById("walking").style.left = positionOffSet + "px";
        
        if (rightKey == true ) {

            soundFileAOT.play()
    
            if (positionOffSet <= 530){
    
                positionOffSet = positionOffSet + 2;
    
            }
    
            else {

                textChange();

            }
    
    }

    else {

        soundFileAOT.pause()

    }

    if (leftKey == true ) {

        if (positionOffSet <= 530){
    
            positionOffSet = positionOffSet - 6;
    
        }
    
        else {
    
            console.log(positionOffSet);
        }
    
    }
    
    }

   function textAppear() {
    
        document.getElementById("stepping").style.display = "block";

    } 

    function ifTextAppear() {

        if (positionOffSet >= 530){

            textAppear();

        }

    }

const soundFileBeginning = new Audio("sounds/Titanfall.m4a");
const soundFileNegotiation = new Audio ("sounds/ForgingTheFates.m4a");
const soundFileMurderer = new Audio("sounds/murdermusic.m4a");
const soundFileSneak = new Audio ("sounds/ItFollows.m4a");
const soundFileTalax = new Audio ("sounds/Enola.m4a");
const soundFileViolet = new Audio ("sounds/violet.m4A");
const soundFileHawkins = new Audio ("sounds/Hawkins.m4A");
const soundFileOnion = new Audio ("sounds/Onion.m4A");
const soundFileDisco = new Audio ("sounds/Disco.m4A");
const soundFileGM = new Audio ("sounds/GM.m4A");
const soundFileML = new Audio ("sounds/ML.m4A");
const soundFileHades = new Audio ("sounds/Hades.m4A");
const soundFileSlip = new Audio ("sounds/slip.mp3");
const soundFileGael = new Audio ("sounds/Gael.m4A");
const soundFileRage = new Audio ("sounds/Rage.m4A");
const soundFileSong = new Audio ("sounds/Song.m4A");
const soundFileNimona = new Audio ("sounds/Nimona.m4A");
const soundFileWill = new Audio ("sounds/will.m4A")

let ppBeginning = 1;
let ppMurderer = 1;
let ppNegotiation = 1;
let ppSneak = 1;
let ppTalax = 1;
let ppViolet = 1;
let ppHawkins = 1;
let ppOnion = 1;
let ppDisco = 1;
let ppGM = 1;
let ppML = 1;
let ppHades = 1;
let ppSlip = 1;
let ppGael = 1;
let ppRage = 1;
let ppSong = 1;
let ppNimona = 1;
let ppWill = 1;

function myFunctionBeginning(){

    if (ppBeginning == 1) {

        soundFileBeginning.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppBeginning = 2;

    }

    else if (ppBeginning == 2) {

        soundFileBeginning.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppBeginning = 1;

    }

}

function myFunctionMurderer(){

    if (ppMurderer == 1) {

        soundFileMurderer.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppMurderer = 2;

    }

    else if (ppMurderer == 2) {

        soundFileMurderer.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppMurderer = 1;

    }

}

function myFunctionNegotiation(){

    if (ppNegotiation == 1) {

        soundFileNegotiation.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppNegotiation = 2;

    }

    else if (ppNegotiation == 2) {

        soundFileNegotiation.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppNegotiation = 1;

    }

}

function myFunctionSneak(){

    if (ppSneak == 1) {

        soundFileSneak.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppSneak = 2;

    }

    else if (ppSneak == 2) {

        soundFileSneak.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppSneak = 1;

    }

}

function myFunctionTalax(){

    if (ppTalax == 1) {

        soundFileTalax.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppTalax = 2;

    }

    else if (ppTalax == 2) {

        soundFileTalax.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppTalax = 1;

    }

}

function myFunctionViolet() {

    if (ppViolet == 1) {

        soundFileViolet.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppViolet = 2;

    }

    else if (ppViolet == 2) {

        soundFileViolet.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppViolet = 1;

    }

}

function myFunctionHawkins() {

    if (ppHawkins == 1) {

        soundFileHawkins.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppHawkins = 2;

    }

    else if (ppHawkins == 2) {

        soundFileHawkins.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppHawkins = 1;

    }

}

function myFunctionOnion() {

    if (ppOnion == 1) {

        soundFileOnion.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppOnion = 2;

    }

    else if (ppOnion == 2) {

        soundFileOnion.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppOnion = 1;

    }

}

function myFunctionDisco() {

    if (ppDisco == 1) {

        soundFileDisco.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppDisco = 2;

    }

    else if (ppDisco == 2) {

        soundFileDisco.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppDisco = 1;

    }

}

function myFunctionGM() {

    if (ppGM == 1) {

        soundFileGM.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppGM = 2;

    }

    else if (ppGM == 2) {

        soundFileGM.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppGM = 1;

    }

}

function myFunctionML() {

    if (ppML == 1) {

        soundFileML.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppML = 2;

    }

    else if (ppML == 2) {

        soundFileML.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppML = 1;

    }

}

function myFunctionHades () {

    if (ppHades == 1) {

        soundFileHades.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppHades = 2;

    }

    else if (ppHades == 2) {

        soundFileHades.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppHades = 1;

    }

}

function myFunctionSlip () {

    if (ppSlip == 1) {

        soundFileSlip.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppSlip = 2;

    }

    else if (ppSlip == 2) {

        soundFileSlip.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppSlip = 1;

    }

}

function myFunctionGael () {

    if (ppGael == 1) {

        soundFileGael.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppGael = 2;

    }

    else if (ppGael == 2) {

        soundFileGael.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppGael = 1;

    }

}

function myFunctionRage () {

    if (ppRage == 1) {

        soundFileRage.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppRage = 2;

    }

    else if (ppRage == 2) {

        soundFileRage.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppRage = 1;

    }

}

function myFunctionSong () {

    if (ppSong == 1) {

        soundFileSong.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppSong = 2;

    }

    else if (ppSong == 2) {

        soundFileSong.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppSong = 1;

    }

}

function myFunctionNimona () {

    if (ppNimona == 1) {

        soundFileNimona.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppNimona = 2;

    }

    else if (ppNimona == 2) {

        soundFileNimona.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppNimona = 1;

    }

}

function myFunctionWill () {

    if (ppWill == 1) {

        soundFileWill.play()
        document.getElementById("soundbutton").src = "images/pause.png";
        ppWill = 2;

    }

    else if (ppWill == 2) {

        soundFileWill.pause()
        document.getElementById("soundbutton").src = "images/play.png";
        ppWill = 1;

    }

}