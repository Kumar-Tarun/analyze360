/*jslint plusplus: true, sloppy: true, indent: 4 */
(function () {
    "use strict";
    // this function is strict...
}());

var iCurrentSpeed = 1,
	iTargetSpeed = 1,
	bDecrement = null,
	job = null;

function degToRad(angle) {
	// Degrees to radians
	return ((angle * Math.PI) / 180);
}

function radToDeg(angle) {
	// Radians to degree
	return ((angle * 180) / Math.PI);
}

function drawLine(options, line) {
	// Draw a line using the line object passed in
	options.ctx.beginPath();

	// Set attributes of open
	options.ctx.globalAlpha = line.alpha;
	options.ctx.lineWidth = line.lineWidth;
	options.ctx.fillStyle = line.fillStyle;
	options.ctx.strokeStyle = line.fillStyle;
	options.ctx.moveTo(line.from.X,
		line.from.Y);

	// Plot the line
	options.ctx.lineTo(
		line.to.X,
		line.to.Y
	);

	options.ctx.stroke();
}

function createLine(fromX, fromY, toX, toY, fillStyle, lineWidth, alpha) {
	// Create a line object using Javascript object notation
	return {
		from: {
			X: fromX,
			Y: fromY
		},
		to:	{
			X: toX,
			Y: toY
		},
		fillStyle: fillStyle,
		lineWidth: lineWidth,
		alpha: alpha
	};
}

function applyDefaultContextSettings(options) {
	/* Helper function to revert to gauges
	 * default settings
	 */

	options.ctx.lineWidth = 2;
	options.ctx.globalAlpha = 0.5;
	options.ctx.strokeStyle = "rgb(255, 255, 255)";
	options.ctx.fillStyle = 'rgb(255,255,255)';
}

function drawTextMarkers(options) {
	var innerTickX = 0,
	    innerTickY = 0,
        iTick = 0,
        gaugeOptions = options.gaugeOptions,
        iTickToPrint = 1;

	applyDefaultContextSettings(options);

	// Font styling
	options.ctx.font = '22px Comic Sans MS';
	options.ctx.textBaseline = 'top';
	options.ctx.fillStyle = '#0D1107';
	options.ctx.beginPath();

	// Tick every 20 (small ticks)
	for (iTick = 0; iTick <= 180; iTick ++) {

		innerTickX = gaugeOptions.radius - (Math.cos(degToRad(iTick)) * gaugeOptions.radius);
		innerTickY = gaugeOptions.radius - (Math.sin(degToRad(iTick)) * gaugeOptions.radius);

		if (iTick == 0 ) {
			options.ctx.fillText(iTickToPrint.toString(), (options.center.X - gaugeOptions.radius - 12) + 35.54 + innerTickX,
					(gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY - 4);iTickToPrint +=1;
		} else if (iTick == 45) {
			options.ctx.fillText(iTickToPrint.toString(), (options.center.X - gaugeOptions.radius - 12) + 31.21 + innerTickX - 5,
					(gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY + 19.21);iTickToPrint +=1;
		} else if (iTick == 90) {
			options.ctx.fillText(iTickToPrint.toString(), (options.center.X - gaugeOptions.radius - 12) + innerTickX + 5,
					(gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY + 29);iTickToPrint +=1;
		} else if (iTick == 135) {
			options.ctx.fillText(iTickToPrint.toString(), (options.center.X - gaugeOptions.radius - 12) + innerTickX + 10 - 28.21,
					(gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY + 19.21);iTickToPrint +=1;
		}else if(iTick == 180){
			options.ctx.fillText(iTickToPrint.toString(), (options.center.X - gaugeOptions.radius - 12) + innerTickX + 15 - 39.24,
					(gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY - 4);iTickToPrint +=1;
		}
		
	}

    options.ctx.stroke();
}

function drawSpeedometerPart(options, alphaValue) {
	/* Draw part of the arc that represents
	* the colour speedometer arc
	*/

	options.ctx.beginPath();
var my_gradient=options.ctx.createLinearGradient(options.center.X-options.levelRadius,options.center.Y,options.center.X+options.levelRadius,options.center.Y);
	options.ctx.globalAlpha = alphaValue;
	options.ctx.lineWidth = 20;

	options.ctx.arc(options.center.X,
		options.center.Y,
		options.levelRadius,
		Math.PI, 2*Math.PI,
		false);
	my_gradient.addColorStop(0,"#d93240");
	my_gradient.addColorStop(0.5,"#bfd4d9");
	my_gradient.addColorStop(1,"#17a697");
	options.ctx.strokeStyle=my_gradient; 
	options.ctx.stroke();
}

function drawSpeedometerColourArc(options) {
	/* Draws the colour arc.  Three different colours
	 * used here; thus, same arc drawn 3 times with
	 * different colours.
	 * TODO: Gradient possible?
	 */

	drawSpeedometerPart(options, 1);

}

function drawNeedleDial(options, alphaValue, strokeStyle, fillStyle) {
	/* Draws the metallic dial that covers the base of the
	* needle.
	*/
    var i = 0;

	options.ctx.globalAlpha = alphaValue;
	options.ctx.lineWidth = 3;
	options.ctx.strokeStyle = strokeStyle;
	options.ctx.fillStyle = fillStyle;

	// Draw several transparent circles with alpha
	for (i = 2; i < 30; i++) {

		options.ctx.beginPath();
		options.ctx.arc(options.center.X,
			options.center.Y+3,
			i,
			Math.PI,
			2*Math.PI,
			false);

		options.ctx.fill();
		options.ctx.stroke();
	}
}

function convertSpeedToAngle(options) {
	/* Helper function to convert a speed to the 
	* equivelant angle.
	*/
	var iSpeed = options.speed,
	    iSpeedAsAngle = 4.5*iSpeed-45;

	// Ensure the angle is within range
	if (iSpeedAsAngle > 180) {
        iSpeedAsAngle = iSpeedAsAngle - 180;
    } else if (iSpeedAsAngle < 0) {
        iSpeedAsAngle = iSpeedAsAngle + 180;
    }

	return iSpeedAsAngle;
}

function drawNeedle(options) {
	/* Draw the needle in a nice read colour at the
	* angle that represents the options.speed value.
	*/

	var iSpeedAsAngle = convertSpeedToAngle(options),
	    iSpeedAsAngleRad = degToRad(iSpeedAsAngle),
        gaugeOptions = options.gaugeOptions,
        innerTickX = gaugeOptions.radius - (Math.cos(iSpeedAsAngleRad) * 20),
        innerTickY = gaugeOptions.radius - (Math.sin(iSpeedAsAngleRad) * 20),
        fromX = (options.center.X - gaugeOptions.radius) + innerTickX,
        fromY = (gaugeOptions.center.Y - gaugeOptions.radius) + innerTickY,
        endNeedleX = gaugeOptions.radius - (Math.cos(iSpeedAsAngleRad) * gaugeOptions.radius),
        endNeedleY = gaugeOptions.radius - (Math.sin(iSpeedAsAngleRad) * gaugeOptions.radius),
        toX = (options.center.X - gaugeOptions.radius) + endNeedleX,
        toY = (gaugeOptions.center.Y - gaugeOptions.radius) + endNeedleY,
        line = createLine(fromX, fromY, toX, toY, "rgb(0,0,0)", 5, 0.8);

	drawLine(options, line);

	// Two circle to draw the dial at the base (give its a nice effect?)
	drawNeedleDial(options, 0.6, "rgb(0, 0, 0)", "rgb(0,0,0)");
	drawNeedleDial(options, 0.6, "rgb(0, 0, 0)", "rgb(0,0,0)");

}

function buildOptionsAsJSON(canvas, iSpeed) {
	/* Setting for the speedometer 
	* Alter these to modify its look and feel
	*/

	var centerX = 220,
	    centerY = 190,
        radius = 160,
        outerRadius = 150;

	// Create a speedometer object using Javascript object notation
	return {
		ctx: canvas.getContext('2d'),
		speed: iSpeed,
		center:	{
			X: centerX,
			Y: centerY
		},
		levelRadius: radius - 10,
		gaugeOptions: {
			center:	{
				X: centerX,
				Y: centerY
			},
			radius: radius
		},
		radius: outerRadius
	};
}

function clearCanvas(options) {
	options.ctx.clearRect(0, 0, 800, 600);
	applyDefaultContextSettings(options);
}

function draw() {
	/* Main entry point for drawing the speedometer
	* If canvas is not support alert the user.
	*/
		
	console.log('Target: ' + iTargetSpeed);
	console.log('Current: ' + iCurrentSpeed);
	
	var canvas = document.getElementById('tutorial'),
	    options = null;

	// Canvas good?
	if (canvas !== null && canvas.getContext) {
		options = buildOptionsAsJSON(canvas, iCurrentSpeed);

	    // Clear canvas
	    clearCanvas(options);

		// Draw labels on markers
		drawTextMarkers(options);

		// Draw speeometer colour arc
		drawSpeedometerColourArc(options);

		// Draw the needle and base
		drawNeedle(options);
		
	} else {
		alert("Canvas not supported by your browser!");
	}
	
	if(iTargetSpeed == iCurrentSpeed) {
		clearTimeout(job);
		return;
	} else if(iTargetSpeed < iCurrentSpeed) {
		bDecrement = true;
	} else if(iTargetSpeed > iCurrentSpeed) {
		bDecrement = false;
	}
	
	if(bDecrement) {
		if(iCurrentSpeed - 10 < iTargetSpeed)
			iCurrentSpeed = iCurrentSpeed - 1;
		else
			iCurrentSpeed = iCurrentSpeed - 5;
	} else {
	
		if(iCurrentSpeed + 10 > iTargetSpeed)
			iCurrentSpeed = iCurrentSpeed + 1;
		else
			iCurrentSpeed = iCurrentSpeed + 5;
	}
	
	job = setTimeout("draw()", 5);
}

function drawWithInputValue(txtSpeed) {

	if (txtSpeed !== null) {

        iTargetSpeed = txtSpeed;

		// Sanity checks
		if (isNaN(iTargetSpeed)) {
			iTargetSpeed = 10;
		} else if (iTargetSpeed < 10) {
			iTargetSpeed = 10;
		} else if (iTargetSpeed > 50) {
			iTargetSpeed = 50;
        }

        job = setTimeout("draw()", 5);
 
    }
}
