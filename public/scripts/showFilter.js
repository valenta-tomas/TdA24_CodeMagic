function showFilter(){
    const filter = document.getElementById("filterShow")
    filter.classList.remove("hidden")
    filter.classList.remove("sticky")
    filter.className += " fixed top-0 z-100"
    console.log(filter.classList)
}
function hiddeFilter(){
    const filter = document.getElementById("filterShow")
    filter.classList.remove("fixed")
    filter.classList.remove("top-0")
    filter.className += " hidden sticky"
    console.log(filter.classList)
}