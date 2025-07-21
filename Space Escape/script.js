var vertexHeight = 500;
var planeDefinition = 50;
var planeSize = 15000;
var enemyattackFrequency = 1000;
var lives = 3;
var BulletsFired = 0;
var Kills = 0;
 var cx = 0, cy = 0, cz = 0; //camera movement
var bullets = [];
var enemies = [];
var exploders = [];

//var Walltexture = THREE.ImageUtils.loadTexture('https://googledrive.com/host/0BzjYB_Ch9pbscTBZX3l3eGdfS1k/walls.png', {}, function() { });
//Walltexture.wrapT = Walltexture.wrapS = THREE.RepeatWrapping;
//Walltexture.repeat.set( 10, 5 );
//Walltexture.overdraw = true;


var Enemytexture = new THREE.Texture(spacehack.Enemy);
Enemytexture.needsUpdate = true;
var shiptexture = new THREE.Texture(spacehack.Ship);
shiptexture.needsUpdate = true;
var shadowtexture = new THREE.Texture(spacehack.Shadow);
shadowtexture.needsUpdate = true;
var texture = new THREE.Texture(spacehack.Back);
texture.needsUpdate = true;

var container = document.createElement('div');
document.body.appendChild( container );

var StartText  = document.getElementById('Start');
var statusText = document.getElementById('dir');
var gamestateText = document.getElementById('status');
var GameOverText = document.getElementById('GameOver');
var KillsText = document.getElementById('Kills');
var BulletsText  = document.getElementById('Bullets');

var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight,1, 100000)
camera.position.z = 1000; 
camera.position.y = -30000;

camera.lookAt( new THREE.Vector3(0,6000,0) );

var scene = new THREE.Scene();


StartText.style.display= 'block';

function WorldObjects () {
  var wallMaterial = new THREE.MeshBasicMaterial( {wireframe: true } );
  var wallObj = new THREE.PlaneGeometry( 5000, 2000, 10,10 );
  this.Wall = function() {return new THREE.Mesh(wallObj,wallMaterial);}
  
  var shadowMaterial =  new THREE.MeshBasicMaterial( { wireframe: false, transparent: true, map: shadowtexture } );
  var shadowObj =  new THREE.PlaneGeometry( 64, 24, 1, 1 );
  this.shadow = function() {return new THREE.Mesh(shadowObj,shadowMaterial);}
  
  var shipMaterial =  new THREE.MeshBasicMaterial( { transparent: true, map: shiptexture } );
  var shipObj =  new THREE.PlaneGeometry( 64, 24, 1, 1 );
  this.Ship = function() {return new THREE.Mesh(shipObj,shipMaterial);}
  
  var ufoMaterial =  new THREE.MeshBasicMaterial( {  map: Enemytexture } );
  var ufoObj =  new THREE.PlaneGeometry( 100, 40, 1, 1 );
  this.UFO = function() {return new THREE.Mesh(ufoObj,ufoMaterial);}
  
  var tunnelMaterial = new THREE.MeshBasicMaterial( {wireframe: false , map:texture} );//, map:texture
  var tunnelObj = new THREE.PlaneGeometry( 25000, 60000, 3, planeDefinition );
  this.Tunnel = function() {return new THREE.Mesh(tunnelObj,tunnelMaterial);}
  
  //var groundMaterial = new THREE.MeshBasicMaterial( {wireframe: true, map: texture } );//
 // var groundObj = new THREE.PlaneGeometry( 90000, 60000, 3, planeDefinition );
 // this.Ground = function() {return new THREE.Mesh(groundObj,groundMaterial);}
}

var Objects = new WorldObjects();

  function Explode(x,y,z)
  {
    var age = 0;
     var movementSpeed = 80;
     var totalObjects = 1000;
     var objectSize = 10;
     //var sizeRandomness = 4000;
     var dirs = [];
     var colors = [0xFFFFFF];
     var geometry = new THREE.Geometry();
  
    for (i = 0; i < totalObjects; i ++) 
    { 
      var vertex = new THREE.Vector3();
      vertex.x = x;
      vertex.y = y;
      vertex.z = z;
  
      geometry.vertices.push( vertex );
      dirs.push({x:(Math.random() * movementSpeed)-(movementSpeed/2),y:(Math.random() * movementSpeed)-(movementSpeed/2),z:(Math.random() * movementSpeed)-(movementSpeed/2)});
    }
    var material = new THREE.ParticleBasicMaterial( { size: objectSize,  color: colors[Math.round(Math.random() * colors.length)] });
    var particles = new THREE.ParticleSystem( geometry, material );
  
    this.object = particles;
    this.status = true;
  
    this.xDir = (Math.random() * movementSpeed)-(movementSpeed/2);
    this.yDir = (Math.random() * movementSpeed)-(movementSpeed/2);
    this.zDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  
    scene.add( this.object  ); 
  
    this.reverse = function(){
   
      var pCount = totalObjects;
      while(pCount--) {
        
        dirs[pCount].y = -(dirs[pCount].y);
        dirs[pCount].x = -(dirs[pCount].x);
        dirs[pCount].z = -(dirs[pCount].z);
      }
    }
    
    this.update = function(){
      if (this.status == true && age < 2000){
        age += 1;
        var pCount = totalObjects;
        while(pCount--) {
          var particle =  this.object.geometry.vertices[pCount]
          particle.y += dirs[pCount].y;
          particle.x += dirs[pCount].x;
          particle.z += dirs[pCount].z;
        }
        this.object.geometry.verticesNeedUpdate = true;
      }
      else if (age >= 2000)
      {
        this.status = false;
      }
    }
  
  }

function player()
{
  countdown = 0;
  this.explosion;
  this.status = true;
  this.ship = Objects.Ship();
  this.ship.rotation.x =1.56;
  this.ship.position.y = -29500;
  this.ship.position.z = 900; //0
  this.ship.visible = true;
  
  this.shadow = Objects.shadow();
  this.shadow.rotation.x =1.56;
  this.shadow.position.y = this.ship.position.y;
  this.shadow.position.x = this.ship.position.x; // 2750
  this.shadow.position.z = 825; //0
  
  //this.explosion1 = Objects.explosion();
  //this.explosion1.rotation.x +=1.56;
  //this.explosion1.visible = false;

  this.positionY = function() { return Math.round(this.ship.position.y) ;}
  this.positionZ = function() { return Math.round(this.ship.position.z) ;}
  this.positionX = function() { return Math.round(this.ship.position.x) ;}
  
  scene.add(this.ship );
  scene.add(this.shadow);
  //scene.add(this.explosion1);
  
  this.turnleft = function()
  {
    this.ship.rotation.z = .25;
  }
  
  this.turnright = function()
  {
    this.ship.rotation.z = -.25;
  }
  
  this.update = function()
  {
    this.ship.rotation.z = 0;
    this.ship.position.x -= cx; // 2750
    this.ship.position.z -= cy; //0
    if(countdown > 0){
      countdown -= 1;
      if (countdown==0)
      {
        this.status = true;
      }
    }
    if (!(this.ship.position.x > -400 && this.ship.position.x < 400)){
      this.ship.position.x += cx;
      cx = 0;
    }
       
    if (!(this.ship.position.z > 850 && this.ship.position.z < 1050)){
      this.ship.position.z += cy;
      cy = 0;
     }
     this.shadow.position.x = this.ship.position.x;
        
  }
  
  this.restart = function()
  {
     //this.explosion.reverse();
      this.ship.position.z = 900; //0
      this.ship.position.x = 0;
      cz = 0;
      cy = 0;
      cx = 0;
       countdown = 180;
      this.ship.visible = true;
      this.shadow.visible = true;
      //this.explosion1.visible = false;
  }
  
  this.dead = function()
  {
   // this.Explode(this.ship.position.x, this.ship.position.y,this.ship.position.z);
    if (this.status == true && countdown ==0){
      this.status = false;
      this.explosion = new Explode(this.ship.position.x, this.ship.position.y,this.ship.position.z)
      exploders.push(this.explosion);
     // this.Explode(this.ship.position.x, this.ship.position.y,this.ship.position.z);
      this.ship.visible = false;
      this.shadow.visible = false;
      lives -= 1;
      statusText.innerHTML =  'Lives: ' + lives ;
      if (lives > 0){
        gamestateText.style.display= 'block';
      }
      else
      {
        GameOverText.style.display= 'block';
        KillsText.innerHTML = "Kills: " + Kills;
        BulletsText.innerHTML = "Bullets: " + BulletsFired;

      }
      
      // this.explosion1.visible = true;
     // this.explosion1.position.x = this.ship.position.x;
     // this.explosion1.position.y = this.ship.position.y;
     // this.explosion1.position.z = this.ship.position.z; 
    }
     
  }
}



function enemy() ///skin, x, y, z
{
  var initialMove = false;
      this.endingX = (Math.random()*800) - 400;
      this.endingZ = (Math.random()*200);
  
      this.status = false;
      //this.state = "alive";
      
      //this.explosion1 = Objects.explosion();
      //this.explosion1.rotation.x +=1.56;
      //this.explosion1.visible = false;
  
      this.enemy1 = Objects.UFO();
      this.enemy1.rotation.x =1.56;
      this.enemy1.position.x = (Math.random()*16000) - 8000; //random from 8000 to -8000
      this.enemy1.position.y = ((Math.random()*124000) -64000);
      this.enemy1.position.z = (Math.random()*3000) + 5500; //0
      scene.add(this.enemy1);
      //scene.add(this.explosion1);
  
      this.positionY = function() { return Math.round(this.enemy1.position.y) ;}
      this.positionZ = function() { return Math.round(this.enemy1.position.z) ;}
      this.positionX = function() { return Math.round(this.enemy1.position.x) ;}
  
  this.update = function()
  {
    if(this.status == true){
      if(this.enemy1.position.y < -35000)
      {
          this.status = false;
          this.enemy1.position.x = (Math.random()*16000) - 8000; //random from 8000 to -8000
          this.enemy1.position.y = ((Math.random()*124000) -64000);
          this.enemy1.position.z = (Math.random()*3000) + 5500; //0
      }
      initialMove = true;
        if ((this.enemy1.position.x != this.endingX)){
          if(this.enemy1.position.x < this.endingX)
            this.enemy1.position.x += 50;
          if(this.enemy1.position.x > this.endingX)
            this.enemy1.position.x -= 50;
          
          initialMove = false;
        }
       
        if (!(this.enemy1.position.z < (this.endingZ + 850) )){
             this.enemy1.position.z -= 20; //0
           //initialMove = false;
        }
    if (initialMove == true)
    {
        this.enemy1.position.x += 50;
    }
       this.enemy1.position.y -= (Math.random()*30)+20 ;
  
    }
   // this.draw();

  }
  
  this.dead = function()
  {
      this.status = false;
      exploders.push(new Explode(this.enemy1.position.x, this.enemy1.position.y,this.enemy1.position.z));
      //this.Explode(this.enemy1.position.x, this.enemy1.position.y,this.enemy1.position.z);
      this.enemy1.position.x = (Math.random()*16000) - 8000; //random from 8000 to -8000
      this.enemy1.position.y = ((Math.random()*124000) -64000);
      this.enemy1.position.z = (Math.random()*3000) + 5500; //0
      Kills +=1;
  }
  
}


function EnemyInit() {
  for (var x = 0; x < 25; x++)
  {
      xpu = new enemy();
      enemies.push(xpu);
  }
}
//EnemyInit();


function LevelBackground()
{
    floorVisible = true;
    closingWall = true;  
    flat = false;
    stars = true;
    movespeed = 250;
  
    
    if(!flat){
      this.floor = Objects.Tunnel();
      this.floor1 = Objects.Tunnel();
      this.floor2 = Objects.Tunnel();
    }
    else
    {
      this.floor = Objects.Ground();
      this.floor1 = Objects.Ground();
      this.floor2 = Objects.Ground();

    }
    this.floor1.position.y = 60000;
    this.floor2.position.y = 120000;
    
    if (!floorVisible)
    {
      this.floor.visible = false;
      this.floor1.visible = false;
      this.floor2.visible = false;
    }
  
    if(closingWall)
    {
      this.wall = Objects.Wall();
      this.wall.rotation.x = 1.56;
      this.wall.position.x = 6000; //2500
      this.wall.position.y = 70000;
      this.wall.position.z = 950;
    }
      this.wallY = function() { return Math.round(this.wall.position.y) ;}
      this.wallZ = function() { return Math.round(this.wall.position.z) ;}
      this.wallX = function() { return Math.round(this.wall.position.x) ;}
 
  if(!flat){
    makeWalls(this.floor);
    makeWalls(this.floor1);
    makeWalls(this.floor2);
  }
    scene.add( this.wall );
    scene.add(this.floor);
    scene.add(this.floor1);
    scene.add(this.floor2);
  
  if(stars)
    creatStars();
  
  this.restart = function()
  {
    movespeed = 250;
    this.update();
  }
    
  this.stop = function()
  {
    movespeed = 0;
  }
  
    this.update = function()
    {
      
        this.floor.position.y -=movespeed;
        this.floor1.position.y -=movespeed;
        this.floor2.position.y -=movespeed;
        
        if(this.floor.position.y < -60000)
        {
          this.floor.position.y = 120000;// plane2.position.y+60000;
          //plane3.position.y = plane2.position.y+60000;
          
        }
        if(this.floor1.position.y < -60000)
        {
          this.floor1.position.y = 120000;// plane.position.y+60000;
          
        }
         if(this.floor2.position.y < -60000)
        {
          this.floor2.position.y = 120000;//plane.position.y+120000;
          
        }
      
        if(closingWall)
        {
          this.wall.position.y -= movespeed;
          if(this.wall.position.x > 2500)
            {this.wall.position.x -= 10;}
          else if (this.wall.position.x < -2500)
            {this.wall.position.x += 10;}
        
          if (this.wall.position.y < -29600)
          {
            this.wall.position.y = 70000; 
            this.wall.position.x = 6000 * wallLocation();
          }
        }
        
    }
  
    function creatStars() {
      var geometry = new THREE.Geometry();
      for (i = 0; i < 500; i ++) 
      { 
        var vertex = new THREE.Vector3();
        vertex.x = Math.random()*110000-55000;
        vertex.y = 40000;// Math.random()*1000-500;
        vertex.z = Math.random()*80000-40000;
        geometry.vertices.push( vertex );
      }

      var material = new THREE.ParticleBasicMaterial( { size: 6 });
      var particles = new THREE.ParticleSystem( geometry, material );
      particles.position.z =5400;
      //particles.position.x = 20000;
      particles.position.y = -20000;
	    particles.rotation.x -= .31;
      scene.add( particles );
    }
  
    function makeWalls(plane) { 
       for (var i = 0; i < plane.geometry.vertices.length; i++) 
       { 
         if (plane.geometry.vertices[i].x == -12500){ //4 -12500 //i % 4 == 0
             plane.geometry.vertices[i].z = 2000; 
             plane.geometry.vertices[i].x = -4150; 
         }
         if (plane.geometry.vertices[i].x == 12500){ //4 -12500 //i % 4 == 0
             plane.geometry.vertices[i].z = 2000; 
             plane.geometry.vertices[i].x = 4150; 
         }
       } 
    };
  
  
}


//test = new LevelBackground();
//pl = new player();


var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild( renderer.domElement );

//bulletsInit(300);



  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;

  var currentlyPressedKeys = {};

  function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
    if (event.keyCode==32)
    {
      if (lives > 0){
        test.restart();
        pl.restart();
        gamestateText.style.display = "none";
      }
      else
      {
        start();
        GameOverText.style.display = "none";
      }
      StartText.style.display= 'none';
    }
    
    if(event.keyCode==13)
    {
        //for(var x = 0; x < enemies.length; x++)
        //{
        //  enemies[x].dead();
        //}
      shoot();
    }
  }


  function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;

     if(!event.keyCode==13)
    {
        cz = 0;
    cy = 0;
    cx = 0;
    }
  }

//render();
start();
 render();

function bulletsInit(total) {
  for (var x = 0; x < total; x++)
  {
   var bullet;
    bullet = new THREE.Mesh(new THREE.SphereGeometry(5,10,10), new THREE.MeshBasicMaterial({  wireframe:false, color:'#A00404' }));
 // bullet.position.y= -29500;
//bullet.position.x += 100; // 2750
//bullet.position.z += 900; //0
    bullet.visible = false;
  scene.add(bullet);
  bullets.push(bullet);
  }
}
 
function shoot()
{
  var aShot = false;
  BulletsFired += 1;
  for (var x = 0; x < bullets.length; x++)
  {
  if(!aShot){
    if(bullets[x].visible == false){
    bullets[x].visible = true;
    bullets[x].position.y = pl.positionY();
    bullets[x].position.x = pl.positionX(); // 2750
    bullets[x].position.z = pl.positionZ(); //0
    aShot = true;
    }
  }
  }
}

function start()
{
  scene = new THREE.Scene();
  enemies = [];
  bullets = [];
  exploders = [];
  lives = 3;
  BulletsFired = 0;
  Kills = 0;
  cx = 0, cy = 0, cz = 0; 
  test = new LevelBackground();
  pl = new player();
  statusText.innerHTML =  'Lives: ' + lives ;
  bulletsInit(300);
  EnemyInit();
 
}
			function render() {
        requestAnimationFrame( render );
         //explode.update(10);
          pl.update();
          test.update();
         var pCount = exploders.length;
          while(pCount--) {
            if (exploders[pCount].status){
              exploders[pCount].update();
            }
            else
            {
              scene.remove( exploders[pCount] )
            }
          }
         //ship.rotation.z = 0;
        for(var x = 0; x < enemies.length; x++)
        {
          enemies[x].update();
          if (enemies[x].status){
          
         // statusText.innerHTML = enemies[x].positionY() + ' - ' + ship.position.y ;
          if (enemies[x].positionY() <= pl.positionY() && enemies[x].positionY() >= pl.positionY() - 50)
          {
           // statusText.innerHTML = 'hit - ' + enemies[x].positionZ() + ' <= ' + ship.position.z + '----' + enemies[x].positionZ() + ' >= ' + ship.position.z ;
            if (enemies[x].positionZ() <= pl.positionZ()+50 && enemies[x].positionZ() >= pl.positionZ() - 50)
            {
              if (enemies[x].positionX() <= pl.positionX()+50 && enemies[x].positionX() >= pl.positionX() - 50)
              {
                  pl.dead();
                test.stop();
                    enemies[x].dead();
              }
            }
          }
          }
          else
          {
            if(Math.round((Math.random()* enemyattackFrequency)) == 1) 
            {
              //enemies[x].state = "alive";
              enemies[x].status = true;
            }
          }
        }
        

        handleKeys();
       
   
        //ship.position.x -= cx; // 2750
        //ship.position.z -= cy; //0
        
        
        
        //if (!(ship.position.x > -400 && ship.position.x < 400)){
        //  ship.position.x += cx;
        //  cx = 0;
       // }
       
       // if (!(ship.position.z > 850 && ship.position.z < 1050)){
       //   ship.position.z += cy;
       //   cy = 0;
       // }
       //shadow.position.x = ship.position.x;
        
        if (pl.positionY() == test.wallY()-2000){
           // alert('test');
          if ((pl.positionX() <= (0) && pl.positionX() >= (test.wallX())) || (pl.positionX() >= (0) && pl.positionX() <= (test.wallX()))) 
          {
              pl.dead();
            test.stop();
          }

        }
       // bullet.position.y +=30;
        for(var x = 0; x < bullets.length; x++)
        {
          if(bullets[x].visible == true)
          {
            bullets[x].position.y +=50;
          }
          
         // if(bullets[x].position.y > (test.wallY()-500) && bullets[x].visible == true)
         // {
          //      bullets[x].visible = false; 
               // bullets[x].position.y += 10000;
                //bullets[x].position.x = 0; // 2750
                //bullets[x].position.z = 0; //0
         // }
          if(bullets[x].position.y > -25000 && bullets[x].visible == true)  //-27000
          {
             bullets[x].visible = false; 
                bullets[x].position.y = 0;
                bullets[x].position.x = 0; // 2750
                bullets[x].position.z = 0; //0
          }
            for(var e = 0; e < enemies.length; e++)
            {
              if (enemies[e].status){
              if (enemies[e].positionY()-10 <= Math.round(bullets[x].position.y) && enemies[e].positionY() + 10 <= Math.round(bullets[x].position.y) )
              {
                if (((enemies[e].positionX() - 50) <= bullets[x].position.x && enemies[e].positionX() + 50 >= bullets[x].position.x)   //50 is half width -- center is x point
                    && (enemies[e].positionZ() - 50 <= bullets[x].position.z && enemies[e].positionZ() + 50 >= bullets[x].position.z) ) //50 is half height
                {
                   enemies[e].dead();
                }
              }
              }
            }
        
       
        }
        
    
        
        renderer.render( scene, camera );
			}

		
//     window.addEventListener( 'resize', onWindowResize, false );

//function onWindowResize() {
//				camera.aspect = window.innerWidth / window.innerHeight;
//				//camera.updateProjectionMatrix();

//				renderer.setSize( window.innerWidth, window.innerHeight );

//			}

function wallLocation()
{
  wx = Math.round(Math.random()*1);
  if (wx==0)
  {
    return -1;
  }
  else if (wx==1)
  {
    return 1;
  }
}



function handleKeys() {
    if (currentlyPressedKeys[65]) {
      // Left cursor key
      pl.turnleft()
     // ship.rotation.z = .25;
      cx += .1;
    }
 

    if (currentlyPressedKeys[68]) {
      // Right cursor key
       pl.turnright()
     // ship.rotation.z = -.25;
      cx -= .1;
    }
    if (currentlyPressedKeys[87]) {
      // Up cursor key
      cy -= .1;
    }
    if (currentlyPressedKeys[83]) {
      // Down cursor key
      cy += .1;
    }

  
    if (currentlyPressedKeys[32]) {
      
    //  test.restart();
    //  pl.restart();
    }
}


function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) 
{	
	// note: texture passed by reference, will be updated by the update function.
		
	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	// how many images does this spritesheet contain?
	//  usually equals tilesHoriz * tilesVert, but not necessarily,
	//  if there at blank tiles at the bottom of the spritesheet. 
	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
	texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

	// how long should each image be displayed?
	this.tileDisplayDuration = tileDispDuration;

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;
		
	this.update = function( milliSec )
	{
		this.currentDisplayTime += milliSec;
		while (this.currentDisplayTime > this.tileDisplayDuration)
		{
			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;
			if (this.currentTile == this.numberOfTiles)
				this.currentTile = 0;
			var currentColumn = this.currentTile % this.tilesHorizontal;
			texture.offset.x = currentColumn / this.tilesHorizontal;
			var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
			texture.offset.y = currentRow / this.tilesVertical;
		}
	};
}