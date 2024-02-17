function hiddenForm(){
    const form = document.getElementById("form")
    const formBg = document.getElementById("formBg")
    
    form.classList.remove("block");
    form.className+= " hidden"
    
    formBg.classList.remove("block");
    formBg.className+= " hidden"
}