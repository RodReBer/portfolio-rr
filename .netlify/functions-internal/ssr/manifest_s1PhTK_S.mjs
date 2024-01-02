import '@astrojs/internal-helpers/path';
import 'cookie';
import 'kleur/colors';
import 'string-width';
import 'html-escaper';
import 'clsx';
import './chunks/astro_7hEmDlAW.mjs';
import { compile } from 'path-to-regexp';

if (typeof process !== "undefined") {
  let proc = process;
  if ("argv" in proc && Array.isArray(proc.argv)) {
    if (proc.argv.includes("--verbose")) ; else if (proc.argv.includes("--silent")) ; else ;
  }
}

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    })
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  return {
    ...serializedManifest,
    assets,
    componentMetadata,
    clientDirectives,
    routes
  };
}

const manifest = deserializeManifest({"adapterName":"@astrojs/netlify","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"inline","value":"const p=document.querySelectorAll(\"#landing-header a\"),e=document.querySelector(\"#menu-backdrop\");p.forEach(t=>{t.addEventListener(\"mouseenter\",()=>{const{left:i,top:r,width:o,height:n}=t.getBoundingClientRect();e.style.setProperty(\"--left\",`${i}px`),e.style.setProperty(\"--top\",`${r}px`),e.style.setProperty(\"--width\",`${o}px`),e.style.setProperty(\"--height\",`${n}px`),e.style.opacity=\"1\",e.style.visibility=\"visible\"}),t.addEventListener(\"mouseleave\",()=>{e.style.opacity=\"0\",e.style.visibility=\"hidden\"})});let a=document.querySelector(\"button\"),s=document.querySelector(\".translate-x-0\"),l=document.querySelector(\".opacity-100\"),c=document.querySelector(\".opacity-0\");a.addEventListener(\"click\",function(){let t=document.documentElement;a.getAttribute(\"aria-checked\")===\"false\"?(a.setAttribute(\"aria-checked\",\"true\"),a.classList.replace(\"dark:bg-orange-400/70\",\"bg-violet-500/70\"),s.classList.replace(\"translate-x-0\",\"translate-x-5\"),l.classList.replace(\"opacity-100\",\"opacity-0\"),c.classList.replace(\"opacity-0\",\"opacity-100\"),t.classList.replace(\"dark\",\"light\")):(a.setAttribute(\"aria-checked\",\"false\"),a.classList.replace(\"bg-violet-500/70\",\"dark:bg-orange-400/70\"),s.classList.replace(\"translate-x-5\",\"translate-x-0\"),l.classList.replace(\"opacity-0\",\"opacity-100\"),c.classList.replace(\"opacity-100\",\"opacity-0\"),t.classList.replace(\"light\",\"dark\"))});\n"}],"styles":[{"type":"external","src":"/_astro/index.zLjiBh2F.css"}],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/Rodri pc/OneDrive/Escritorio/proyectos/portfolio-rr/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var i=t=>{let e=async()=>{await(await t())()};\"requestIdleCallback\"in window?window.requestIdleCallback(e):setTimeout(e,200)};(self.Astro||(self.Astro={})).idle=i;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var r=(i,c,s)=>{let n=async()=>{await(await i())()},t=new IntersectionObserver(e=>{for(let o of e)if(o.isIntersecting){t.disconnect(),n();break}});for(let e of s.children)t.observe(e)};(self.Astro||(self.Astro={})).visible=r;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000empty-middleware":"_empty-middleware.mjs","/node_modules/astro/dist/assets/endpoint/generic.js":"chunks/pages/generic_pd2vrVRq.mjs","/src/pages/index.astro":"chunks/pages/index_2Z7pRqLs.mjs","\u0000@astrojs-manifest":"manifest_s1PhTK_S.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"chunks/generic_VB_1J_8o.mjs","\u0000@astro-page:src/pages/index@_@astro":"chunks/index_4P93AoiV.mjs","/astro/hoisted.js?q=0":"_astro/hoisted.GEUeGJ6F.js","astro:scripts/before-hydration.js":""},"assets":["/_astro/onest-latin-ext-wght-normal.NATBPiDw.woff2","/_astro/onest-latin-wght-normal.ycwkluYs.woff2","/_astro/onest-cyrillic-wght-normal.okE7jKFK.woff2","/_astro/index.zLjiBh2F.css","/about-me.webp","/about-me2.webp","/projects/capdi-dark.webp","/projects/capdi-light.webp","/projects/reina-reyes-dark.webp","/projects/reina-reyes-light.webp"]});

export { manifest };
