function showForm(){
    const form = document.getElementById("form")
    const formBg = document.getElementById("formBg")

    form.classList.remove("hidden");
    form.className+= " block"
    
    formBg.classList.remove("hidden");
    formBg.className+= " block"
}