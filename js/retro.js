// =====================================================
//  Efectos especiales de Sr. Robot Informática
//  JavaScript, la última novedad de Netscape 2.0
// =====================================================

// La etiqueta <blink> ya no parpadea en los navegadores
// modernos, así que la hacemos parpadear a mano.
function parpadear() {
  var lista = document.getElementsByTagName("blink");
  for (var i = 0; i < lista.length; i++) {
    lista[i].style.visibility = lista[i].style.visibility == "hidden" ? "visible" : "hidden";
  }
}
setInterval(parpadear, 500);

// Texto que se desplaza por la barra de estado
var textoEstado = "     *** Sr. Robot Informática *** ¡Ya tenemos Windows 95! *** Pentium 133 MHz en stock *** Financiación en 12 meses sin intereses ***     ";
var posEstado = 0;
function barraEstado() {
  window.status = textoEstado.substring(posEstado) + textoEstado.substring(0, posEstado);
  posEstado = (posEstado + 1) % textoEstado.length;
}
if (window.name == "menu") setInterval(barraEstado, 120);

// Contador de visitas "auténtico"
function contadorVisitas() {
  var base = 4711;
  var dias = Math.floor((new Date().getTime() - new Date(2026, 0, 1).getTime()) / 86400000);
  var propias = 1;
  try {
    propias = parseInt(localStorage.getItem("srrobot_visitas") || "0", 10) + 1;
    localStorage.setItem("srrobot_visitas", propias);
  } catch (e) {}
  var numero = String(base + Math.max(0, dias) * 7 + propias);
  while (numero.length < 6) numero = "0" + numero;
  for (var i = 0; i < numero.length; i++) {
    document.write('<img src="img/dig' + numero.charAt(i) + '.gif" width="16" height="25" alt="' + numero.charAt(i) + '">');
  }
}

function enConstruccion() {
  alert("Lo sentimos, esta sección todavía está en construcción.\n\nVuelva pronto.");
  return false;
}
