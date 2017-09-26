    var handle = $( "#custom-handle" );
    $( "#slider" ).slider({
    max:500,
    min:100,
    range:"min",
    step:10,
      create: function() {
        handle.text( $( this ).slider( "value" ) );
      },
      slide: function( event, ui ) {
        handle.text( ui.value );
         $( "#slider .ui-slider-range" ).css( "background-color", "#205eb6");
      },
      change:function(){
       $( "#slider .ui-slider-range" ).css( "background-color", "#205eb6");
       }
    });
