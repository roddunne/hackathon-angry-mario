/* Based on ball_pool/Main.js by mr.doob */

var canvas;

var delta = [ 0, 0 ];
var stage = [ window.screenX, window.screenY, window.innerWidth, window.innerHeight ];
getBrowserDimensions();

var themes = [ [ "#10222B", "#95AB63", "#BDD684", "#E2F0D6", "#F6FFE0" ],
        [ "#362C2A", "#732420", "#BF734C", "#FAD9A0", "#736859" ],
        [ "#0D1114", "#102C2E", "#695F4C", "#EBBC5E", "#FFFBB8" ],
        [ "#2E2F38", "#FFD63E", "#FFB54B", "#E88638", "#8A221C" ],
        [ "#121212", "#E6F2DA", "#C9F24B", "#4D7B85", "#23383D" ],
        [ "#343F40", "#736751", "#F2D7B6", "#BFAC95", "#8C3F3F" ],
        [ "#000000", "#2D2B2A", "#561812", "#B81111", "#FFFFFF" ],
        [ "#333B3A", "#B4BD51", "#543B38", "#61594D", "#B8925A" ] ];
var theme;


var avatarBody;
var avatarColor = "#FF0000";
var wallColor = "#228B22";
var enemyColor = "#1E90FF";

var worldAABB, world, iterations = 1, timeStep = 1 / 40;

var walls = [];
var wall_thickness = 5000;
var wallsSetted = false;

var bodies, elements, text;

var createMode = false;
var destroyMode = false;

var isMouseDown = false;
var mouseJoint;
var mouseX = 0;
var mouseY = 0;

var PI2 = Math.PI * 2;

var timeOfLastTouch = 0;

// Slinghshot stuff
var ssX = 150;
var ssH = 300;
var ssNearX = ssX + 66;
var ssNearY; // see reset
var ssFarX = ssX + 130;
var ssFarY; // see reset
var ssMidX; // see reset
var ssMidY; // see reset

var maxLevel = 2;
var level = maxLevel;

init();
play();

function init() {

    canvas = document.getElementById( 'canvas' );

    document.onmousedown = onDocumentMouseDown;
    document.onmouseup = onDocumentMouseUp;
    document.onmousemove = onDocumentMouseMove;
    document.ondblclick = onDocumentDoubleClick;

    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );
    document.addEventListener( 'touchend', onDocumentTouchEnd, false );

    // init box2d

    worldAABB = new b2AABB();
    worldAABB.minVertex.Set( -200, -200 );
    worldAABB.maxVertex.Set( screen.width + 200, screen.height + 200 );

    world = new b2World( worldAABB, new b2Vec2( 0, 0 ), true );

    setWalls();
//    createSlingshotCanvas();
    reset();
}

function play() {

    setInterval( loop, 1000 / 40 );
}

function reset() {

    var i;

    if ( bodies ) {

        for ( i = 0; i < bodies.length; i++ ) {

            var body = bodies[ i ]
            canvas.removeChild( body.GetUserData().element );
            world.DestroyBody( body );
            body = null;
        }
    }

    // color theme
    theme = themes[ Math.random() * themes.length >> 0 ];
    document.body.style[ 'backgroundColor' ] = "#000000";

    bodies = [];
    elements = [];

	ssNearY = stage[3] - ssH + 35;
	ssFarY = stage[3] - ssH + 12;
	ssMidX = (ssNearX + ssFarX) / 2;
	ssMidY = (ssNearY + ssFarY) / 2;
	

	var h = 100;
	var h2 = 115;

    createRect(800 + (50/2), stage[3] - (h2/2), 50,h2);
    createRect(850 + (250/2), stage[3] - (h/2), 250, h);
    createRect(1100 + (50/2), stage[3] - (h2/2), 50, h2);

    createAvatar(ssMidX, ssMidY);

	
	if (maxLevel < ++level) level = 0;
	if (level == 0) {
		var h = 100;
		var h2 = 90;

		createRect(800 + (50/2), stage[3] - (h2/2), 50, h2);
		createRect(850 + (250/2), stage[3] - (h/2), 250, h);
		createRect(1100 + (50/2), stage[3] - (h2/2), 50, h2);
		
		createBall(900, stage[3] - h - 50/2);
		createBall(975, stage[3] - h - 50/2);
		createBall(1050, stage[3] - h - 50/2);
	} else if (level == 1) {
		var h = 100;
		var h2 = 110;

		createRect(800 + (50/2), stage[3] - (h2/2), 50, h2);
		createRect(850 + (250/2), stage[3] - (h/2), 250, h);
		createRect(1100 + (50/2), stage[3] - (h2/2), 50, h2);
		
		createBall(900, stage[3] - h - 50/2);
		createBall(975, stage[3] - h - 50/2);
		createBall(1050, stage[3] - h - 50/2);
	} else if (level == 2) {
		var h = 100;
		var h2 = 120;

		createRect(800 + (50/2), stage[3] - (h2/2), 50, h2);
		createRect(850 + (250/2), stage[3] - (h/2), 250, h);
		createRect(1100 + (50/2), stage[3] - (h2/2), 50, h2);
		
		createBall(900, stage[3] - h - 50/2);
		createBall(975, stage[3] - h - 50/2);
		createBall(1050, stage[3] - h - 50/2);
	}
}

function createSlingshotCanvas() {
    var element = document.createElement("canvas");
    element.setAttribute("id", "slingshot-canvas");
    element.width = stage[2]/3;
    element.height = stage[3];
//    element.style['bottom'] = '0px';
    element.style['position'] = 'absolute';
    element.style['z-index'] = -6;
//    element.style['left'] = -200 + 'px';
//    element.style['top'] = -200 + 'px';

    var graphics = element.getContext("2d");

    graphics.fillStyle = 'black';
    graphics.fillRect(0, 0, stage[2], stage[3]);
    
    element.addEventListener('mousemove', mouseOverCanvas, false);
    document.getElementById('canvas').appendChild(element);
    
}

function mouseOverCanvas(event) {
	var graphics = document.getElementById('slingshot-canvas').getContext("2d");
	graphics.fillStyle = 'black';
	graphics.fillRect(0, 0, stage[2], stage[3]);
	var x = event.pageX;
	var y = event.pageY;
	
	graphics.strokeStyle = 'white';
    	graphics.beginPath();
    	graphics.moveTo(ssNearX, ssNearY);
    	graphics.lineTo(x, y);
    	graphics.stroke();

    	graphics.moveTo(ssFarX, ssFarY);
    	graphics.lineTo(x, y);
    	graphics.stroke();
}

//
var avatarMouseDownX;
var avatarMouseDownY;
function onDocumentMouseDown(event) {

	var body = getBodyAtMouse();
	if (body == avatarBody)
	{
		dontSpinWhenGrabbedFlag = false;
		avatarMouseDownX = event.clientX;
		avatarMouseDownY = event.clientY;
	}

    isMouseDown = true;
    return false;
}
var dontSpinWhenGrabbedFlag = false;
function onDocumentMouseUp(event) {

	var body = getBodyAtMouse();
	if (body == avatarBody)
	{
		dontSpinWhenGrabbedFlag = true;
		//var hackedForceX = (avatarMouseDownX - event.clientX) * 10000;
		//var hackedForceY = (avatarMouseDownY - event.clientY) * 10000;
		//var hackedForce = new b2Vec2(hackedForceX, hackedForceY ); 
		//var mouseDownPoint = new b2Vec2(avatarMouseDownX, avatarMouseDownY);

		var hackedForceX = (ssMidX - event.clientX) * 5000;
		var hackedForceY = (ssMidY - event.clientY) * 5000;
		var hackedForce = new b2Vec2(hackedForceX, hackedForceY ); 
		var pointOfLaunch = new b2Vec2(ssMidX, ssMidY); 
		body.ApplyImpulse(hackedForce, pointOfLaunch);
	}

    isMouseDown = false;
    return false;
}

function onDocumentMouseMove( event ) {

    mouseX = event.clientX;
    mouseY = event.clientY;
}

function onDocumentDoubleClick() {

    reset();
}

function onDocumentTouchStart( event ) {

    if( event.touches.length == 1 ) {

        event.preventDefault();

        // Faking double click for touch devices

        var now = new Date().getTime();

        if ( now - timeOfLastTouch  < 250 ) {

            reset();
            return;
        }

        timeOfLastTouch = now;

        mouseX = event.touches[ 0 ].pageX;
        mouseY = event.touches[ 0 ].pageY;
        isMouseDown = true;
    }
}

function onDocumentTouchMove( event ) {

    if ( event.touches.length == 1 ) {

        event.preventDefault();

        mouseX = event.touches[ 0 ].pageX;
        mouseY = event.touches[ 0 ].pageY;

    }

}

function onDocumentTouchEnd( event ) {

    if ( event.touches.length == 0 ) {

        event.preventDefault();
        isMouseDown = false;

    }

}

//

function createAvatar( x, y ) {

    var size = 50;

    var element = document.createElement( 'div' );
    element.width = size;
    element.height = size;  
    element.style.position = 'absolute';
    element.style.left = 0 + 'px';
    element.style.top = 0 + 'px';
    element.style.cursor = "default";

    canvas.appendChild(element);
    elements.push( element );

    var circle = document.createElement( 'canvas' );
    circle.width = size;
    circle.height = size;

    var graphics = circle.getContext( '2d' );

	var image = document.getElementById("mario");
	graphics.drawImage(image, 0, 0);
    //graphics.fillStyle = avatarColor;
    //graphics.beginPath();
    //graphics.arc( size * .5, size * .5, size * .5, 0, PI2, true );
    //graphics.closePath();
    //graphics.fill();

    element.appendChild( circle );

	/*
    text = document.createElement( 'div' );
    text.onSelectStart = null;
    text.innerHTML = '<span style="color:yellow;font-size:12px;">ANGRY!</span>';
    text.style.color = theme[1];
    text.style.position = 'absolute';
    text.style.left = '0px';
    text.style.top = '0px';
    text.style.fontFamily = 'Georgia';
    text.style.textAlign = 'center';
    element.appendChild(text);

    text.style.left = ((size - text.clientWidth) / 2) +'px';
    text.style.top = ((size - text.clientHeight) / 2) +'px'; 
	*/

    var b2body = new b2BodyDef();

    var circle = new b2CircleDef();
    circle.radius = size / 2;
    circle.density = 0.3;
    circle.friction = 0.3;
    circle.restitution = 0.3;
    b2body.AddShape(circle);
    b2body.userData = {element: element};

    b2body.position.Set(x, y);
    //b2body.linearVelocity.Set( Math.random() * 400 - 200, Math.random() * 400 - 200 );
	avatarBody	= world.CreateBody(b2body);
    bodies.push(avatarBody ); 
	// hack -remember the avatar so we can distinguish it in mouse hit tests
}

function createBall( x, y, size ) {

    var x = x || Math.random() * stage[2];
    var y = y || Math.random() * -200;

    var size = size || 50;

    var element = document.createElement("canvas");
    element.width = size;
    element.height = size;
    element.style['position'] = 'absolute';
    element.style['left'] = -200 + 'px';
    element.style['top'] = -200 + 'px';

    var graphics = element.getContext("2d");

    var num_circles = Math.random() * 10 >> 0;

	var image = document.getElementById("peach");
	graphics.drawImage(image, 0, 0);
    //graphics.fillStyle = enemyColor;
    //graphics.beginPath();
    //graphics.arc( size * .5, size * .5, size * .5, 0, PI2, true );
    //graphics.closePath();
    //graphics.fill();
	
    canvas.appendChild(element);

    elements.push( element );

    var b2body = new b2BodyDef();

    var circle = new b2CircleDef();
    circle.radius = size >> 1;
    circle.density = 0.0001;
    circle.friction = 0.3;
    circle.restitution = 0.3;
    b2body.AddShape(circle);
    b2body.userData = {element: element};

    b2body.position.Set( x, y );
    //b2body.linearVelocity.Set( Math.random() * 400 - 200, Math.random() * 400 - 200 );
    bodies.push( world.CreateBody(b2body) );
}

function createRect( x, y, w, h ) {

    var x = x || Math.random() * stage[2];
    var y = y || Math.random() * -200;
	
	var w = w || 50;
	var h = h || 150;

    var element = document.createElement("canvas");
    element.width = w;
    element.height = h;
    element.style['position'] = 'absolute';
    element.style['left'] = -200 + 'px';
    element.style['top'] = -200 + 'px';

    var graphics = element.getContext("2d");

    var num_circles = Math.random() * 10 >> 0;

    graphics.fillStyle = wallColor;
    graphics.fillRect(0, 0, w, h);

    canvas.appendChild(element);

    elements.push( element );

    var b2body = new b2BodyDef();

    var square = new b2BoxDef();
	square.extents.Set(w/2, h/2);
    square.density = 0;
    square.friction = 0.3;
    square.restitution = 0.3;
    b2body.AddShape(square);
    b2body.userData = {element: element};

    b2body.position.Set( x, y );
    //b2body.linearVelocity.Set( Math.random() * 400 - 200, Math.random() * 400 - 200 );
    bodies.push( world.CreateBody(b2body) );
}

//

function loop() {

    if (getBrowserDimensions()) {

        setWalls();

    }

    delta[0] += (0 - delta[0]) * .5;
    delta[1] += (0 - delta[1]) * .5;

    world.m_gravity.x = 0 + delta[0];
    world.m_gravity.y = 350 + delta[1];

    mouseDrag();
    world.Step(timeStep, iterations);

    for (i = 0; i < bodies.length; i++) {

        var body = bodies[i];
        var element = elements[i];

        element.style.left = (body.m_position0.x - (element.width >> 1)) + 'px';
        element.style.top = (body.m_position0.y - (element.height >> 1)) + 'px';

		if (dontSpinWhenGrabbedFlag)
		{
			//if (element.tagName == 'DIV') {
			{
				var rotationStyle = 'rotate(' + (body.m_rotation0 * 57.2957795) + 'deg)';
				element.style.WebkitTransform = rotationStyle;
				element.style.MozTransform = rotationStyle;
				element.style.OTransform = rotationStyle;
				// text.style.MsTransform = rotationStyle;

			}
		}

    }

}


// .. BOX2D UTILS

function createBox(world, x, y, width, height, fixed) {

    if (typeof(fixed) == 'undefined') {

        fixed = true;

    }

    var boxSd = new b2BoxDef();

    if (!fixed) {

        boxSd.density = 1.0;

    }

    boxSd.extents.Set(width, height);

    var boxBd = new b2BodyDef();
    boxBd.AddShape(boxSd);
    boxBd.position.Set(x,y);

    return world.CreateBody(boxBd);

}

function mouseDrag()
{
    // mouse press
    if (createMode) 
	{

        createBall( mouseX, mouseY );

    } 
	else if (isMouseDown && !mouseJoint) 
	{

        var body = getBodyAtMouse();

        if (body) {

			// Checking for only the avatar here, prevents the user from mouse
			// manipulating the other balls etc
			if (body == avatarBody) 
			{
				var md = new b2MouseJointDef();
				md.body1 = world.m_groundBody;
				md.body2 = body;
				md.target.Set(mouseX, mouseY);
				md.maxForce = 30000 * body.m_mass;
				md.timeStep = timeStep;
				mouseJoint = world.CreateJoint(md);
				body.WakeUp();
				}

        } else {


            createMode = false;

        }

    }

	
	
    // mouse release
    if (!isMouseDown) {

        createMode = false;
        destroyMode = false;

        if (mouseJoint) {

            world.DestroyJoint(mouseJoint);
            mouseJoint = null;

        }

    }

    // mouse move
    if (mouseJoint) {

        var p2 = new b2Vec2(mouseX, mouseY);
        mouseJoint.SetTarget(p2);
    }
}

function getBodyAtMouse() {

    // Make a small box.
    var mousePVec = new b2Vec2();
    mousePVec.Set(mouseX, mouseY);

    var aabb = new b2AABB();
    aabb.minVertex.Set(mouseX - 1, mouseY - 1);
    aabb.maxVertex.Set(mouseX + 1, mouseY + 1);

    // Query the world for overlapping shapes.
    var k_maxCount = 10;
    var shapes = new Array();
    var count = world.Query(aabb, shapes, k_maxCount);
    var body = null;

    for (var i = 0; i < count; ++i) {

        if (shapes[i].m_body.IsStatic() == false) {

            if ( shapes[i].TestPoint(mousePVec) ) {

                body = shapes[i].m_body;
                break;

            }

        }

    }

    return body;

}

function setWalls() {

    if (wallsSetted) {

        world.DestroyBody(walls[0]);
        world.DestroyBody(walls[1]);
        world.DestroyBody(walls[2]);
        world.DestroyBody(walls[3]);

        walls[0] = null; 
        walls[1] = null;
        walls[2] = null;
        walls[3] = null;
    }

    walls[0] = createBox(world, stage[2] / 2, - wall_thickness, stage[2], wall_thickness);
    walls[1] = createBox(world, stage[2] / 2, stage[3] + wall_thickness, stage[2], wall_thickness);
    walls[2] = createBox(world, - wall_thickness, stage[3] / 2, wall_thickness, stage[3]);
    walls[3] = createBox(world, stage[2] + wall_thickness, stage[3] / 2, wall_thickness, stage[3]); 

    wallsSetted = true;

}

// BROWSER DIMENSIONS

function getBrowserDimensions() {

    var changed = false;

    if (stage[0] != window.screenX) {

        delta[0] = (window.screenX - stage[0]) * 50;
        stage[0] = window.screenX;
        changed = true;

    }

    if (stage[1] != window.screenY) {

        delta[1] = (window.screenY - stage[1]) * 50;
        stage[1] = window.screenY;
        changed = true;

    }

    if (stage[2] != window.innerWidth) {

        stage[2] = window.innerWidth;
        changed = true;

    }

    if (stage[3] != window.innerHeight) {

        stage[3] = window.innerHeight;
        changed = true;

    }

    return changed;

}