document.getElementById('addMedicine').addEventListener('click', function() {
    var medicineTemplate = document.querySelector('.Detail');
    var newMedicine = medicineTemplate.cloneNode(true);
    var form = document.querySelector('.form');
    form.insertBefore(newMedicine, form.lastElementChild);
});