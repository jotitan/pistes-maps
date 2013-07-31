<html>


<head>
<script src="js/jquery-1.9.0.min.js" language="Javascript">;</script>
</head>


<body>


<div id="result"></div>

<script language="Javascript">

var ColoGenerator = {
	canvas:null,
	getColorShape:function(color){
		var context = this.canvas.getContext("2d");
		context.fillStyle = "#" + color;
		context.beginPath();
		context.moveTo(0,20);
		context.lineTo(5,8);
		context.lineTo(10,13);
		context.lineTo(15,2);
		context.lineTo(20,20);	
		context.closePath();
		context.fill();
		return this.canvas.toDataURL();
	},
	init:function(){
		var div = $('<div><canvas width="20px" height="20px"></canvas></div>');
		$('body').append(div);
		this.canvas = $('canvas',div).get(0);
		return this;	
	}
}.init();


<?
echo "ColoGenerator.getColorShape('" . $_GET['color'] . "');";
?>

</script>


</body>



</html>



<?php





?>
