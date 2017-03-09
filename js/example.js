// TOOLS VARS
var viewerSection = document.getElementById('viewer');
var materials = {};

// GUI VARS
var selectedItemIndex;
var items = document.getElementsByClassName("mesh-item");
var form = document.getElementById("mesh-form");
var table = $('#meshes-table tbody');

// DATA VARS

var tool = ViewerTool.viewer;
tool.init(viewerSection);


//loadData();


document.getElementById('grid-check').addEventListener('change', function(e){
  tool.toggleGrid(this.checked);
})

$('#btn-export').on('click', function(){
  tool.exportToObj.call(tool);
});

var actionInterval;
var isMouseDown;
var previousMousePosition;
$('#btn-rotate-left').click(function(){
  tool.rotate.call(tool, -0.4);
});


$('#btn-rotate-right').click(function(){
  tool.rotate.call(tool, 0.4);
});

$('#btn-zoom-in').click(function(){
  tool.zoom.call(tool, -1);
});

$('#btn-zoom-out').click(function(){
  tool.zoom.call(tool, 2);
});



$(viewerSection).mousemove(function(e){
  if (isMouseDown){
    var deltaMove = {
      x: e.offsetX - previousMousePosition.x,
      y: e.offsetY - previousMousePosition.y,
    }
    viewer.moveCamera(deltaMove);
  }

  previousMousePosition = {
    x: e.offsetX,
    y: e.offsetY
  }
}).mousedown(function(){
  isMouseDown = true;
}).mouseup(function(){
  isMouseDown = false;
});



$('#meshes-table tbody').on('change', 'tr td input, tr td select', updateMesh);
$('#btn-load').on('click', loadData);


function loadData(){
  $('#alert-load').alert('close')
  var link = $('#input-spreadsheet').val();
  var match = new RegExp("d\/(.*)\/").exec(link);
  if (!match){
    $(this).before(
      '<div id="alert-load" class="alert alert-danger fade in" role="alert">'+
      '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>' +
      '<h4>Error al cargar los datos!</h4>' +
      '<p>Compruebe que el link ingresado es correcto.</p>'+
      '<p>Recuerde que debe ser publicado a la web (Archivo -> Publicar a la Web).</p>'+
    '</div>')
    return false;
  }
  var url = "https://spreadsheets.google.com/feeds/list/" +
            match[1] +
            "/od6/public/basic?alt=json";
  $.get({
    url: url,
    success: function(response) {
      var len = response.feed.entry.length;
      var parsedData = [];
      var data = response.feed.entry;
      for (var i = 0; i < len; i++) {
        var obj = data[i].content.$t.split(', ')
        // ignore column 1, is empty
        if (obj.length >= 9){
          parsedData.push({
            name: obj[0].split(':')[1],
            l: parseFloat(obj[1].split(':')[1].replace(',', '.')),
            w: parseFloat(obj[2].split(':')[1].replace(',', '.')),
            h: parseFloat(obj[3].split(':')[1].replace(',', '.')),
            orientation: parseInt(obj[4].split(':')[1]),
            color: '0x' + obj[5].split(':')[1].replace(' ', ''),
            y: parseFloat(obj[6].split(':')[1].replace(',', '.')),
            x: parseFloat(obj[7].split(':')[1].replace(',', '.')),
            z: parseFloat(obj[8].split(':')[1].replace(',', '.')),
          });
        }
        else{
          if (obj.length > 1){
            console.log(data[i].title.$t + " is missing data.");
          }
        }
      }
      updateMeshList(parsedData);
      tool.createPieces(parsedData);
    }
  });
}

function updateMesh(evt){
  var row = $(evt.target.parentElement.parentElement).children();
  newData = {};
  index = $(row[0]).html() - 1;
  newData.tag = $(row[1]).find('input').val();
  newData.w = parseInt($(row[2]).find('input').val());
  newData.h = parseInt($(row[3]).find('input').val());
  newData.l = parseInt($(row[4]).find('input').val());
  newData.x = parseInt($(row[5]).find('input').val());
  newData.y = parseInt($(row[6]).find('input').val());
  newData.z = parseInt($(row[7]).find('input').val());
  var color = $(row[8]).find('input').val();
  newData.color = '0x' + color.replace(/[ #]/g, '');
  newData.orientation = parseInt($(row[9]).find('select').val());
  tool.updateMesh(index, newData);

}

function updateMeshList(data){
  for (var i = 0; i < data.length; i++) {
    console.log(i ,data[i]);
    var html = '<tr>' +
        '<td>'+(i+1)+'</td><td><input type="text" size="10" maxlength="6" value="'+data[i].name+'"></td>'+
        '<td><input type="number" size="1" step="0.1" value="'+data[i].w+'"></td>' +
        '<td><input type="number" size="1" step="0.1" value="'+data[i].h+'"></td>' +
        '<td><input type="number" size="1" step="0.1" value="'+data[i].l+'"></td>' +
        '<td><input type="number" size="1" step="0.1" value="'+data[i].x+'"></td>' +
        '<td><input type="number" size="1" step="0.1" value="'+data[i].y+'"></td>' +
        '<td><input type="number" size="1" step="0.1" value="'+data[i].z+'"></td>' +
        '<td><input type="color" name="color" value="'+data[i].color.replace('0x', '#')+'">'+
        '<td><select>' +
        '<option value="1" '+ (data[i].orientation==1 ? 'selected' : '') +'> Vertical de corte </option>' +
        '<option value="2" '+ (data[i].orientation==2 ? 'selected' : '') +'> Horizontal de corte </option>' +
        '<option value="3" '+ (data[i].orientation==3 ? 'selected' : '') +'> Vertical de frente </option>' +
        '<option value="4" '+ (data[i].orientation==4 ? 'selected' : '') +'> Horizontal de frente </option>' +
        '</select>';
    html += '</td></tr>';
    table.append(html);
  }
}
