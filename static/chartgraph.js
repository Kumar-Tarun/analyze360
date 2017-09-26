function draw_date(data)
{
  var parseDate = d3.timeParse("%Y-%m-%d");
  var dates=Object.keys(data);
  var pos=[],n=[],neg=[];
  for(i in data)
  {
    pos.push(data[i][1]);
    n.push(data[i][2]);
    neg.push(data[i][3]);
  }
  for (var a=0;a<dates.length;a++)
  {
    dates[a]=parseDate(dates[a]);
  }
var trace1 = {
  x: dates,
  y: pos,
  mode: 'lines',
  name: 'Positive',
  line: {
    color: '#17A697',
    width: 3
  }
};

var trace2 = {
  x: dates,
  y: n,
  mode: 'lines',
  name: 'Neutral',
  line: {
    color: '#BFD4D9',
    width: 3
  }
};

var trace3 = {
  x: dates,
  y: neg,
  mode: 'lines',
  name: 'Negative',
  line: {
    color: '#D93240',
    width: 3
  }
};
var layout = {
  paper_bgcolor: '#f6f6f6',
  plot_bgcolor: '#f6f6f6'
};
var dat = [ trace1, trace2, trace3 ];

Plotly.newPlot('dd', dat, layout);
}
