const n=(a,r,t,l)=>({link:[{rel:"canonical",href:a.value},...l.value.map(({code:e})=>({rel:"alternate",href:`${r}/${e}${t.path}`,hreflang:e}))]});export{n as g};
