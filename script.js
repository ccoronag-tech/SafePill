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

function appendChat(text,who) {
  const node=document.createElement('div');
  node.className=`chat-message ${who}`;
  node.textContent=text;
  $('#chatMessages').appendChild(node);
  $('#chatMessages').scrollTop=$('#chatMessages').scrollHeight;
  return node;
}
let chatHistory=[];
let chatBusy=false;
async function sendChat(text) {
  const clean=text.trim();
  if(!clean || chatBusy) return;
  appendChat(clean,'user');
  $('#suggestions').style.display='none';
  const pending=appendChat('Safi está pensando…','bot');
  chatBusy=true;
  $('#chatInput').disabled=true;
  $('#chatForm button[type="submit"]').disabled=true;
  try {
    const response=await fetch('/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:clean,history:chatHistory.slice(-8)})
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error || 'No se pudo conectar con Gemini.');
    pending.textContent=data.reply || 'No recibí una respuesta. Intenta de nuevo.';
    chatHistory.push({role:'user',text:clean},{role:'model',text:pending.textContent});
  } catch(error) {
    pending.textContent='No pude conectarme con Gemini. Comprueba que el servidor de SafePill esté iniciado y que la clave de Gemini esté configurada. Si el problema continúa, revisa la consola del servidor.';
    console.error('Error de Safi:',error);
  } finally {
    chatBusy=false;
    $('#chatInput').disabled=false;
    $('#chatForm button[type="submit"]').disabled=false;
    $('#chatInput').focus();
  }
}
$('#chatForm').addEventListener('submit',e=>{
  e.preventDefault();
  const value=$('#chatInput').value;
  $('#chatInput').value='';
  sendChat(value);
});
$$('#suggestions button').forEach(b=>b.addEventListener('click',()=>sendChat(b.dataset.question)));
$('#clearChat').addEventListener('click',()=>{
  chatHistory=[];
  $('#chatMessages').innerHTML='<div class="chat-message bot">¡Hola de nuevo! 💚 ¿Qué te gustaría saber sobre SafePill?</div>';
  $('#suggestions').style.display='flex';
});
$('#menuToggle').addEventListener('click',()=>{const open=$('#navLinks').classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(open));});
$$('#navLinks a').forEach(a=>a.addEventListener('click',()=>$('#navLinks').classList.remove('open')));
renderCart();
