const q=s=>document.querySelector(s), qa=s=>document.querySelectorAll(s);
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("show")}),{threshold:.12});
qa(".reveal").forEach(x=>io.observe(x));
const cursor=q(".cursor"),dot=q(".cursor-dot");
window.addEventListener("pointermove",e=>{cursor.style.left=e.clientX+"px";cursor.style.top=e.clientY+"px";dot.style.left=e.clientX+"px";dot.style.top=e.clientY+"px"});
qa("a,.work-card,.skills-wrap span").forEach(el=>el.addEventListener("mouseenter",()=>{cursor.style.transform="translate(-50%,-50%) scale(1.7)";cursor.style.background="#315cff18"}));
qa("a,.work-card,.skills-wrap span").forEach(el=>el.addEventListener("mouseleave",()=>{cursor.style.transform="translate(-50%,-50%) scale(1)";cursor.style.background="transparent"}));
// gentle parallax for the hero identity card
const card=q(".portrait-card");
window.addEventListener("pointermove",e=>{if(innerWidth<800)return;const x=(e.clientX/innerWidth-.5)*8,y=(e.clientY/innerHeight-.5)*8;card.style.transform=`perspective(900px) rotateY(${x}deg) rotateX(${-y}deg)`});
window.addEventListener("scroll",()=>{document.documentElement.style.setProperty("--scroll",scrollY)});
