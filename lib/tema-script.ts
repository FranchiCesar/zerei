export const CHAVE_TEMA = "zerei:tema";

/** Roda antes da página pintar, para não piscar o tema errado. */
export const SCRIPT_TEMA = `try{var t=localStorage.getItem("${CHAVE_TEMA}");if(t==="claro")document.documentElement.dataset.theme="light";if(t==="escuro")document.documentElement.dataset.theme="dark"}catch(e){}`;
