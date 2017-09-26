     $(function () {
  $.srSmoothscroll({
    // defaults
    step: 55,
    speed: 400,
    ease: 'swing',
    target: $('body'),
    container: $(window)
  })
})
     var button=document.getElementById("n");
    button.addEventListener("click",function() {
         var value1=$("#custom-handle").text();
         var value=jQuery("#o").val();
           if(value.length==0)
           alert("Please enter a valid query");
           else {
               if($("#e").length>0)
               $("#e").remove();
               if($("#s").length>0)
               {
                 $("#s").remove();
                 $(".plot-container plotly").remove();
               }  
              if($("#q").length>0)
              {
                $("#q").remove();
                document.getElementById("k").style.visibility="hidden";
                document.getElementById("i").style.visibility="hidden";
              }
             if($(".rm").length>0)
             {
             $(".rm").remove();
             document.getElementById("notes").style.visibility="hidden";
             document.getElementById("y").style.visibility="hidden";
             document.getElementById("map").style.visibility="hidden";
             document.getElementById("x").style.visibility="hidden";
             document.getElementById("dd").style.visibility="hidden";
             document.getElementById("z").style.visibility="hidden";
             document.getElementById("ds").style.visibility="hidden";
             document.getElementById("da").style.visibility="hidden";
             }
             if($(".tex").length>0)
             {
                 $(".tex").remove();
                 $(".tex1").remove();
                 document.getElementById("t").style.visibility="hidden";
             }
             if($("#w").length>0)
             {
                $("#w").remove();
                $(".s").remove();
             }
                 
       jQuery.getJSON(Flask.url_for("search"),{query: value, max: value1})
        .done(function(data,textStatus,jqXHR){
            if('ok' in data && data.ok=="not found")
            {
            var q=document.getElementById("c");
            q.insertAdjacentHTML('afterbegin','<p id="e">No tweets found <i class="fa fa-frown-o"></i></p>');
            }
            else {
            draw_chart(data.positive,data.neutral,data.negative);
            var a=document.getElementById("l");
            a.insertAdjacentHTML('beforeend', '<p id="q">&nbsp;POSITIVE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;NEUTRAL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;NEGATIVE</p>');
            document.getElementById("k").style.visibility="visible";
            draw_date(data.dates);
            document.getElementById("da").style.visibility="visible";
            document.getElementById("dd").style.visibility="visible";
            draw(0);
            drawWithInputValue(data.percentage*10);
            document.getElementById("i").style.visibility="visible";
            draw_map(data.loc,data.cdata);
            document.getElementById("y").style.visibility="visible";
            document.getElementById("map").style.visibility="visible";
            document.getElementById("z").style.visibility="visible";
            document.getElementById("ds").style.visibility="visible";
            var x=document.getElementsByClassName("noteg green rounded");
            x[0].insertAdjacentHTML('beforeend', '<p class="rm">POSITIVE &nbsp;&nbsp;<i class="fa fa-smile-o"></i></p><p class="rm">'+data.count[0]+'</p>');
            var y=document.getElementsByClassName("notey yellow rounded");
            y[0].insertAdjacentHTML('beforeend', '<p class="rm">NEUTRAL &nbsp;&nbsp;<i class="fa fa-meh-o"></i></p><p class="rm">'+data.count[1]+'</p>');
            var z=document.getElementsByClassName("noter red rounded");
            z[0].insertAdjacentHTML('beforeend', '<p class="rm">NEGATIVE &nbsp;&nbsp;<i class="fa fa-frown-o"></i></p><p class="rm">'+data.count[2]+'</p>');
            document.getElementById("notes").style.visibility="visible";
            var b=document.getElementById("t");
            b.insertAdjacentHTML('beforeend','<p class="tex">'+data.total_count+'</p><p class="tex1">tweets</p>');
            document.getElementById("t").style.visibility="visible";
            var c=document.getElementById("i");
            var d=document.getElementById("x");
            d.insertAdjacentHTML('beforeend','<p class="s">"'+data.most_recent[0]+'"</p><p class="s">'+data.most_recent[1]+'</p><br>');
            document.getElementById("x").style.visibility="visible";
            if(data.percentage<3.0)
            c.insertAdjacentHTML('beforeend','<p id="w">'+data.percentage+'&nbsp;&nbsp;NEGATIVE&nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-thumbs-down"></span></p><br>');
            else if(data.percentage==3.0)
            c.insertAdjacentHTML('beforeend','<p id="w">'+data.percentage+'&nbsp;&nbsp;NEUTRAL&nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-hand-right"></span></p>');
            else
            c.insertAdjacentHTML('beforeend','<p id="w">'+data.percentage+'&nbsp;&nbsp;POSITIVE&nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-thumbs-up"></span></p>');
            }
        })
        .fail(function(jqXHR,textStatus,error){
            var err=textStatus + ", " + error;
            console.log("Request Failed: "+err);
        });
       }
              });
              



