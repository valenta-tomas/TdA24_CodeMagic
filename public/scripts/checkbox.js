document.addEventListener('DOMContentLoaded', function() {
    const value = document.querySelector('.value');
    let listArray = [];
  
    const checkboxes = document.querySelectorAll('.checkbox');
  
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('click', function() {
        if (this.checked === true) {
          listArray.push(this.value);
          value.textContent = listArray.join(', ');
        } else {
          listArray = listArray.filter((e) => e !== this.value);
          value.textContent = listArray.join(', ');
        }
      });
    });
  });