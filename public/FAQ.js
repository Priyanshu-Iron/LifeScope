const show=document.getElementsByClassName('accordian')

Array.from(show).forEach(e=>{
    e.addEventListener('click',()=>{
        if(e.classList.contains("active")){
            e.classList.remove("active")}
            else{
                e.classList.add("active")
            }
    })
})