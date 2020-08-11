function burggerMenuFunction() {
  var x = document.getElementById('myLinks');
  if (x.style.display === 'block') {
    x.style.display = 'none';
  } else {
    x.style.display = 'block';
  }
}

$(document).ready(function () {
  $('#filltre').on('change', function () {
    var elems = this.value == 'all' ? $('.bookSec') : $('.bookSec[data-type="'+this.value+'"]');
    $('.bookSec').not(elems.show()).hide();
  });
});
