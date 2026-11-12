const PRODUCTS = {
  mini: {id:'mini', name:'SafePill Mini', price:499, image:'assets/safepill-mini.jpg', desc:'Diseño compacto para una rutina sencilla.'},
  pro: {id:'pro', name:'SafePill Pro', price:799, image:'assets/safepill-pro.jpg', desc:'Mayor capacidad y pantalla conceptual.'},
  premium: {id:'premium', name:'SafePill Premium', price:1199, image:'assets/safepill-premium.jpg', desc:'Diseño amplio para explorar funciones futuras.'}
};
const money = value => '$' + value.toLocaleString('es-MX') + ' MXN';
let cart = JSON.parse(localStorage.getItem('safepill-demo-cart') || '{}');
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const saveCart = () => localStorage.setItem('safepill-demo-cart', JSON.stringify(cart));
const countCart = () => Object.values(cart).reduce((sum, qty) => sum + qty, 0);
const totalCart = () => Object.entries(cart).reduce((sum,[id,qty]) => sum + PRODUCTS[id].price * qty, 0);
$('#year').textContent = new Date().getFullYear();

function toast(message) {
  const el = $('#toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 2500);
}
function openOverlay(id) { const el = document.getElementById(id); el.classList.add('open'); el.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
function closeOverlay(id) { const el = document.getElementById(id); el.classList.remove('open'); el.setAttribute('aria-hidden','true'); if (!$('.overlay.open')) document.body.style.overflow=''; }
$$('[data-close]').forEach(btn => btn.addEventListener('click', () => closeOverlay(btn.dataset.close)));
$$('.overlay').forEach(overlay => overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(overlay.id); }));
document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.overlay.open').forEach(o => closeOverlay(o.id)); });

function renderCart() {
  const count = countCart();
  $('#cartCount').textContent = count; $('#shopCount').textContent = count;
  const area = $('#cartItems');
  if (!count) area.innerHTML = '<div class="empty-cart">Tu carrito está vacío.<br>Explora los modelos y agrega el que te interese. 💚</div>';
  else area.innerHTML = Object.entries(cart).map(([id,qty]) => {
    const p=PRODUCTS[id]; return `<div class="cart-line"><img src="${p.image}" alt=""><div><b>${p.name}</b><small>${money(p.price)} · Precio de demostración</small><div class="quantity"><button data-qty="${id}" data-delta="-1" aria-label="Disminuir">−</button><span>${qty}</span><button data-qty="${id}" data-delta="1" aria-label="Aumentar">+</button></div></div><div><div class="line-price">${money(p.price*qty)}</div><button class="remove-line" data-remove="${id}" aria-label="Eliminar">×</button></div></div>`;
  }).join('');
  $('#cartSubtotal').textContent = money(totalCart());
  area.querySelectorAll('[data-qty]').forEach(b => b.addEventListener('click',()=>changeQty(b.dataset.qty,Number(b.dataset.delta))));
  area.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click',()=>{delete cart[b.dataset.remove];saveCart();renderCart();toast('Producto eliminado');}));
}
function changeQty(id, delta) { cart[id]=(cart[id]||0)+delta; if(cart[id]<=0) delete cart[id]; saveCart(); renderCart(); }
function addToCart(id) { cart[id]=(cart[id]||0)+1; saveCart(); renderCart(); toast(`${PRODUCTS[id].name} se agregó al carrito`); }
$$('.add-cart').forEach(b=>b.addEventListener('click',()=>addToCart(b.dataset.id)));
$('#openCart').addEventListener('click',()=>openOverlay('cartOverlay'));
$('#shopCartButton').addEventListener('click',()=>openOverlay('cartOverlay'));
$('#checkoutButton').addEventListener('click',()=>{ if(!countCart()){toast('Agrega un modelo antes de continuar');return;} closeOverlay('cartOverlay'); renderCheckoutSummary(); openOverlay('checkoutOverlay'); });
function renderCheckoutSummary() {
  $('#checkoutSummary').innerHTML = Object.entries(cart).map(([id,qty])=>`<div><span>${PRODUCTS[id].name} × ${qty}</span><b>${money(PRODUCTS[id].price*qty)}</b></div>`).join('')+`<div class="sum-total"><span>Total estimado</span><b>${money(totalCart())}</b></div>`;
}
$$('[data-open-contact]').forEach(b=>b.addEventListener('click',()=>openOverlay('contactOverlay')));
$('#contactForm').addEventListener('submit',e=>{
  e.preventDefault(); const d=new FormData(e.currentTarget);
  const subject=encodeURIComponent('Consulta sobre SafePill — '+d.get('topic'));
  const body=encodeURIComponent(`Hola, soy ${d.get('name')} (${d.get('email')}).\n\nTema: ${d.get('topic')}\n\n${d.get('message')}\n\nEnviado desde la demostración web de SafePill.`);
  // Replace this placeholder with the team's official mailbox when one is created.
  window.location.href=`mailto:?subject=${subject}&body=${body}`;
  toast('Se preparó el correo en tu aplicación predeterminada.');
});
$('#checkoutForm').addEventListener('submit',e=>{
  e.preventDefault(); const d=new FormData(e.currentTarget);
  const order=Object.entries(cart).map(([id,qty])=>`${PRODUCTS[id].name} x ${qty} — ${money(PRODUCTS[id].price*qty)}`).join('\n');
  const summary=`PEDIDO DE DEMOSTRACIÓN SAFEPILL\n\nNombre: ${d.get('name')}\nCorreo: ${d.get('email')}\nCiudad/Estado: ${d.get('location')}\n\n${order}\n\nTotal ilustrativo: ${money(totalCart())}\n\nEste pedido no es una compra real ni se ha realizado ningún cobro.`;
  closeOverlay('checkoutOverlay');
  const blob=new Blob([summary],{type:'text/plain;charset=utf-8'}); const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='pedido-demostracion-safepill.txt'; a.click(); URL.revokeObjectURL(url);
  cart={};saveCart();renderCart();e.currentTarget.reset();
  toast('¡Resumen de pedido de prueba generado!');
});

// SAFI — asistente local sin Gemini ni servidor externo.
// Responde con una base de conocimiento y coincidencia por intención/palabras clave.
const SAFI_KNOWLEDGE = [
  {id:'saludo', priority:1, keys:['hola','buenas','buenos dias','buenas tardes','buenas noches','hey','que onda','holi'], replies:[
    '¡Hola! 💚 Soy Safi, el asistente informativo de SafePill. Puedo explicarte el proyecto, los modelos, la tienda demostrativa, el carrito y cómo funciona esta página. ¿Qué te gustaría conocer?',
    '¡Qué gusto tenerte por aquí! 💚 Pregúntame sobre SafePill, sus modelos Mini, Pro y Premium, los recordatorios conceptuales o el funcionamiento del sitio.'
  ]},
  {id:'despedida', priority:1, keys:['adios','hasta luego','bye','nos vemos','me voy'], replies:['¡Gracias por visitar SafePill! 💚 Que tengas un excelente día.','¡Hasta pronto! Gracias por conocer nuestro proyecto. 💚']},
  {id:'gracias', priority:1, keys:['gracias','te agradezco','muy amable','thank you'], replies:['¡Con mucho gusto! 💚 Aquí estoy para resolver tus dudas sobre SafePill.','¡Para eso estoy! Gracias por interesarte en SafePill.']},
  {id:'que_es', priority:4, keys:['que es safepill','que es safe pill','define safepill','sobre safepill','proyecto safepill','de que trata','en que consiste','objetivo del proyecto','para que sirve safepill'], replies:[
    'SafePill es una propuesta tecnológica estudiantil que combina el concepto de un organizador inteligente de medicamentos con una plataforma digital informativa. Busca ayudar a que la organización de rutinas sea más clara. El dispositivo físico todavía está en etapa conceptual.',
    'SafePill es nuestro proyecto de un organizador de medicamentos acompañado de una experiencia web. La idea es apoyar la organización de rutinas; todavía estamos desarrollando y validando las funciones propuestas.'
  ]},
  {id:'problema', priority:3, keys:['problema','necesidad','por que crearon','porque crearon','que busca resolver','dificultad','olvidar medicamentos','organizar medicamentos'], replies:['SafePill parte de la necesidad de hacer más sencilla y clara la organización de rutinas de medicamentos, especialmente cuando una persona o cuidador necesita tener varias indicaciones presentes. Es una propuesta en desarrollo, no un dispositivo médico validado.']},
  {id:'publico', priority:3, keys:['para quien','quien puede usar','adulto mayor','personas mayores','familiares','cuidador','pacientes','usuarios','a quien va dirigido'], replies:['El proyecto considera a personas que necesitan organizar varios medicamentos y a familiares o cuidadores que les apoyan. La experiencia busca ser clara y fácil de entender. Aún hacen falta pruebas con usuarios para validar su facilidad de uso.']},
  {id:'modelos', priority:4, keys:['modelos','comparar','diferencia','cual conviene','cual es mejor','mini pro premium','tipos de safepill','versiones'], replies:['En la tienda de demostración aparecen tres conceptos:\n• SafePill Mini — $499 MXN: diseño compacto.\n• SafePill Pro — $799 MXN: mayor capacidad y pantalla conceptual.\n• SafePill Premium — $1,199 MXN: diseño más amplio para explorar funciones futuras.\nLos precios y modelos son ilustrativos; no son productos comerciales disponibles.']},
  {id:'mini', priority:3, keys:['mini','safepill mini','modelo pequeño','compacto'], replies:['SafePill Mini es el concepto compacto de la tienda demostrativa. Su precio mostrado es $499 MXN, únicamente ilustrativo. No está disponible para compra real.']},
  {id:'pro', priority:3, keys:['safepill pro','modelo pro','pantalla','mayor capacidad'], replies:['SafePill Pro es el modelo conceptual intermedio. La descripción de la tienda destaca una mayor capacidad y una pantalla conceptual. Su precio mostrado de $799 MXN es ilustrativo, no comercial.']},
  {id:'premium', priority:3, keys:['safepill premium','modelo premium','modelo amplio','mas amplio'], replies:['SafePill Premium es el diseño conceptual más amplio de la tienda demostrativa, pensado para explorar funciones futuras. El precio de $1,199 MXN es solo una referencia ilustrativa.']},
  {id:'precio', priority:4, keys:['precio','precios','cuanto cuesta','cuanto vale','costo','cuestan','mxn','pesos'], replies:['Los precios que aparecen en la demostración son Mini $499 MXN, Pro $799 MXN y Premium $1,199 MXN. Son cifras ilustrativas para mostrar cómo se vería la tienda; no son cotizaciones ni precios de venta reales.']},
  {id:'venta', priority:5, keys:['comprar de verdad','esta a la venta','a la venta','disponible','puedo comprar','donde comprar','venta real','stock','inventario','existencias','envio','envios','entrega','cuando sale','cuando estara listo'], replies:['Por ahora SafePill es un proyecto estudiantil en desarrollo. La tienda es una demostración: no hay ventas, inventario, envíos ni disponibilidad comercial confirmados.']},
  {id:'carrito', priority:4, keys:['carrito','agregar al carrito','añadir al carrito','quitar producto','eliminar producto','cambiar cantidad','ver carrito'], replies:['Para usar el carrito: 1) ve a “Comprar”, 2) presiona “Agregar al carrito” en el modelo que quieras explorar, 3) abre “Ver carrito” para cambiar cantidades o eliminar artículos. Es una simulación local, no una compra real.']},
  {id:'pedido', priority:4, keys:['pedido','continuar','checkout','resumen','finalizar compra','hacer pedido','formulario de pedido'], replies:['El botón para continuar genera un resumen descargable de demostración con los modelos y cantidades seleccionados. No envía una orden comercial, no reserva productos y no realiza cobros.']},
  {id:'pago', priority:5, keys:['pagar','pago','tarjeta','transferencia','cobro','paypal','metodo de pago','metodos de pago'], replies:['No se aceptan pagos en esta página. El carrito y el pedido son simulaciones para mostrar el recorrido de la tienda; no se solicitan datos bancarios ni se realiza ningún cobro.']},
  {id:'funciona', priority:3, keys:['como funciona','funcionamiento','como se usa','como se utilizaria','pasos','proceso'], replies:['La propuesta contempla organizar una rutina con base en las indicaciones del profesional de salud y consultar recordatorios. El sitio actual explica el concepto, pero no configura horarios reales ni controla un dispositivo físico.']},
  {id:'recordatorios', priority:4, keys:['recordatorio','recordatorios','alarma','alarmas','notificacion','notificaciones','aviso','avisos','horario'], replies:['El concepto contempla recordatorios asociados a horarios definidos por el usuario o cuidador. Importante: esta página no programa alarmas reales, no envía notificaciones y no está conectada a un pastillero físico.']},
  {id:'dispositivo', priority:4, keys:['dispositivo','pastillero','hardware','aparato','fisico','prototipo','fabricado','construido'], replies:['El organizador físico de SafePill sigue siendo un concepto en desarrollo. Las imágenes muestran propuestas visuales; no significan que exista un dispositivo funcional fabricado o probado.']},
  {id:'sensores', priority:4, keys:['sensor','sensores','bluetooth','wifi','conexion al celular','conectado al celular','detecta','detectar si tome'], replies:['No podemos afirmar que SafePill tenga sensores, Bluetooth, Wi-Fi o detección automática de tomas. Esas funciones no están implementadas ni validadas en la versión actual.']},
  {id:'toma_confirmacion', priority:5, keys:['confirma que tome','sabe si tome','detecta si tome','verifica si tome','registra que tome','ya me la tome'], replies:['No. SafePill no puede confirmar si una persona tomó un medicamento. La propuesta no debe utilizarse como prueba de una toma ni sustituir las indicaciones del profesional de salud.']},
  {id:'ia', priority:4, keys:['inteligencia artificial','como funciona la ia','que ia','modelo de ia','gemini','chatgpt','usa ia','es una ia','eres una ia','asistente virtual','chatbot'], replies:['Soy Safi, un asistente informativo programado dentro de la página. En esta versión no estoy conectado a Gemini ni a otro modelo externo: identifico temas y palabras clave para seleccionar respuestas de una base de conocimiento. Puedo orientar sobre SafePill, pero no generar conocimiento ilimitado.']},
  {id:'limitaciones', priority:3, keys:['que puedes hacer','que sabes hacer','ayuda','en que me ayudas','tus funciones','capacidades','que preguntas'], replies:['Puedo explicar qué es SafePill, sus objetivos, modelos conceptuales, precios ilustrativos, recordatorios propuestos, límites actuales, carrito, pedido de demostración, privacidad y contacto. Si tu pregunta no coincide con esos temas, puedo pedirte que la reformules.']},
  {id:'seguridad_medica', priority:10, keys:['que dosis','cuanta dosis','cuanto debo tomar','que medicamento tomo','que medicina tomo','puedo tomar','debo tomar','olvide tomar','olvido una dosis','me tome una dosis','me tome dos','tomar mas','dejar de tomar','suspender el tratamiento','cambiar mi dosis','efecto secundario','reaccion adversa','interaccion de medicamentos','tengo sintomas','me duele','es seguro tomar','puedo mezclar'], replies:['Por seguridad, no puedo indicar qué medicamento tomar, calcular dosis, cambiar horarios ni aconsejar suspender un tratamiento. SafePill tampoco sustituye a un médico o farmacéutico. Para una duda sobre tu receta, una dosis olvidada, síntomas o posibles interacciones, consulta directamente a un profesional de salud. Si parece una emergencia, busca ayuda de emergencia local.']},
  {id:'emergencia', priority:12, keys:['emergencia','sobredosis','tome demasiadas','tome muchas','intoxicacion','no puedo respirar','reaccion grave'], replies:['Si alguien podría estar en peligro inmediato o presenta una reacción grave, busca ayuda de emergencia local ahora mismo. No esperes una respuesta de este asistente. SafePill no es un servicio médico de urgencias.']},
  {id:'privacidad', priority:4, keys:['privacidad','datos','mis datos','informacion personal','guarda','almacena','almacenamiento','cookies','rastrea'], replies:['Esta versión del asistente funciona localmente en tu navegador y no envía tus preguntas a Gemini ni a un servidor de IA. El carrito se guarda en el almacenamiento local del navegador. Evita escribir datos personales, información médica o datos sensibles en el chat.']},
  {id:'contacto', priority:3, keys:['contacto','contactar','correo','email','equipo','comunicarme','solicitar informacion','formulario','duda al equipo'], replies:['Puedes usar el botón “Solicitar información” de la página para abrir el formulario de contacto. El formulario prepara un correo en la aplicación predeterminada; el equipo todavía debe configurar su dirección oficial.']},
  {id:'pagina', priority:3, keys:['navegar','secciones','menu','pagina web','sitio web','donde encuentro','donde esta','como llego'], replies:['Puedes navegar desde el menú superior: Inicio presenta el proyecto; Producto muestra el concepto; Cómo funciona explica la propuesta; Asistente IA abre este chat; y Comprar lleva a la tienda demostrativa.']},
  {id:'proyecto_estado', priority:4, keys:['estado del proyecto','en desarrollo','avance','terminado','finalizado','listo','progreso'], replies:['SafePill es un proyecto en desarrollo. La página web presenta la propuesta y una tienda simulada. El dispositivo físico y varias funciones planteadas aún requieren desarrollo, pruebas y validación.']},
  {id:'certificacion', priority:5, keys:['certificado','certificacion','cofepris','aprobado','validado','clinico','pruebas clinicas','garantia'], replies:['No afirmamos que SafePill tenga certificaciones médicas, aprobación sanitaria, validación clínica ni pruebas de seguridad concluidas. Es una propuesta estudiantil que todavía necesita desarrollo y evaluación.']},
  {id:'competencia', priority:2, keys:['concurso','innovatiq','digital cup','competencia','proyecto escolar','estudiantes','equipo creador'], replies:['SafePill es una propuesta desarrollada por un equipo estudiantil. La página funciona como presentación del concepto y demostración de algunas interacciones digitales.']},
  {id:'idioma', priority:1, keys:['ingles','english','idioma','language'], replies:['Por ahora, esta versión del asistente responde principalmente en español. ¡Gracias por tu comprensión! 💚']},
  {id:'ubicacion', priority:2, keys:['donde estan','ubicacion','direccion','donde se encuentran'], replies:['La página no publica una dirección física oficial del equipo. Para solicitar información, utiliza el formulario de contacto del sitio.']},
  {id:'sugerencia', priority:1, keys:['sugerencia','recomendacion para el sitio','mejorar la pagina','comentario'], replies:['¡Gracias por querer ayudar a mejorar SafePill! Puedes enviar tus comentarios mediante el formulario “Solicitar información”. Las sugerencias del público pueden ayudarnos a identificar qué debemos aclarar o mejorar.']},
  {id:'no_entendi', priority:0, keys:[], replies:['No encontré una respuesta segura y confiable para esa pregunta. Puedo ayudarte con el proyecto, los modelos, la tienda de demostración, los recordatorios conceptuales, privacidad o contacto. ¿Puedes expresarlo de otra manera?']}
];

function normalizeSafi(value) {
  return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}
function pickSafiReply(item, question) {
  const replies=item.replies;
  // Selección estable pero variada según la pregunta, sin necesitar servicios externos.
  let hash=0; for (const ch of question) hash=(hash*31+ch.charCodeAt(0))>>>0;
  return replies[hash % replies.length];
}
function answerQuestion(question) {
  const q=normalizeSafi(question);
  if (!q) return 'Escribe una pregunta y con gusto te ayudo. 💚';
  // Prioridad máxima para urgencias y temas médicos: nunca se responde con información comercial por coincidencia accidental.
  const normalizedItems=SAFI_KNOWLEDGE.map(item=>({...item, normalizedKeys:item.keys.map(normalizeSafi)}));
  const scored=normalizedItems.map(item=>{
    let score=0;
    for (const key of item.normalizedKeys) {
      if (!key) continue;
      if (q.includes(key)) score=Math.max(score, item.priority*10 + Math.min(key.length,30));
      else {
        const words=key.split(' ').filter(w=>w.length>3);
        if (words.length) {
          const hits=words.filter(w=>q.split(' ').includes(w)).length;
          if (hits===words.length) score=Math.max(score,item.priority*10+hits*2);
          else if (hits>=2) score=Math.max(score,item.priority*10+hits);
        }
      }
    }
    return {item,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  const chosen=scored[0]?.item || SAFI_KNOWLEDGE.find(x=>x.id==='no_entendi');
  return pickSafiReply(chosen, q);
}
function appendChat(text,who) {
  const node=document.createElement('div');
  node.className=`chat-message ${who}`;
  node.textContent=text;
  $('#chatMessages').appendChild(node);
  $('#chatMessages').scrollTop=$('#chatMessages').scrollHeight;
  return node;
}
function sendChat(text) {
  const clean=text.trim();
  if(!clean) return;
  appendChat(clean,'user');
  appendChat(answerQuestion(clean),'bot');
  $('#suggestions').style.display='none';
}
$('#chatForm').addEventListener('submit',e=>{
  e.preventDefault();
  const value=$('#chatInput').value;
  $('#chatInput').value='';
  sendChat(value);
});
$$('#suggestions button').forEach(b=>b.addEventListener('click',()=>sendChat(b.dataset.question)));
$('#clearChat').addEventListener('click',()=>{
  $('#chatMessages').innerHTML='<div class="chat-message bot">¡Hola de nuevo! 💚 Soy Safi. Puedo ayudarte a conocer SafePill y navegar por esta demostración. ¿Qué te gustaría saber?</div>';
  $('#suggestions').style.display='flex';
});
$('#menuToggle').addEventListener('click',()=>{const open=$('#navLinks').classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(open));});
$$('#navLinks a').forEach(a=>a.addEventListener('click',()=>$('#navLinks').classList.remove('open')));
renderCart();
